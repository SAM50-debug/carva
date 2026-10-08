import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { apiError, apiSuccess } from "@/lib/api/helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { qrCode, eventId } = body;

    if (!qrCode || !eventId) {
      return apiError("QR Code and Event ID are required", 400);
    }

    const db = await getDb();
    // 1. Authorization check
    const payloadStr = req.headers.get("x-user-payload");
    const user = payloadStr ? JSON.parse(payloadStr) : null;
    
    // Find the event to get its category
    const { ObjectId } = require("mongodb");
    const event = await db.collection("events").findOne({ _id: new ObjectId(eventId) });
    if (!event) return apiError("Event not found", 404);

    if (user && user.role === "sub_admin") {
      const assignedIds = user.assignedCategoryIds || [];
      if (!assignedIds.includes(event.categoryId.toString())) {
        return apiError("Forbidden: You do not have permission to mark attendance for this category.", 403);
      }
    }

    // 2. Find registration by QR code
    const registration = await db.collection("registrations").findOne({ qrCode });
    if (!registration) {
      return apiError("Invalid QR Code: No registration found.", 404);
    }

    if (registration.status !== "verified") {
      return apiError(`Registration is currently '${registration.status}'. Must be 'verified'.`, 403);
    }

    // 2. Check if this participant is registered for this specific event
    const matchedEvent = registration.selectedEvents.find(
      (evt: any) => evt.eventId.toString() === eventId.toString()
    );

    if (!matchedEvent) {
      return apiError("Participant did not register for this specific event.", 403);
    }

    // Check if already scanned
    const existing = await db.collection("attendance").findOne({ 
      registrationId: registration._id, 
      eventId: eventId 
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
      }, { status: 409 });
    }

    if (body.action === "verify") {
      return apiSuccess({
        message: "Verification successful",
        participantName: registration.studentName,
        university: registration.university,
        participationType: registration.participationType,
        teamName: registration.teamDetails?.teamName,
        leaderName: registration.teamDetails?.leaderName,
        memberCount: matchedEvent.teamDetails?.memberCount,
      });
    }

    // 3. Mark attendance
    const attendanceDoc = {
      registrationId: registration._id,
      eventId: eventId,
      scannedAt: new Date(),
    };

    await db.collection("attendance").insertOne(attendanceDoc);

    return apiSuccess({
      message: "Attendance marked",
      participantName: registration.studentName
    });

  } catch (error) {
    console.error("Attendance API error:", error);
    return apiError("Internal server error", 500);
  }
}
