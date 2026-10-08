"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Category = { _id: string; name: string };
type EventObj = { _id: string; name: string; categoryId: string };

export default function RegistrationsFilter({
  role,
  categories,
  events
}: {
  role: string;
  categories: Category[];
  events: EventObj[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get("category") || "";
  const currentEvent = searchParams.get("event") || "";

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (val) {
        params.set("category", val);
      } else {
        params.delete("category");
      }
      params.delete("event");
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (val) {
        params.set("event", val);
      } else {
        params.delete("event");
      }
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  if (role === "super_admin") {
    const filteredEvents = currentCategory 
      ? events.filter(ev => ev.categoryId === currentCategory) 
      : events;

    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <select
          value={currentCategory}
          onChange={handleCategoryChange}
          className={`w-full sm:w-auto bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#c8102e]/50 focus:bg-white/10 transition-all duration-300 ${isPending ? 'opacity-50' : ''}`}
        >
          <option value="" className="bg-[#111827]">All Categories</option>
          {categories.map(c => (
            <option key={c._id} value={c._id} className="bg-[#111827]">{c.name}</option>
          ))}
        </select>
        <select
          value={currentEvent}
          onChange={handleEventChange}
          className={`w-full sm:w-auto bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#c8102e]/50 focus:bg-white/10 transition-all duration-300 ${isPending ? 'opacity-50' : ''}`}
        >
          <option value="" className="bg-[#111827]">All Events</option>
          {filteredEvents.map(e => (
            <option key={e._id} value={e._id} className="bg-[#111827]">{e.name}</option>
          ))}
        </select>
      </div>
    );
  }

  // sub_admin
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
      <select
        value={currentEvent}
        onChange={handleEventChange}
        className={`w-full sm:w-auto bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#c8102e]/50 focus:bg-white/10 transition-all duration-300 ${isPending ? 'opacity-50' : ''}`}
      >
        <option value="" className="bg-[#111827]">All Assigned Events</option>
        {events.map(e => (
          <option key={e._id} value={e._id} className="bg-[#111827]">{e.name}</option>
        ))}
      </select>
    </div>
  );
}
