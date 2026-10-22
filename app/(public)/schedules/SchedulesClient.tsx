"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  Search, 
  Sparkles, 
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock4,
  ExternalLink
} from "lucide-react";
import { allSchedulesData, EventScheduleItem } from "@/data/schedulesData";
import { Category } from "@/data/events";

const CATEGORIES: { label: string; value: string; color: string }[] = [
  { label: "All Arenas", value: "ALL", color: "#F5F0E8" },
  { label: "Literary", value: "LITERARY", color: "#f59e0b" },
  { label: "Cultural", value: "CULTURAL", color: "#D21B21" },
  { label: "Technical", value: "TECHNICAL", color: "#3b82f6" },
  { label: "Business", value: "BUSINESS", color: "#10b981" },
  { label: "Fine Arts", value: "FINE ARTS", color: "#a855f7" },
  { label: "Media Club", value: "MEDIA", color: "#6366f1" },
];

export default function SchedulesClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [scheduleFilter, setScheduleFilter] = useState<"all" | "scheduled" | "pending">("all");

  const filteredEvents = useMemo(() => {
    return allSchedulesData.filter((ev) => {
      // Category filter
      const matchesCategory = 
        selectedCategory === "ALL" || 
        ev.category.toUpperCase().includes(selectedCategory.toUpperCase());

      // Search query filter (name, venue, coordinator)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        ev.name.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        (ev.coordinators && ev.coordinators.toLowerCase().includes(q)) ||
        ev.category.toLowerCase().includes(q);

      // Status filter
      const matchesStatus =
        scheduleFilter === "all" ||
        (scheduleFilter === "scheduled" && ev.isScheduled) ||
        (scheduleFilter === "pending" && !ev.isScheduled);

      return matchesCategory && matchesSearch && matchesStatus;
    });
  }, [selectedCategory, searchQuery, scheduleFilter]);

  const scheduledCount = allSchedulesData.filter((e) => e.isScheduled).length;
  const pendingCount = allSchedulesData.length - scheduledCount;

  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      {/* ── Ambient 3D Glow Background ── */}
      <div className="ambient-bg">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />
        <div className="ambient-blob-3" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        
        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/[0.08] border border-brand-gold/25 text-brand-gold text-xs font-bold tracking-[0.2em] uppercase mb-4 shadow-[0_0_20px_rgba(201,162,39,0.15)]">
            <Calendar size={13} className="text-brand-gold" />
            <span>Official Festival Timetable</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-cream tracking-tight mb-4">
            Event <span className="text-gradient">Schedules</span>
          </h1>

          <p className="text-base sm:text-lg text-brand-cream/60 font-medium">
            Find competition dates, stage timings, campus venues, and faculty coordinators across all 6 arenas.
          </p>
        </motion.div>

        {/* ── Mandatory Reporting Notice Card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          className="relative rounded-2xl md:rounded-3xl p-6 sm:p-8 mb-12 overflow-hidden border border-amber-500/30 bg-gradient-to-r from-amber-500/[0.12] via-amber-500/[0.05] to-transparent backdrop-blur-2xl shadow-[0_0_40px_rgba(245,158,11,0.12)]"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                  </span>
                  <span className="text-xs font-bold tracking-wider uppercase text-amber-400">
                    Mandatory Participant Protocol
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Reporting Time on Oct 23 & 24: <span className="text-amber-300 underline decoration-amber-400/40">9:15 AM Sharp</span>
                </h3>
                <p className="text-xs sm:text-sm text-brand-cream/70 mt-1 max-w-2xl leading-relaxed">
                  Gate entry & verification desks open at <strong>8:30 AM</strong> at RIMT University Campus. Teams must report with their official registration QR codes and student IDs.
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <Link
                href="/rules"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 hover:bg-amber-400/25 transition-colors text-xs sm:text-sm font-semibold whitespace-nowrap"
              >
                <span>General Guidelines</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Search & Filter Controls ── */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-cream/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event, venue, or coordinator..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/30 transition-all backdrop-blur-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-brand-cream/40 hover:text-brand-cream"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Segmented Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10 self-start sm:self-auto backdrop-blur-md">
            <button
              onClick={() => setScheduleFilter("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                scheduleFilter === "all"
                  ? "bg-brand-crimson text-white shadow-md shadow-brand-crimson/20"
                  : "text-brand-cream/60 hover:text-brand-cream"
              }`}
            >
              All ({allSchedulesData.length})
            </button>
            <button
              onClick={() => setScheduleFilter("scheduled")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                scheduleFilter === "scheduled"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md shadow-amber-500/10"
                  : "text-brand-cream/60 hover:text-brand-cream"
              }`}
            >
              <CheckCircle2 size={13} className="text-amber-400" />
              <span>Confirmed ({scheduledCount})</span>
            </button>
            <button
              onClick={() => setScheduleFilter("pending")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                scheduleFilter === "pending"
                  ? "bg-white/[0.12] text-brand-cream border border-white/20"
                  : "text-brand-cream/60 hover:text-brand-cream"
              }`}
            >
              <Clock4 size={13} className="text-brand-cream/40" />
              <span>Coming Soon ({pendingCount})</span>
            </button>
          </div>
        </div>

        {/* ── Category Tabs ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            const count = allSchedulesData.filter((e) =>
              cat.value === "ALL" ? true : e.category.toUpperCase().includes(cat.value.toUpperCase())
            ).length;

            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap transition-all flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? "bg-brand-gold/[0.15] border-brand-gold/40 text-brand-gold shadow-[0_0_20px_rgba(201,162,39,0.2)]"
                    : "bg-white/[0.03] border-white/8 text-brand-cream/60 hover:text-brand-cream hover:bg-white/[0.06]"
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: isSelected ? "#C9A227" : cat.color }}
                />
                <span>{cat.label}</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-brand-gold/25 text-brand-gold" : "bg-white/10 text-brand-cream/40"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Schedules List / Table ── */}
        {filteredEvents.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center my-8">
            <Clock4 className="w-10 h-10 text-brand-cream/30 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-white mb-1">No Events Found</h4>
            <p className="text-sm text-brand-cream/50 mb-4">
              Try adjusting your search query or selecting a different category arena.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
                setScheduleFilter("all");
              }}
              className="px-4 py-2 rounded-full bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop View Table */}
            <div className="hidden lg:block glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-brand-cream/50 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Event & Arena</th>
                    <th className="py-4 px-5">Date</th>
                    <th className="py-4 px-5">Time</th>
                    <th className="py-4 px-5">Duration</th>
                    <th className="py-4 px-6">Venue</th>
                    <th className="py-4 px-6">Faculty Coordinators</th>
                    <th className="py-4 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-sm">
                  {filteredEvents.map((ev, index) => {
                    const isLiterary = ev.category === "LITERARY";
                    return (
                      <motion.tr
                        key={ev.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.4) }}
                        className={`hover:bg-white/[0.04] transition-colors ${
                          ev.isScheduled ? "bg-amber-500/[0.02]" : ""
                        }`}
                      >
                        {/* Event Name & Category */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-white text-base tracking-tight mb-1">
                            {ev.name}
                          </div>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase border ${
                            ev.category === "LITERARY" ? "bg-amber-500/10 border-amber-500/30 text-amber-300" :
                            ev.category === "CULTURAL" ? "bg-rose-500/10 border-rose-500/30 text-rose-300" :
                            ev.category === "TECHNICAL" ? "bg-blue-500/10 border-blue-500/30 text-blue-300" :
                            ev.category === "BUSINESS" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" :
                            ev.category === "FINE ARTS" ? "bg-purple-500/10 border-purple-500/30 text-purple-300" :
                            "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                          }`}>
                            {ev.category}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-5">
                          {ev.isScheduled ? (
                            <div className="font-semibold text-brand-cream/90 flex items-center gap-1.5">
                              <Calendar size={14} className="text-brand-gold shrink-0" />
                              <span>{ev.date}</span>
                            </div>
                          ) : (
                            <span className="text-brand-cream/35 text-xs italic">Coming Soon</span>
                          )}
                        </td>

                        {/* Time */}
                        <td className="py-4 px-5">
                          {ev.isScheduled ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/[0.12] border border-brand-gold/30 text-brand-gold font-bold text-xs tracking-wide">
                              <Clock size={12} />
                              <span>{ev.time}</span>
                            </div>
                          ) : (
                            <span className="text-brand-cream/35 text-xs italic">Coming Soon</span>
                          )}
                        </td>

                        {/* Duration */}
                        <td className="py-4 px-5 text-brand-cream/70 text-xs">
                          {ev.duration || "—"}
                        </td>

                        {/* Venue */}
                        <td className="py-4 px-6">
                          {ev.isScheduled ? (
                            <div className="flex items-start gap-1.5 text-white/90 font-medium">
                              <MapPin size={15} className="text-rose-400 shrink-0 mt-0.5" />
                              <span className="max-w-[200px] leading-snug">{ev.venue}</span>
                            </div>
                          ) : (
                            <span className="text-brand-cream/35 text-xs italic">Coming Soon</span>
                          )}
                        </td>

                        {/* Coordinators */}
                        <td className="py-4 px-6">
                          {ev.isScheduled ? (
                            ev.coordinators ? (
                              <div className="flex items-start gap-1.5 text-brand-cream/80 text-xs font-medium">
                                <UserCheck size={14} className="text-brand-gold shrink-0 mt-0.5" />
                                <span className="max-w-[220px] leading-snug">{ev.coordinators}</span>
                              </div>
                            ) : (
                              <span className="text-brand-cream/35 text-xs italic">Help Desk / Assigned at Venue</span>
                            )
                          ) : (
                            <span className="text-brand-cream/35 text-xs italic">Coming Soon</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 text-right">
                          {ev.isScheduled ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Confirmed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/40 text-xs font-medium">
                              <Sparkles size={11} className="text-amber-400/60" />
                              Coming Soon
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Card View */}
            <div className="lg:hidden space-y-4">
              {filteredEvents.map((ev, index) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.4) }}
                  className={`glass-card rounded-2xl p-5 border ${
                    ev.isScheduled
                      ? "border-brand-gold/30 bg-gradient-to-br from-brand-gold/[0.06] to-transparent"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase mb-1.5 border ${
                        ev.category === "LITERARY" ? "bg-amber-500/10 border-amber-500/30 text-amber-300" :
                        ev.category === "CULTURAL" ? "bg-rose-500/10 border-rose-500/30 text-rose-300" :
                        ev.category === "TECHNICAL" ? "bg-blue-500/10 border-blue-500/30 text-blue-300" :
                        ev.category === "BUSINESS" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" :
                        ev.category === "FINE ARTS" ? "bg-purple-500/10 border-purple-500/30 text-purple-300" :
                        "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                      }`}>
                        {ev.category}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                        {ev.name}
                      </h4>
                    </div>

                    <div className="shrink-0">
                      {ev.isScheduled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/40 text-[11px] font-medium">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scheduled Details */}
                  {ev.isScheduled ? (
                    <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                      <div className="flex items-center justify-between text-brand-cream/80">
                        <span className="flex items-center gap-1.5 text-brand-gold font-semibold">
                          <Calendar size={13} />
                          {ev.date}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold font-bold">
                          <Clock size={11} />
                          {ev.time}
                        </span>
                      </div>

                      {ev.duration && (
                        <div className="text-brand-cream/60">
                          <span className="text-brand-cream/40">Duration:</span> {ev.duration}
                        </div>
                      )}

                      <div className="flex items-start gap-1.5 text-white/90 pt-1">
                        <MapPin size={14} className="text-rose-400 shrink-0 mt-0.5" />
                        <span><strong>Venue:</strong> {ev.venue}</span>
                      </div>

                      {ev.coordinators ? (
                        <div className="flex items-start gap-1.5 text-brand-cream/70 pt-1">
                          <UserCheck size={14} className="text-brand-gold shrink-0 mt-0.5" />
                          <span><strong>Coordinators:</strong> {ev.coordinators}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                      <span>Venue & Timing</span>
                      <span className="italic text-amber-400/70">Announcing Shortly</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* ── Footer Link to Rules ── */}
        <div className="mt-16 text-center">
          <p className="text-sm text-brand-cream/50 mb-3">
            Need specific competition rules, rounds, or judging criteria?
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-gold hover:text-white transition-colors"
          >
            <span>Explore All 30+ Event Guidelines</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
