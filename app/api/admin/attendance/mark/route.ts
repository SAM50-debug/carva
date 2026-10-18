import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { apiError, apiSuccess } from "@/lib/api/helpers";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { qrCode, eventId } = body;

    if (!qrCode || !eventId) {
      return apiError("QR Code and Event ID are required", 400);
    }

    if (!ObjectId.isValid(eventId)) {
      return apiError("Invalid Event ID format", 400);
    }

    const eventObjId = new ObjectId(eventId);
    const db = await getDb();
    const requestId = req.headers.get("x-request-id") || `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Authorization check
    const payloadStr = req.headers.get("x-user-payload");
    const user = payloadStr ? JSON.parse(payloadStr) : null;
    
    // Find the event to get its category
    const event = await db.collection("events").findOne({ _id: eventObjId });
    if (!event) return apiError("Event not found", 404);

    if (user && user.role === "sub_admin") {
      const assignedIds = user.assignedCategoryIds || [];
      if (!assignedIds.includes(event.categoryId.toString())) {
        return apiError("Forbidden: You do not have permission to mark attendance for this category.", 403);
      }
    }

    // 2. Find registration by QR code, with fallback to Roll Number or Mobile
    const cleanInput = qrCode.trim();
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
      return apiError("Invalid Ticket: No registration found in system.", 404);
    }

    if (registration.status !== "verified") {
      return apiError(`Registration is currently '${registration.status}'. Must be 'verified'.`, 403);
    }

    // 3. Check if this participant is registered for this specific event
    const matchedEvent = registration.selectedEvents?.find(
      (evt: any) => evt.eventId?.toString() === eventId.toString()
    );

    if (!matchedEvent) {
      return apiError("Participant did not register for this specific event.", 403);
    }

    // Check if already scanned
    const existing = await db.collection("attendance").findOne({ 
      registrationId: registration._id, 
      eventId: eventObjId 
    });

    if (existing) {
      return NextResponse.json({ 
        error: "Participant has already been scanned in for this event!", 
        participantName: registration.studentName,
        university: registration.university,
        participationType: registration.participationType,
        teamName: registration.teamDetails?.teamName,
        leaderName: registration.teamDetails?.leaderName,
        memberCount: matchedEvent.teamDetails?.memberCount,
      }, { 
        status: 409,
        headers: { "x-request-id": requestId }
      });
    }

    if (body.action === "verify") {
      return NextResponse.json({
        success: true,
        message: "Verification successful",
        participantName: registration.studentName,
        university: registration.university,
        participationType: registration.participationType,
        teamName: registration.teamDetails?.teamName,
        leaderName: registration.teamDetails?.leaderName,
        memberCount: matchedEvent.teamDetails?.memberCount,
      }, {
        status: 200,
        headers: { "x-request-id": requestId }
      });
    }

    // 4. Mark attendance atomically
    const attendanceDoc = {
      registrationId: registration._id,
      eventId: eventObjId,
      scannedAt: new Date(),
      markedBy: user?.userId ? new ObjectId(user.userId) : undefined,
      method: body.method || "qr_scan",
    };

    try {
      await db.collection("attendance").insertOne(attendanceDoc);
    } catch (insertErr: any) {
      if (insertErr?.code === 11000) {
        return NextResponse.json({ 
          error: "Participant has already been scanned in for this event! (Concurrent scan detected)", 
          participantName: registration.studentName,
          university: registration.university,
          participationType: registration.participationType,
          teamName: registration.teamDetails?.teamName,
          leaderName: registration.teamDetails?.leaderName,
          memberCount: matchedEvent.teamDetails?.memberCount,
        }, { 
          status: 409,
          headers: { "x-request-id": requestId }
        });
      }
      throw insertErr;
    }

    return NextResponse.json({
      success: true,
      message: "Attendance marked",
      participantName: registration.studentName
    }, {
      status: 200,
      headers: { "x-request-id": requestId }
    });

  } catch (error) {
    console.error("Attendance API error:", error);
    return apiError("Internal server error", 500);
  }
}
