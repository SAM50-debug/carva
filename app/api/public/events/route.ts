import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { eventsData } from "@/data/events";

const EVENT_SLUG_ALIASES: Record<string, string> = {
  "earth-and-form": "earth-form",
  "bhangra-dhol": "dance-group",
  "bhangra-empire": "dance-group",
  "bhangra-on-music": "dance-group",
  "western-dance": "dance-group",
  "folk-dance": "dance-group",
  "international-dance": "dance-group",
  "shabad-gayan": "vocal-solo",
  "folk-singing": "vocal-solo",
  "qawwali": "vocal-solo",
  "international-music": "vocal-solo",
  "indian-classical": "vocal-solo",
  "instrumental-music": "vocal-solo",
};

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
          .map((e: any) => {
            const alias = EVENT_SLUG_ALIASES[e.slug] || e.slug;
            const staticEv =
              eventsData.find((se) => se.id === alias) ||
              eventsData.find((se) => se.name.toLowerCase() === e.name.toLowerCase()) ||
              eventsData.find((se) => e.name.toLowerCase().includes(se.name.toLowerCase()));

            return {
              _id: e._id,
              name: e.name,
              slug: e.slug,
              participation: e.participation,
              subEvents: e.subEvents || [],
              descriptor: e.descriptor || staticEv?.description || "",
              duration:
                e.duration ||
                (staticEv?.duration ? { display: staticEv.duration } : null),
            };
          }),
      };
    });

    return NextResponse.json({ categories: categorizedEvents });
  } catch (error) {
    console.error("Error fetching public events data:", error);
    return NextResponse.json({ error: "Failed to fetch event data" }, { status: 500 });
  }
}
