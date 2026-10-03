"use server";

import { getDb } from "@/lib/db/client";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";

export async function getRegistrationsPage(skip: number, limit: number = 50) {
  const db = await getDb();
  
  const headersList = await headers();
  const payloadStr = headersList.get("x-user-payload");
  const user = payloadStr ? JSON.parse(payloadStr) : null;
  const role = user?.role || "super_admin";
  const assignedCategoryIds = user?.assignedCategoryIds || [];

  let filterQuery = {};
  
  if (role === "sub_admin" && assignedCategoryIds.length > 0) {
    const assignedCategoryObjectIds = assignedCategoryIds.map((id: string) => new ObjectId(id));
    const subAdminEvents = await db.collection("events").find({ categoryId: { $in: assignedCategoryObjectIds } }, { projection: { _id: 1 } }).toArray();
    const eventIds = subAdminEvents.map(e => e._id.toString());
    
    filterQuery = { "selectedEvents.eventId": { $in: eventIds } };
  } else if (role === "sub_admin") {
    filterQuery = { _id: null };
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
