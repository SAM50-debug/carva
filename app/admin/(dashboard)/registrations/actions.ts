"use server";

import { getDb } from "@/lib/db/client";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";

export async function getRegistrationsPage(skip: number, limit: number = 50, query: string = "", filterEventId: string = "", filterCategoryId: string = "") {
  const db = await getDb();
  
  const headersList = await headers();
  const payloadStr = headersList.get("x-user-payload");
  const user = payloadStr ? JSON.parse(payloadStr) : null;
  const role = user?.role || "super_admin";
  const assignedCategoryIds = user?.assignedCategoryIds || [];

  let filterQuery: any = {};
  
  if (role === "sub_admin" && assignedCategoryIds.length > 0) {
    const assignedCategoryObjectIds = assignedCategoryIds.map((id: string) => new ObjectId(id));
    const subAdminEvents = await db.collection("events").find({ categoryId: { $in: assignedCategoryObjectIds } }, { projection: { _id: 1 } }).toArray();
    const eventIds = subAdminEvents.map(e => e._id.toString());
    
    filterQuery = { "selectedEvents.eventId": { $in: eventIds } };
  } else if (role === "sub_admin") {
    filterQuery = { _id: null };
  }

  if (query && query.trim() !== "") {
    const regex = { $regex: query, $options: "i" };
    filterQuery.$or = [
      { studentName: regex },
      { email: regex },
      { rollNumber: regex },
      { "teamDetails.teamName": regex },
      { qrCode: regex }
    ];
  }

  if (filterEventId) {
    filterQuery["selectedEvents.eventId"] = filterEventId;
  } else if (filterCategoryId) {
    filterQuery["selectedEvents.categoryId"] = filterCategoryId;
  }

  const registrations = await db
    .collection("registrations")
    .find(filterQuery)
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  return JSON.parse(JSON.stringify(registrations));
}

export async function deleteRegistrationAction(id: string) {
  const headersList = await headers();
  const payloadStr = headersList.get("x-user-payload");
  const user = payloadStr ? JSON.parse(payloadStr) : null;

  if (user?.role !== "super_admin") {
    throw new Error("Unauthorized");
  }

  const { registrationRepository } = await import("@/lib/repositories/RegistrationRepository");
  await registrationRepository.delete(id);
  
  return { success: true };
}
