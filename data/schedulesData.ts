import { eventsData, Category } from "./events";

export interface EventScheduleItem {
  id: string;
  name: string;
  category: Category;
  date: string;
  time: string;
  duration?: string;
  venue: string;
  coordinators: string;
  isScheduled: boolean;
}

// Fixed schedules provided in docs/event_table.md
const scheduledOverrides: Record<string, Partial<EventScheduleItem>> = {
  "war-of-words": {
    date: "23-10-2026",
    time: "10:00 AM",
    duration: "4–5 min.",
    venue: "Conference Room, B Block",
    coordinators: "Prof. (Dr.) Jyoti Angrish & Dr. Nitin Sharma",
    isScheduled: true,
  },
  "just-a-minute": {
    date: "23-10-2026",
    time: "12:00 PM",
    duration: "1 min.",
    venue: "Conference Room, B Block",
    coordinators: "Prof. (Dr.) Jyoti Angrish & Dr. Nitin Sharma",
    isScheduled: true,
  },
  "ink-and-imagination": {
    date: "23-10-2026",
    time: "10:00 AM",
    duration: "1 hr.",
    venue: "LR-001 (Ground Floor, Engineering Block)",
    coordinators: "Dr. Jagtar Singh & Mr. Rajan Batta",
    isScheduled: true,
  },
  "verse-unplugged": {
    date: "23-10-2026",
    time: "12:30 PM",
    duration: "4–5 min.",
    venue: "Conference Room, B Block",
    coordinators: "Prof. (Dr.) Suneet & Dr. Varinder Singh",
    isScheduled: true,
  },
};

// Additional cultural events recently added
const additionalEvents: EventScheduleItem[] = [
  {
    id: "giddha",
    name: "Giddha (Traditional Folk Dance)",
    category: "CULTURAL",
    date: "Coming Soon",
    time: "Coming Soon",
    duration: "8–10 min.",
    venue: "Coming Soon",
    coordinators: "Coming Soon",
    isScheduled: false,
  },
  {
    id: "luddi",
    name: "Luddi (Traditional Folk Dance)",
    category: "CULTURAL",
    date: "Coming Soon",
    time: "Coming Soon",
    duration: "8–10 min.",
    venue: "Coming Soon",
    coordinators: "Coming Soon",
    isScheduled: false,
  },
  {
    id: "sammi",
    name: "Sammi (Traditional Folk Dance)",
    category: "CULTURAL",
    date: "Coming Soon",
    time: "Coming Soon",
    duration: "8–10 min.",
    venue: "Coming Soon",
    coordinators: "Coming Soon",
    isScheduled: false,
  },
];

export const allSchedulesData: EventScheduleItem[] = [
  ...eventsData.map((ev) => {
    const override = scheduledOverrides[ev.id];
    if (override) {
      return {
        id: ev.id,
        name: ev.name,
        category: ev.category,
        date: override.date || "Coming Soon",
        time: override.time || "Coming Soon",
        duration: override.duration || ev.duration || "Coming Soon",
        venue: override.venue || "Coming Soon",
        coordinators: override.coordinators || "Coming Soon",
        isScheduled: true,
      };
    }
    return {
      id: ev.id,
      name: ev.name,
      category: ev.category,
      date: "Coming Soon",
      time: "Coming Soon",
      duration: ev.duration || "Coming Soon",
      venue: "Coming Soon",
      coordinators: "Coming Soon",
      isScheduled: false,
    };
  }),
  ...additionalEvents,
];
