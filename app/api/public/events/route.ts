import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";

export async function GET() {
  try {
    const db = await getDb();

    // Fetch active categories and events
    const [categories, events] = await Promise.all([
      db.collection("categories").find({ isActive: true }).sort({ order: 1 }).toArray(),
      db.collection("events").find({ isActive: true }).toArray(),
    ]);

    // Group events by category
    const categorizedEvents = categories.map((cat: any) => {
      return {
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        accent: cat.accent,
        events: events
          .filter((e: any) => e.categoryId.toString() === cat._id.toString())
          .map((e: any) => ({
            _id: e._id,
            name: e.name,
            slug: e.slug,
            participation: e.participation,
            subEvents: e.subEvents || [],
            descriptor: e.descriptor || "",
            duration: e.duration || null,
          })),
      };
    });

    return NextResponse.json({ categories: categorizedEvents });
  } catch (error) {
    console.error("Error fetching public events data:", error);
    return NextResponse.json({ error: "Failed to fetch event data" }, { status: 500 });
  }
}
