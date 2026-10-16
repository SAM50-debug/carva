import { notFound } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { Metadata } from "next";
import EventDetailClient from "@/app/(public)/events/[slug]/EventDetailClient";
import { eventsData } from "@/data/events";

// Slug alias mapping for events where database slug differs slightly from static ID
const EVENT_SLUG_ALIASES: Record<string, string> = {
  "earth-and-form": "earth-form",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDb();
  const event = await db.collection("events").findOne({ slug });
  if (!event) return { title: "Event Not Found" };
  return {
    title: `CARAVAN '26 | ${event.name} | RIMT University`,
    description: event.descriptor || `Details about ${event.name}`,
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  
  const dbEvent = await db.collection("events").findOne({ slug, isActive: true });
  if (!dbEvent) notFound();

  const dbCategory = await db.collection("categories").findOne({ _id: dbEvent.categoryId });

  // Map DB structure to what EventDetailClient expects
  let teamSizeStr = "Individual";
  if (dbEvent.participation) {
    const { type, min, max } = dbEvent.participation;
    if (type === "team" && min && max) {
      teamSizeStr = `Team of ${min}–${max}`;
    } else if (type === "team") {
      teamSizeStr = "Team";
    } else {
      teamSizeStr = type.charAt(0).toUpperCase() + type.slice(1);
    }
  }

  // Find corresponding static event details to enrich missing rules, criteria, deliverables, etc.
  const matchedStaticId = EVENT_SLUG_ALIASES[slug] || slug;
  const staticEvent =
    eventsData.find((e) => e.id === matchedStaticId) ||
    eventsData.find((e) => e.name.toLowerCase() === dbEvent.name.toLowerCase()) ||
    eventsData.find((e) => dbEvent.name.toLowerCase().includes(e.name.toLowerCase()));

  const mappedEvent = {
    id: dbEvent._id.toString(),
    name: dbEvent.name,
    category: dbCategory
      ? dbCategory.name.toUpperCase().replace(/(?:\s*(?:EVENTS?|CLUB|BATTLES))+\s*$/i, "").trim()
      : (staticEvent?.category || "CULTURAL"),
    description: dbEvent.descriptor || staticEvent?.description || "",
    teamSize: teamSizeStr || staticEvent?.teamSize || "Individual",
    duration:
      dbEvent.duration?.display ||
      (dbEvent.duration?.minutes ? `${dbEvent.duration.minutes} mins` : staticEvent?.duration),
    rules: (dbEvent.rules && dbEvent.rules.length > 0) ? dbEvent.rules : (staticEvent?.rules || []),
    judgingCriteria:
      (dbEvent.judging && dbEvent.judging.length > 0)
        ? dbEvent.judging.map((j: any) => j.criterion)
        : (staticEvent?.judgingCriteria || []),
    objective: dbEvent.objective || staticEvent?.objective,
    theme: dbEvent.theme || staticEvent?.theme,
    rounds: (dbEvent.rounds && dbEvent.rounds.length > 0) ? dbEvent.rounds : staticEvent?.rounds,
    deliverables:
      (dbEvent.deliverables && dbEvent.deliverables.length > 0)
        ? dbEvent.deliverables
        : staticEvent?.deliverables,
    participation: dbEvent.participation,
  };
  
  return <EventDetailClient event={mappedEvent as any} />;
}
