import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { apiError, apiSuccess } from "@/lib/api/helpers";
import { GATE_SECURITY_KEY } from "@/lib/constants";
import { GateEntryRecord } from "@/lib/db/models/types";
import { rateLimiter } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown_ip";
    const rateCheck = rateLimiter.check(`gate_scan_${clientIp}`, 120, 60 * 1000); // 120 scans per minute

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many scan requests. Scanner throttled for 10 seconds." },
        { status: 429, headers: { "Retry-After": Math.ceil(rateCheck.resetMs / 1000).toString() } }
      );
    }

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

    // 2. Validate QR Code / Search Query input
    if (!qrCode || typeof qrCode !== "string") {
      return apiError("Valid QR Code, Roll Number, or Mobile number is required.", 400);
    }

    const cleanInput = qrCode.trim();
    if (!/^[a-zA-Z0-9_\-\.\/]{4,64}$/.test(cleanInput)) {
      return apiError("Malformed search query format.", 400);
    }

    const db = await getDb();
    const startTime = Date.now();
    const requestId = req.headers.get("x-request-id") || `gate_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 3. Find registration: Try QR Code first, then fallback to Roll Number or Mobile
    let registration = await db.collection("registrations").findOne({ qrCode: cleanInput });

    if (!registration) {
      registration = await db.collection("registrations").findOne({
        $or: [
          { rollNumber: cleanInput },
          { rollNumber: cleanInput.toUpperCase() },
          { mobile: cleanInput }
        ]
      });
    }

    if (!registration) {
      return NextResponse.json({
        status: "invalid",
        error: "Invalid Ticket: No registration found for this QR code, Roll number, or Mobile in system.",
      }, { 
        status: 404,
        headers: { "x-request-id": requestId }
      });
    }

    const cleanQr = registration.qrCode || cleanInput;

    if (registration.status !== "verified") {
      return NextResponse.json({
        status: "unverified",
        error: `Entry Denied: Registration is '${registration.status}'. Only 'verified' registrations are admitted.`,
        studentName: registration.studentName || registration.teamDetails?.leaderName,
        university: registration.university,
      }, { 
        status: 403,
        headers: { "x-request-id": requestId }
      });
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

        const latencyMs = Date.now() - startTime;
        return NextResponse.json({
          success: true,
          status: "re_entry_admitted",
          message: "Re-Entry Authorized & Logged",
          participant: participantProfile,
          scannedAt: reEntryDoc.scannedAt,
          firstEntryTime: firstEntry.scannedAt,
          totalScans: existingEntries.length + 1,
          latencyMs,
        }, {
          status: 200,
          headers: { "x-request-id": requestId }
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
      }, { 
        status: 409,
        headers: { "x-request-id": requestId }
      });
    }

    // B. PHASE 1: Verify Only (Do NOT insert yet, let the guard check details first)
    if (action === "verify") {
      return NextResponse.json({
        success: true,
        status: "pending_mark",
        message: "Ticket Verified. Check details and tap 'Mark Entry'.",
        participant: participantProfile,
      }, {
        status: 200,
        headers: { "x-request-id": requestId }
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

    try {
      await db.collection("gate_entries").insertOne(entryDoc);
    } catch (insertError: any) {
      // Concurrency race condition protection: catch duplicate key (code 11000)
      if (insertError?.code === 11000) {
        const raceEntry = await db.collection("gate_entries").findOne({ registrationId: registration._id });
        return NextResponse.json({
          status: "already_entered",
          message: "Ticket already used for campus entry! (Concurrent scan admitted at another gate)",
          firstEntryTime: raceEntry?.scannedAt || new Date(),
          gateName: raceEntry?.gateName || gateName,
          totalScans: 1,
          participant: participantProfile,
        }, { 
          status: 409,
          headers: { "x-request-id": requestId }
        });
      }
      throw insertError;
    }

    const latencyMs = Date.now() - startTime;
    return NextResponse.json({
      success: true,
      status: "admitted",
      message: "Campus Gate Entry Marked Successfully",
      participant: participantProfile,
      scannedAt: entryDoc.scannedAt,
      firstEntryTime: entryDoc.scannedAt,
      totalScans: 1,
      latencyMs,
    }, {
      status: 200,
      headers: { "x-request-id": requestId }
    });

  } catch (error) {
    console.error("Gate scan error:", error);
    return apiError("Internal server error during gate scan.", 500);
  }
}
