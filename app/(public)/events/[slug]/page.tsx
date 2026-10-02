import { notFound } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { Metadata } from "next";
import EventDetailClient from "@/app/(public)/events/[slug]/EventDetailClient";

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

  const mappedEvent = {
    id: dbEvent._id.toString(),
    name: dbEvent.name,
    category: dbCategory ? dbCategory.name.toUpperCase().replace(/\s*EVENTS?\s*$/i, "").trim() : "CULTURAL",
    description: dbEvent.descriptor || "",
    teamSize: teamSizeStr,
    duration: dbEvent.duration?.display || (dbEvent.duration?.minutes ? `${dbEvent.duration.minutes} mins` : undefined),
    rules: dbEvent.rules || [],
    judgingCriteria: dbEvent.judging?.map((j: any) => j.criterion) || [],
    objective: dbEvent.objective,
    rounds: dbEvent.rounds,
    deliverables: dbEvent.deliverables,
  };
  
  return <EventDetailClient event={mappedEvent as any} />;
}
