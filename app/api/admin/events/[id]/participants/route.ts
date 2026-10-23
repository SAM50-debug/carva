import { NextRequest } from "next/server";
import { requireAuth, apiError, apiSuccess } from "@/lib/api/helpers";
import { getDb } from "@/lib/db/client";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = requireAuth(req);
  if (error) return error;

  try {
    const { id } = await params;
    if (!id) return apiError("Event ID is required", 400);

    const db = await getDb();
    const eventObjId = ObjectId.isValid(id) ? new ObjectId(id) : null;

    // 1. Fetch event metadata to allow slug and name matching
    const event = await db.collection("events").findOne(
      eventObjId ? { _id: eventObjId } : { slug: id }
    );

    // 2. Query all registrations containing this event
    const orConditions: any[] = [
      { "selectedEvents.eventId": id },
      { "selectedEvents.eventId": id.toString() },
    ];
    if (eventObjId) {
      orConditions.push({ "selectedEvents.eventId": eventObjId });
    }
    if (event) {
      if (event.slug) {
        orConditions.push({ "selectedEvents.eventId": event.slug });
      }
      if (event.name) {
        // Escape special regex characters safely
        const escapedName = event.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        orConditions.push({
          "selectedEvents.eventName": { $regex: new RegExp(`^${escapedName}$`, "i") },
        });
      }
    }

    const regQuery: any = {
      status: { $ne: "rejected" },
      $or: orConditions,
    };

    const registrations = await db.collection("registrations").find(regQuery).toArray();

    // 3. Query all attendance records for this event
    const attOrConditions: any[] = [{ eventId: id }, { eventId: id.toString() }];
    if (eventObjId) {
      attOrConditions.push({ eventId: eventObjId });
    }
    if (event) {
      if (event.slug) attOrConditions.push({ eventId: event.slug });
    }

    const attQuery: any = { $or: attOrConditions };
    const attendanceRecords = await db.collection("attendance").find(attQuery).toArray();
    const presentRegIds = new Set(
      attendanceRecords.map((a: any) => String(a.registrationId))
    );

    // 4. Format participants list
    const participants: Array<{
      registrationId: string;
      studentName: string;
      university: string;
      mobile: string;
      rollNumber?: string;
      participationType: string;
      isPresent: boolean;
      teamName?: string;
    }> = [];

    for (const reg of registrations) {
      const regIdStr = reg._id.toString();
      const isPresent = presentRegIds.has(regIdStr);

      // Extract team information if present (root level or in selectedEvents)
      const matchingSelectedEvent = Array.isArray(reg.selectedEvents)
        ? reg.selectedEvents.find(
            (e: any) =>
              e.eventId === id ||
              (eventObjId && String(e.eventId) === String(eventObjId)) ||
              (event?.name && e.eventName?.toLowerCase() === event.name.toLowerCase())
          )
        : null;

      const teamName =
        reg.teamDetails?.teamName || matchingSelectedEvent?.teamDetails?.teamName;
      const leaderName =
        reg.teamDetails?.leaderName || matchingSelectedEvent?.teamDetails?.leaderName;

      // Primary applicant
      participants.push({
        registrationId: regIdStr,
        studentName: reg.studentName ? reg.studentName.trim() : "Participant",
        university: reg.university ? reg.university.trim() : "University",
        mobile: reg.mobile || "",
        rollNumber: reg.rollNumber || "",
        participationType: reg.participationType || "individual",
        isPresent,
        teamName,
      });

      // If team leader is different from primary student name
      if (
        leaderName &&
        leaderName.trim().toLowerCase() !== reg.studentName?.trim().toLowerCase()
      ) {
        participants.push({
          registrationId: regIdStr,
          studentName: `${leaderName.trim()} (Leader)`,
          university: reg.university ? reg.university.trim() : "University",
          mobile: reg.mobile || "",
          rollNumber: reg.rollNumber || "",
          participationType: "team",
          isPresent,
          teamName,
        });
      }
    }

    // Sort: present participants first, then alphabetical by studentName
    participants.sort((a, b) => {
      if (a.isPresent === b.isPresent) {
        return a.studentName.localeCompare(b.studentName);
      }
      return a.isPresent ? -1 : 1;
    });

    return apiSuccess({
      success: true,
      total: participants.length,
      presentCount: participants.filter((p) => p.isPresent).length,
      participants,
    });
  } catch (err: any) {
    console.error("Get event participants error:", err);
    return apiError("Failed to fetch event participants", 500);
  }
}
