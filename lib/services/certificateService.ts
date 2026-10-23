import crypto from "crypto";
import { ObjectId } from "mongodb";
import { nanoid } from "nanoid";
import { getDb } from "../db/client";
import { CertificateRecord, EventWinnerEntry } from "../db/models/types";
import { certificateRepository } from "../repositories/CertificateRepository";
import { getCanonicalBaseUrl } from "../constants";

const CERT_SECRET = process.env.CERT_SECRET_KEY || process.env.JWT_SECRET || "caravan26_rimt_cert_secret_key";

export interface EligibleEventItem {
  eventId: string;
  eventName: string;
  categoryId?: string;
  categoryName: string;
  categoryLetter: string;
  position: 0 | 1 | 2 | 3;
  awardTitle: string;
  templateUrl: string;
  suffix: string;
  registrationId: string;
  hasClaimed: boolean;
  claimedCertificateId?: string;
}

export class CertificateService {
  /**
   * Derives Category Letter according to Caravan '26 specification:
   * T = Technical, C = Cultural, B = Business, F = Fine Arts, L = Literary, M = Media
   */
  getCategoryLetter(categoryNameOrSlug: string = ""): string {
    const text = categoryNameOrSlug.toLowerCase();
    if (text.includes("tech")) return "T";
    if (text.includes("cultur")) return "C";
    if (text.includes("busin")) return "B";
    if (text.includes("fine") || text.includes("art")) return "F";
    if (text.includes("liter")) return "L";
    if (text.includes("media") || text.includes("film") || text.includes("photo")) return "M";
    const firstChar = text.trim().charAt(0).toUpperCase();
    return firstChar || "T";
  }

  getAwardTitle(position: 0 | 1 | 2 | 3): string {
    switch (position) {
      case 1:
        return "1st Position - Winner";
      case 2:
        return "2nd Position - 1st Runner Up";
      case 3:
        return "3rd Position - 2nd Runner Up";
      default:
        return "Certificate of Participation";
    }
  }

  getTemplateUrl(position: 0 | 1 | 2 | 3): string {
    switch (position) {
      case 1:
        return "/certificate/1st.png";
      case 2:
        return "/certificate/2nd.png";
      case 3:
        return "/certificate/3rd.png";
      default:
        return "/certificate/paticipation.png";
    }
  }

  generateHmac(certificateId: string, studentName: string, eventId: string, position: number): string {
    return crypto
      .createHmac("sha256", CERT_SECRET)
      .update(`${certificateId}:${studentName.trim().toLowerCase()}:${eventId}:${position}`)
      .digest("hex");
  }

  /**
   * Fetches sorted list of distinct universities that have registered
   */
  async getDistinctUniversities(): Promise<string[]> {
    const db = await getDb();
    const rawList = await db
      .collection("registrations")
      .distinct("university", { status: { $ne: "rejected" } });

    const universities = (rawList as string[])
      .filter((u) => typeof u === "string" && u.trim().length >= 3 && !/^\d+$/.test(u.trim()))
      .map((u) => u.trim());

    // Deduplicate case-insensitively
    const seen = new Set<string>();
    const uniqueList: string[] = [];
    for (const u of universities) {
      const lower = u.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueList.push(u);
      }
    }

