import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const university = searchParams.get("university");
  const eventStr = searchParams.get("event");

  const countStr = searchParams.get("count");
  const memberCount = countStr ? parseInt(countStr, 10) : null;

  if (!university || !eventStr) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Security: Escape user inputs to prevent ReDoS and regex injection attacks
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  try {
    const db = await getDb();
    const query: any = {
      university: { $regex: new RegExp(`^${escapeRegex(university)}$`, "i") },
      "selectedEvents.eventName": { $regex: new RegExp(escapeRegex(eventStr), "i") },
      status: { $ne: "rejected" }
    };

    const isFashion = eventStr.toLowerCase().includes("fashion modeling");

    if (isFashion) {
      // Multiple participations per university are allowed for Fashion Modeling
      return NextResponse.json({ registered: false });
    }

    const existing = await db.collection("registrations").findOne(query);

    if (existing) {
      return NextResponse.json({ registered: true });
    }

    return NextResponse.json({ registered: false });
  } catch (err) {
    console.error("Error checking university registration:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
