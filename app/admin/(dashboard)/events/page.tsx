"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, Plus, ArrowLeft } from "lucide-react";
import { EventDoc } from "@/lib/db/models/types";

export default function EventsPage() {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/events").then((res) => res.json()),
      fetch("/api/admin/categories").then((res) => res.json())
    ]).then(([eventsData, categoriesData]) => {
      setEvents(eventsData);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-slate-400">Loading events...</div>;

  const filteredEvents = Array.isArray(events)
    ? events.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.slug.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "all" || e.categoryId.toString() === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    : [];

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-slate-400 text-sm mt-1">Manage competitions, rules, and event banners.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60"
            />
          </div>
        </div>
        {/* <Link href="/admin/events/new" className="inline-flex items-center gap-2 bg-[#c8102e] hover:bg-[#a50e26] text-white px-4 py-2.5 rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Add Event
        </Link> */}
      </div>

      <div className="bg-[#111827] border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-white/5 text-slate-400 border-b border-white/8">
            <tr>
              <th className="px-6 py-4 font-medium">Event Name</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Participation</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {filteredEvents.map((evt) => (
              <tr key={evt._id?.toString()} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-white">{evt.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{evt.slug}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-slate-300">
                    {categories.find(c => c._id === evt.categoryId?.toString())?.name || "Unknown Category"}
                  </span>
                </td>
                <td className="px-6 py-4 capitalize">{evt.participation?.type || "N/A"}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${evt.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                    {evt.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/events/${evt._id}`}
                    className="inline-flex items-center gap-2 text-sm text-[#c8102e] hover:text-[#ff1a3b] font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
