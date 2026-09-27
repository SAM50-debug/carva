import { notFound } from "next/navigation";
import Link from "next/link";
import { eventsData } from "@/data/events";
import { Metadata } from "next";
import EventDetailClient from "@/app/events/[slug]/EventDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = eventsData.find(e => e.id === slug);
  if (!event) return { title: "Event Not Found" };
  return {
    title: `CARAVAN '26 | ${event.name} | RIMT University`,
    description: event.description,
  };
}

export async function generateStaticParams() {
  return eventsData.map((event) => ({ slug: event.id }));
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = eventsData.find(e => e.id === slug);
  
  // Artificial delay to guarantee the premium skeleton loader is visible for a moment
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (!event) notFound();
  return <EventDetailClient event={event!} />;
}