    return uniqueList.sort((a, b) => a.localeCompare(b));
  }

  /**
   * Automatically detects a student's registered university based on mobile number and optional name.
   */
  async detectStudentUniversity(
    mobile: string,
    name?: string
  ): Promise<{
    found: boolean;
    university?: string;
    studentName?: string;
    detectedUniversities: string[];
  }> {
    const cleanMobile = mobile.trim().replace(/\D/g, "");
    const noZero = cleanMobile.replace(/^0+/, "");
    const last10 = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;
    const mobileVariants = Array.from(new Set([cleanMobile, noZero, last10].filter((m) => m.length >= 7)));

    const cleanName = (name || "").trim().toLowerCase();
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedName = escapeRegex(cleanName);

    if (mobileVariants.length === 0 && cleanName.length < 2) {
      return { found: false, detectedUniversities: [] };
    }

    const orConditions: any[] = [];
    for (const m of mobileVariants) {
      orConditions.push({ mobile: m });
      orConditions.push({ "teamDetails.membersInfo": { $regex: m } });
      orConditions.push({ "selectedEvents.teamDetails.membersInfo": { $regex: m } });
    }

    if (cleanName.length >= 2) {
      orConditions.push({ studentName: { $regex: new RegExp(escapedName, "i") } });
      orConditions.push({ "teamDetails.leaderName": { $regex: new RegExp(escapedName, "i") } });
      orConditions.push({ "teamDetails.membersInfo": { $regex: new RegExp(escapedName, "i") } });
      orConditions.push({ "selectedEvents.teamDetails.membersInfo": { $regex: new RegExp(escapedName, "i") } });
    }

    const db = await getDb();
    const registrations = await db
      .collection("registrations")
      .find({
        status: { $ne: "rejected" },
        $or: orConditions,
      })
      .toArray();

    if (!registrations || registrations.length === 0) {
      return { found: false, detectedUniversities: [] };
    }

    // Sort registrations so that exact/closer matches come first
    registrations.sort((a, b) => {
      const getMembers = (doc: any) =>
        [
          doc.teamDetails?.membersInfo || "",
          ...(Array.isArray(doc.selectedEvents)
            ? doc.selectedEvents.map((e: any) => e.teamDetails?.membersInfo || "")
            : []),
        ]
          .join(" ")
          .toLowerCase();

      const aMembers = getMembers(a);
      const bMembers = getMembers(b);
      const aName = (a.studentName || "").toLowerCase();
      const bName = (b.studentName || "").toLowerCase();
      const aLead = (a.teamDetails?.leaderName || "").toLowerCase();
      const bLead = (b.teamDetails?.leaderName || "").toLowerCase();

      let aScore = 0;
      let bScore = 0;

      if (cleanName.length >= 2) {
        if (aName.includes(cleanName) || cleanName.includes(aName)) aScore += 3;
        if (aLead.includes(cleanName) || cleanName.includes(aLead)) aScore += 3;
        if (aMembers.includes(cleanName)) aScore += 4; // High priority for team member name match

        if (bName.includes(cleanName) || cleanName.includes(bName)) bScore += 3;
        if (bLead.includes(cleanName) || cleanName.includes(bLead)) bScore += 3;
        if (bMembers.includes(cleanName)) bScore += 4;
      }

      for (const m of mobileVariants) {
        if (a.mobile === m) aScore += 3;
        if (aMembers.includes(m)) aScore += 4;
        if (b.mobile === m) bScore += 3;
        if (bMembers.includes(m)) bScore += 4;
      }

      return bScore - aScore;
    });

    const detectedUniversities: string[] = [];
    const seen = new Set<string>();

    for (const reg of registrations) {
      const u = (reg.university || "").trim();
      if (u && !seen.has(u.toLowerCase())) {
        seen.add(u.toLowerCase());
        detectedUniversities.push(u);
      }
    }

    const topReg = registrations[0];
    const topUniv = (topReg?.university || "").trim();
    const topName = (topReg?.studentName || topReg?.teamDetails?.leaderName || "").trim();

    return {
      found: detectedUniversities.length > 0,
      university: topUniv || detectedUniversities[0],
      studentName: topName || undefined,
      detectedUniversities,
    };
  }

  /**
   * Checks whether a student was marked present in the event arena (attendance collection)
   */
  async isParticipantPresent(registrationId: ObjectId | string, eventId: ObjectId | string): Promise<boolean> {
    const db = await getDb();
    const regObjId = typeof registrationId === "string" ? (ObjectId.isValid(registrationId) ? new ObjectId(registrationId) : null) : registrationId;
    const evtObjId = typeof eventId === "string" ? (ObjectId.isValid(eventId) ? new ObjectId(eventId) : null) : eventId;

    const queries: any[] = [];
    if (regObjId && evtObjId) {
      queries.push({ registrationId: regObjId, eventId: evtObjId });
    }
    queries.push({ registrationId: registrationId.toString(), eventId: eventId.toString() });
    if (regObjId) {
      queries.push({ registrationId: regObjId, eventId: eventId.toString() });
    }
    if (evtObjId) {
      queries.push({ registrationId: registrationId.toString(), eventId: evtObjId });
    }

    const record = await db.collection("attendance").findOne({ $or: queries });
    return !!record;
  }

  /**
   * Look up eligible events for a student (individual or team member) by Name, Mobile, and optional University.
   * If mobile matches a registration or team member, university is auto-inherited.
   * ONLY returns events where attendance was marked PRESENT.
   */
  async lookupStudentEvents(
    name: string,
    mobile: string,
    university?: string
  ): Promise<{
    student: { name: string; university: string; mobile: string };
    events: EligibleEventItem[];
    hasSubmittedFeedback: boolean;
  }> {
    const db = await getDb();
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const cleanMobile = mobile.trim().replace(/\D/g, "");
    const noZero = cleanMobile.replace(/^0+/, "");
    const last10 = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;
    const mobileVariants = Array.from(new Set([cleanMobile, noZero, last10].filter((m) => m.length >= 7)));

    const cleanName = name.trim();
    const cleanUniv = (university || "").trim();
    const escapedUniv = escapeRegex(cleanUniv);
    const escapedName = escapeRegex(cleanName);

    const orConditions: any[] = [];

    // Search by all mobile variants in primary mobile and in all team member records
    for (const m of mobileVariants) {
      orConditions.push({ mobile: m });
      orConditions.push({ "teamDetails.membersInfo": { $regex: m } });
      orConditions.push({ "selectedEvents.teamDetails.membersInfo": { $regex: m } });
    }

    // Search by student name in primary registrant, team leader, or member roster
    if (cleanName.length >= 2) {
      orConditions.push({ studentName: { $regex: new RegExp(escapedName, "i") } });
      orConditions.push({ "teamDetails.leaderName": { $regex: new RegExp(escapedName, "i") } });
      orConditions.push({ "teamDetails.membersInfo": { $regex: new RegExp(escapedName, "i") } });
      orConditions.push({ "selectedEvents.teamDetails.membersInfo": { $regex: new RegExp(escapedName, "i") } });
    }

    let registrations = await db
      .collection("registrations")
      .find({
        status: { $ne: "rejected" },
        $or: orConditions,
      })
      .toArray();

    // Fallback strategy: if nothing matched with orConditions, attempt university + name fallback
    if (registrations.length === 0 && cleanUniv) {
      const fallbackQuery: any = {
        university: { $regex: new RegExp(`^${escapedUniv}$`, "i") },
        status: { $ne: "rejected" },
        $or: [
          { studentName: { $regex: new RegExp(escapedName, "i") } },
          { "teamDetails.leaderName": { $regex: new RegExp(escapedName, "i") } },
          { "teamDetails.membersInfo": { $regex: new RegExp(escapedName, "i") } },
          { "selectedEvents.teamDetails.membersInfo": { $regex: new RegExp(escapedName, "i") } },
        ],
      };
      registrations = await db.collection("registrations").find(fallbackQuery).toArray();
    }

    if (!registrations || registrations.length === 0) {
      return {
        student: { name: cleanName, university: cleanUniv, mobile: cleanMobile },
        events: [],
        hasSubmittedFeedback: false,
      };
    }

    // Filter registrations where either mobile matches OR student name matches
    const matchingRegs = registrations.filter((r) => {
      const allMembersInfo = [
        r.teamDetails?.membersInfo || "",
        ...(Array.isArray(r.selectedEvents)
          ? r.selectedEvents.map((e: any) => e.teamDetails?.membersInfo || "")
          : []),
      ].join(" ");

      const rMobile = (r.mobile || "").replace(/\D/g, "");
      const rName = r.studentName || "";
      const rLeader = r.teamDetails?.leaderName || "";

      const mobileMatch = mobileVariants.some(
        (m) => rMobile.includes(m) || allMembersInfo.includes(m)
      );

      const nameMatch =
        rName.toLowerCase().includes(cleanName.toLowerCase()) ||
        cleanName.toLowerCase().includes(rName.toLowerCase()) ||
        rLeader.toLowerCase().includes(cleanName.toLowerCase()) ||
        allMembersInfo.toLowerCase().includes(cleanName.toLowerCase());

      return mobileMatch || nameMatch;
    });

    const targetRegs = matchingRegs.length > 0 ? matchingRegs : registrations;

    // Determine the student's canonical registered university from the top registration
    const canonicalUniversity = targetRegs[0]?.university?.trim() || cleanUniv;

    // Load all results / declared winners
    const allResults = await certificateRepository.findAllResults();
    const resultsByEventId = new Map(allResults.map((r) => [r.eventId, r]));

    const eventsList: EligibleEventItem[] = [];
    const processedEvents = new Set<string>();

    for (const reg of targetRegs) {
      const regEvents = Array.isArray(reg.selectedEvents) ? reg.selectedEvents : [];

      for (const evt of regEvents) {
        const eventId = String(evt.eventId || evt._id || "");
        const eventName = String(evt.eventName || evt.name || "Event");
        const categoryName = String(evt.categoryName || "General");
        const categoryLetter = this.getCategoryLetter(categoryName);

        const key = `${reg._id.toString()}_${eventId}`;
        if (processedEvents.has(key)) continue;
        processedEvents.add(key);

        // Attendance Gate: Student must be marked present in the event arena!
        const isPresent = await this.isParticipantPresent(reg._id, eventId);
        if (!isPresent) {
          // Silently skip events where attendance has not been marked present
          continue;
        }

        // Determine Position: Check if declared winner
        let position: 0 | 1 | 2 | 3 = 0;
        const resultDoc = resultsByEventId.get(eventId);

        if (resultDoc && Array.isArray(resultDoc.winners)) {
          const winner = resultDoc.winners.find((w: EventWinnerEntry) => {
            const wNameMatch =
              w.studentName.toLowerCase().includes(cleanName.toLowerCase()) ||
              cleanName.toLowerCase().includes(w.studentName.toLowerCase());
            const wUnivMatch =
              !w.university ||
              !canonicalUniversity ||
              w.university.toLowerCase().includes(canonicalUniversity.toLowerCase()) ||
              canonicalUniversity.toLowerCase().includes(w.university.toLowerCase());
            const wMobileMatch = w.mobile && w.mobile.replace(/\D/g, "") === cleanMobile;
            const wRegMatch = w.registrationId && w.registrationId.toString() === reg._id.toString();

            return (wNameMatch && wUnivMatch) || wMobileMatch || wRegMatch;
          });

          if (winner) {
            position = winner.position;
          }
        }

        const awardTitle = this.getAwardTitle(position);
        const templateUrl = this.getTemplateUrl(position);
        const suffix = `[${categoryLetter}.${position}]`;

        // Check if certificate already exists
        const existingCert = await certificateRepository.findExistingCertificate(
          reg._id,
          eventId,
          cleanName
        );

        eventsList.push({
          eventId,
          eventName,
          categoryId: evt.categoryId ? String(evt.categoryId) : undefined,
          categoryName,
          categoryLetter,
          position,
          awardTitle,
          templateUrl,
          suffix,
          registrationId: reg._id.toString(),
          hasClaimed: !!existingCert,
          claimedCertificateId: existingCert?.certificateId,
        });
      }
    }

    // Check if participant has submitted feedback
    const feedbackDoc = await db.collection("feedback").findOne({
      $or: [
        { cleanMobile: last10 },
        { mobile: cleanMobile },
        { mobile: mobile.trim() },
      ],
    });

    return {
      student: { name: cleanName, university: canonicalUniversity, mobile: cleanMobile },
      events: eventsList,
      hasSubmittedFeedback: !!feedbackDoc,
    };
  }

  /**
   * Generates or fetches an existing official CertificateRecord
   */
  async generateCertificate(params: {
    registrationId: string;
    eventId: string;
    studentName: string;
    mobile: string;
    university: string;
    origin?: string;
  }): Promise<CertificateRecord> {
    const { registrationId, eventId, studentName, mobile, university, origin = "" } = params;

    const regObjectId = new ObjectId(registrationId);

    // Enforce attendance check: Student must be marked present in the event arena!
    const isPresent = await this.isParticipantPresent(regObjectId, eventId);
    if (!isPresent) {
      throw new Error("Certificate cannot be issued: Attendance was not marked present for this event.");
    }

    // 1. Check if certificate already generated (Idempotency)
    const existing = await certificateRepository.findExistingCertificate(
      regObjectId,
      eventId,
      studentName
    );
    if (existing) {
      const canonicalBase = getCanonicalBaseUrl(origin);
      const expectedQrUrl = `${canonicalBase}/verify/${existing.certificateId}`;
      if (!existing.qrUrl || existing.qrUrl.includes("localhost") || existing.qrUrl.includes("127.0.0.1") || existing.qrUrl.includes("caravanrimt.com")) {
        existing.qrUrl = expectedQrUrl;
        const db = await getDb();
        await db.collection("certificates").updateOne(
          { _id: existing._id },
          { $set: { qrUrl: expectedQrUrl, updatedAt: new Date() } }
        );
      }
      await certificateRepository.incrementDownloadCount(existing.certificateId);
      return existing;
    }

    // 2. Fetch registration document to verify event and category details
    const db = await getDb();
    const reg = await db.collection("registrations").findOne({ _id: regObjectId });
    if (!reg) {
      throw new Error("Registration record not found");
    }

    const selectedEvents = Array.isArray(reg.selectedEvents) ? reg.selectedEvents : [];
    const matchedEvt = selectedEvents.find(
      (e: any) => String(e.eventId || e._id) === eventId
    );

    const eventName = matchedEvt?.eventName || "Event";
    const categoryName = matchedEvt?.categoryName || "General";
    const categoryLetter = this.getCategoryLetter(categoryName);

    // 3. Check for Winner placement in event_results
    let position: 0 | 1 | 2 | 3 = 0;
    const resultDoc = await certificateRepository.findResultByEventId(eventId);
    if (resultDoc && Array.isArray(resultDoc.winners)) {
      const winner = resultDoc.winners.find((w: EventWinnerEntry) => {
        const wNameMatch =
          w.studentName.toLowerCase().includes(studentName.toLowerCase()) ||
          studentName.toLowerCase().includes(w.studentName.toLowerCase());
        const wUnivMatch =
          !w.university ||
          w.university.toLowerCase().includes(university.toLowerCase()) ||
          university.toLowerCase().includes(w.university.toLowerCase());
        const wMobileMatch = w.mobile && w.mobile.replace(/\D/g, "") === mobile;
        const wRegMatch = w.registrationId && w.registrationId.toString() === registrationId;

        return (wNameMatch && wUnivMatch) || wMobileMatch || wRegMatch;
      });

      if (winner) {
        position = winner.position;
      }
    }

    const suffix = `${categoryLetter}.${position}`;
    const prefix = position > 0 ? "RIMT/CARVAN26/W-" : "RIMT/CARVAN26/P-";
    const serialNumber = `${prefix}${suffix}`;
    const awardTitle = this.getAwardTitle(position);
    const templateUrl = this.getTemplateUrl(position);

    // Generate public certificate ID, e.g. "CRVN26-CERT-9A8B7C"
    const certificateId = `CRVN26-CERT-${nanoid(10).toUpperCase()}`;

    // Cryptographic anti-tamper hash
    const verificationHash = this.generateHmac(certificateId, studentName, eventId, position);

    const baseUrl = getCanonicalBaseUrl(origin);
    const qrUrl = `${baseUrl}/verify/${certificateId}`;

    const newRecord: Omit<CertificateRecord, "_id"> = {
      certificateId,
      serialNumber,
      suffix,
      registrationId: regObjectId,
      studentName: studentName.trim(),
      mobile: mobile.trim(),
      university: university.trim(),
      eventId,
      eventName,
      categorySlug: categoryName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      categoryName,
      categoryLetter,
      position,
      awardTitle,
      templateUrl,
      verificationHash,
      qrUrl,
      issuedAt: new Date(),
      downloadCount: 1,
      lastDownloadedAt: new Date(),
    };

    return await certificateRepository.createCertificate(newRecord);
  }

  /**
   * Verifies certificate authenticity and returns public data with masked PII
   */
  async verifyCertificate(certificateId: string): Promise<{
    isValid: boolean;
    isAuthentic: boolean;
    certificate?: {
      certificateId: string;
      serialNumber: string;
      suffix: string;
      studentName: string;
      university: string;
      eventName: string;
      categoryName: string;
      categoryLetter: string;
      position: number;
      awardTitle: string;
      templateUrl: string;
      issuedAt: string;
      maskedMobile: string;
      verificationHash: string;
    };
    message?: string;
  }> {
    const cert = await certificateRepository.findByCertificateId(certificateId);
    if (!cert) {
      return {
        isValid: false,
        isAuthentic: false,
        message: "Certificate ID not found in Caravan '26 official registry.",
      };
    }

    // Verify cryptographic HMAC signature
    const expectedHash = this.generateHmac(
      cert.certificateId,
      cert.studentName,
      cert.eventId,
      cert.position
    );

    const isAuthentic = cert.verificationHash === expectedHash;

    // Mask phone number: e.g. 9876543210 -> XXXXXX3210
    const rawMobile = cert.mobile || "";
    const maskedMobile =
      rawMobile.length >= 4
        ? "X".repeat(Math.max(0, rawMobile.length - 4)) + rawMobile.slice(-4)
        : "XXXX";

    return {
      isValid: true,
      isAuthentic,
      certificate: {
        certificateId: cert.certificateId,
        serialNumber: cert.serialNumber,
        suffix: cert.suffix,
        studentName: cert.studentName,
        university: cert.university,
        eventName: cert.eventName,
        categoryName: cert.categoryName,
        categoryLetter: cert.categoryLetter,
        position: cert.position,
        awardTitle: cert.awardTitle,
        templateUrl: cert.templateUrl,
        issuedAt: cert.issuedAt ? cert.issuedAt.toISOString() : new Date().toISOString(),
        maskedMobile,
        verificationHash: cert.verificationHash,
      },
      message: isAuthentic
        ? "Official & Verified Caravan '26 Certificate."
        : "Warning: Certificate data failed cryptographic integrity verification.",
    };
  }

  /**
   * When Superadmin assigns or updates winners, automatically upgrades any certificates
   * that were previously claimed as Participation to the official Winner tier.
   */
  async syncWinnersAndUpgradeCertificates(
    eventId: string,
    winners: EventWinnerEntry[]
  ): Promise<{ upgradedCount: number }> {
    const db = await getDb();
    let upgradedCount = 0;

    for (const winner of winners) {
      const position = winner.position;
      const awardTitle = this.getAwardTitle(position);
      const templateUrl = this.getTemplateUrl(position);

      const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const nameRegex = new RegExp(`^${escapeRegex(winner.studentName.trim())}$`, "i");

      // Find existing certificate by registrationId or studentName for this event
      const existingQuery: any = {
        eventId,
      };

      if (winner.registrationId) {
        const regObj = ObjectId.isValid(winner.registrationId)
          ? new ObjectId(winner.registrationId)
          : null;
        existingQuery.$or = [
          ...(regObj ? [{ registrationId: regObj }] : []),
          { registrationId: winner.registrationId.toString() },
          { studentName: { $regex: nameRegex } },
        ];
      } else {
        existingQuery.studentName = { $regex: nameRegex };
      }

      const existingCerts = await db.collection("certificates").find(existingQuery).toArray();
      for (const existingCert of existingCerts) {
        const categoryLetter = existingCert.categoryLetter || this.getCategoryLetter(existingCert.categoryName);
        const suffix = `${categoryLetter}.${position}`;
        const serialNumber = `RIMT/CARVAN26/W-${suffix}`;
        const verificationHash = this.generateHmac(
          existingCert.certificateId,
          existingCert.studentName,
          eventId,
          position
        );

        await db.collection("certificates").updateOne(
          { _id: existingCert._id },
          {
            $set: {
              position,
              awardTitle,
              templateUrl,
              suffix,
              serialNumber,
              verificationHash,
              updatedAt: new Date(),
            },
          }
        );
        upgradedCount++;
      }
    }

    // Safely demote any previous winner certificates for this event that are no longer in the winner list
    const winnerRegIds = new Set(
      winners
        .map((w) => (w.registrationId ? w.registrationId.toString() : null))
        .filter(Boolean)
    );
    const winnerNames = new Set(winners.map((w) => w.studentName.trim().toLowerCase()));

    const previousWinnerCerts = await db
      .collection("certificates")
      .find({ eventId, position: { $gt: 0 } })
      .toArray();

    for (const cert of previousWinnerCerts) {
      const certRegStr = cert.registrationId?.toString();
      const certName = (cert.studentName || "").trim().toLowerCase();
      const isStillWinner =
        (certRegStr && winnerRegIds.has(certRegStr)) || winnerNames.has(certName);

      if (!isStillWinner) {
        const categoryLetter =
          cert.categoryLetter || this.getCategoryLetter(cert.categoryName);
        const suffix = `${categoryLetter}.0`;
        const serialNumber = `RIMT/CARVAN26/P-${suffix}`;
        const awardTitle = this.getAwardTitle(0);
        const templateUrl = this.getTemplateUrl(0);
        const verificationHash = this.generateHmac(
          cert.certificateId,
          cert.studentName,
          eventId,
          0
        );

        await db.collection("certificates").updateOne(
          { _id: cert._id },
          {
            $set: {
              position: 0,
              awardTitle,
              templateUrl,
              suffix,
              serialNumber,
              verificationHash,
              updatedAt: new Date(),
            },
          }
        );
      }
    }

    return { upgradedCount };
  }
}

export const certificateService = new CertificateService();
