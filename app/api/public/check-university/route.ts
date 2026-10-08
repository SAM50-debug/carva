import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const university = searchParams.get("university");
  const eventStr = searchParams.get("event");

  if (!university || !eventStr) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const existing = await db.collection("registrations").findOne({
      university: { $regex: new RegExp(`^${university}$`, "i") },
      "selectedEvents.eventName": { $regex: new RegExp(eventStr, "i") },
      status: { $ne: "rejected" }
    });

    if (existing) {
      return NextResponse.json({ registered: true });
    }

    return NextResponse.json({ registered: false });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
