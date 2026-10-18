import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { apiError, apiSuccess } from "@/lib/api/helpers";
import { GATE_SECURITY_KEY } from "@/lib/constants";
import { GateEntryRecord } from "@/lib/db/models/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      qrCode, 
      gateKey, 
      gateName = "Main Campus Gate", 
      allowReEntry = false, 
      scannedBy = "Security Gate Staff",
      action = "verify" 
    } = body;

    // 1. Security Check: Validate Gate Key or Header
    const authHeaderKey = req.headers.get("x-gate-key");
    const providedKey = gateKey || authHeaderKey;

    if (providedKey !== GATE_SECURITY_KEY) {
      return apiError("Unauthorized: Invalid or missing Gate Security Key.", 401);
    }

    // 2. Validate QR Code input
    if (!qrCode || typeof qrCode !== "string") {
      return apiError("Valid QR Code string is required.", 400);
    }

    const cleanQr = qrCode.trim();
    if (!/^[a-zA-Z0-9_-]{8,64}$/.test(cleanQr)) {
      return apiError("Malformed QR code format.", 400);
    }

    const db = await getDb();

    // 3. Find registration
    const registration = await db.collection("registrations").findOne({ qrCode: cleanQr });

    if (!registration) {
      return NextResponse.json({
        status: "invalid",
        error: "Invalid Ticket: No registration found in system.",
      }, { status: 404 });
    }

    if (registration.status !== "verified") {
      return NextResponse.json({
        status: "unverified",
        error: `Entry Denied: Registration is '${registration.status}'. Only 'verified' registrations are admitted.`,
        studentName: registration.studentName || registration.teamDetails?.leaderName,
        university: registration.university,
      }, { status: 403 });
    }

    // Determine headcount
    let headcount = 1;
    if (registration.participationType === "team") {
      const maxMember = registration.selectedEvents?.reduce((max: number, evt: any) => {
        const count = evt.teamDetails?.memberCount;
        return count && count > max ? count : max;
      }, 0);
      headcount = maxMember || registration.teamDetails?.memberCount || 2;
    }

    const participantProfile = {
      id: registration._id.toString(),
      studentName: registration.studentName || registration.teamDetails?.leaderName || "Participant",
      university: registration.university,
      rollNumber: registration.rollNumber || "N/A",
      course: registration.course ? `${registration.course}${registration.year ? ` (${registration.year})` : ""}` : "N/A",
      gender: registration.gender || "N/A",
      mobile: registration.mobile || "N/A",
      email: registration.email || "N/A",
      participationType: registration.participationType,
      teamName: registration.teamDetails?.teamName,
      leaderName: registration.teamDetails?.leaderName,
      memberCount: headcount,
      membersInfo: registration.selectedEvents?.find((e: any) => e.teamDetails?.membersInfo)?.teamDetails?.membersInfo || "",
      events: registration.selectedEvents?.map((e: any) => e.eventName) || [],
      idCardUrl: registration.idCardUrl || null,
      isRIMT: registration.isRIMT || false,
    };

    // 4. Check for existing gate entries
    const existingEntries = await db
      .collection("gate_entries")
      .find({ registrationId: registration._id })
      .sort({ scannedAt: 1 })
      .toArray();

    const clientIp = req.headers.get("x-forwarded-for") || "";
    const userAgent = req.headers.get("user-agent") || "";

    // A. Handle Already Entered scenario
    if (existingEntries.length > 0) {
      const firstEntry = existingEntries[0];

      // If guard explicitly authorized re-entry and action is "mark"
      if (allowReEntry && action === "mark") {
        const reEntryDoc: GateEntryRecord = {
          registrationId: registration._id,
          qrCode: cleanQr,
          studentName: participantProfile.studentName,
          university: registration.university,
          rollNumber: registration.rollNumber || "",
          participationType: registration.participationType,
          teamName: registration.teamDetails?.teamName,
          leaderName: registration.teamDetails?.leaderName,
          admittedCount: headcount,
          gateName,
          scannedAt: new Date(),
          scannedBy,
          scannerIp: clientIp,
          userAgent,
          isReEntry: true,
        };

        await db.collection("gate_entries").insertOne(reEntryDoc);

        return apiSuccess({
          status: "re_entry_admitted",
          message: "Re-Entry Authorized & Logged",
          participant: participantProfile,
          scannedAt: reEntryDoc.scannedAt,
          firstEntryTime: firstEntry.scannedAt,
          totalScans: existingEntries.length + 1,
        });
      }

      // Default duplicate entry warning
      return NextResponse.json({
        status: "already_entered",
        message: "Ticket already used for campus entry!",
        firstEntryTime: firstEntry.scannedAt,
        gateName: firstEntry.gateName || gateName,
        totalScans: existingEntries.length,
        participant: participantProfile,
      }, { status: 409 });
    }

    // B. PHASE 1: Verify Only (Do NOT insert yet, let the guard check details first)
    if (action === "verify") {
      return apiSuccess({
        status: "pending_mark",
        message: "Ticket Verified. Check details and tap 'Mark Entry'.",
        participant: participantProfile,
      });
    }

    // C. PHASE 2: Mark Official Entry (Triggered when guard taps the button)
    const entryDoc: GateEntryRecord = {
      registrationId: registration._id,
      qrCode: cleanQr,
      studentName: participantProfile.studentName,
      university: registration.university,
      rollNumber: registration.rollNumber || "",
      participationType: registration.participationType,
      teamName: registration.teamDetails?.teamName,
      leaderName: registration.teamDetails?.leaderName,
      admittedCount: headcount,
      gateName,
      scannedAt: new Date(),
      scannedBy,
      scannerIp: clientIp,
      userAgent,
      isReEntry: false,
    };

    await db.collection("gate_entries").insertOne(entryDoc);

    return apiSuccess({
      status: "admitted",
      message: "Campus Gate Entry Marked Successfully",
      participant: participantProfile,
      scannedAt: entryDoc.scannedAt,
      firstEntryTime: entryDoc.scannedAt,
      totalScans: 1,
    });

  } catch (error) {
    console.error("Gate scan error:", error);
    return apiError("Internal server error during gate scan.", 500);
  }
}
