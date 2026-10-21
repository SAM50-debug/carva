import { Metadata } from "next";
import SchedulesClient from "./SchedulesClient";

export const metadata: Metadata = {
  title: "Event Schedules & Arena Timings | CARAVAN ’26",
  description: "Official schedule, dates, venues, timings, and faculty coordinators for all competitions across 6 arenas at CARAVAN '26 Inter-University Youth Festival.",
};

export default function SchedulesPage() {
  return <SchedulesClient />;
}
