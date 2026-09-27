"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { eventsData, Category } from "@/data/events";
import { Search, Users, Clock, ArrowRight, Loader2 } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  CULTURAL: "#D21B21",
  TECHNICAL: "#3b82f6",
  BUSINESS: "#10b981",
  "FINE ARTS": "#a855f7",
  LITERARY: "#f59e0b",
  MEDIA: "#6366f1",
};



function EventCard({
  event,
  index,
  onActivate,
}: {
  event: (typeof eventsData)[0];
  index: number;
  onActivate: (color: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { margin: "-35% 0px -55% 0px", once: false });
  const isEven = index % 2 === 0;
  const color = CATEGORY_COLORS[event.category] || "#ffffff";

  const [isNavigating, setIsNavigating] = useState(false);

  // Notify parent of active color change
  useEffect(() => {
    if (isInView) onActivate(color);
  }, [isInView, color, onActivate]);

  return (
    <div ref={cardRef} className="relative w-full flex items-center pl-16 pr-6 md:px-0">

      {/* Timeline dot — always on the spine */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 z-20 w-5 h-5 rounded-full border-2 border-[#080d1a] transition-all duration-500
          left-[14px] md:left-1/2 md:-translate-x-1/2
          ${isInView ? "dot-active scale-125" : "scale-100"}`}
        style={{ backgroundColor: isInView ? color : "rgba(255,255,255,0.15)" }}
      >
        {isInView && (
          <span
            className="absolute inset-0 rounded-full border-2 animate-ping"
            style={{ borderColor: color, opacity: 0.5 }}
          />
        )}
      </div>

      {/* Connector line from card to spine */}
      <div
        className={`hidden md:block absolute top-1/2 -translate-y-1/2 h-[2px] w-12 transition-all duration-500
          ${isEven ? "left-[calc(50%-13rem-3rem)] md:left-[calc(50%-3rem)]" : "right-[calc(50%-13rem-3rem)] md:right-[calc(50%-3rem)]"}
          ${isInView ? "opacity-80" : "opacity-10"}`}
        style={{ backgroundColor: isInView ? color : "rgba(255,255,255,0.3)" }}
      />

      {/* Card — left half (even) or right half (odd) */}
      <motion.div
        animate={{ opacity: isInView ? 1 : 0.25, scale: isInView ? 1 : 0.97 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        style={{ willChange: "transform, opacity" }}
        className={`w-full md:w-[calc(50%-3.5rem)] ${isEven ? "md:mr-auto" : "md:ml-auto"}`}
      >
        <div className="group glass-card relative rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 overflow-hidden transition-colors duration-300">
          <div className="card-glow" />
          <div
            className="absolute top-0 left-0 w-32 h-32 rounded-br-full opacity-0 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at top left, ${color}, transparent)` }}
          />

          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border"
            style={{ color, borderColor: `${color}30`, backgroundColor: `${color}15` }}
          >
            {event.category}
          </span>

          <h3 className="text-2xl font-black text-brand-cream mb-3">{event.name}</h3>
          <p className="text-brand-cream/40 mb-6 font-medium leading-relaxed line-clamp-2 text-sm">{event.description}</p>

          <div className="flex flex-wrap gap-2 mb-7">
            <span className="inline-flex items-center text-xs font-bold bg-brand-cream/[0.06] text-brand-cream/50 px-3 py-1.5 rounded-full border border-brand-cream/10">
              <Users className="w-3.5 h-3.5 mr-1.5 text-brand-cream/30" /> {event.teamSize}
            </span>
            {event.duration && (
              <span className="inline-flex items-center text-xs font-bold bg-brand-cream/[0.06] text-brand-cream/50 px-3 py-1.5 rounded-full border border-brand-cream/10">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-brand-cream/30" /> {event.duration}
              </span>
            )}
          </div>

          <motion.div whileHover={isNavigating ? {} : { scale: 1.05, x: 4 }} whileTap={isNavigating ? {} : { scale: 0.95 }} className="inline-block">
            <Link
              href={`/events/${event.id}`}
              onClick={() => setIsNavigating(true)}
              className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${
                isNavigating
                  ? "text-brand-gold opacity-80 pointer-events-none"
                  : "text-brand-cream/60 group-hover:text-brand-gold"
              }`}
            >
              {isNavigating ? (
                <>
                  LOADING <Loader2 size={14} className="animate-spin" />
                </>
              ) : (
                <>
                  VIEW DETAILS <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "ALL">("ALL");
  const [activeColor, setActiveColor] = useState("#C41E3A");

  const handleActivate = useCallback((color: string) => {
    setActiveColor(color);
  }, []);

  const categories: (Category | "ALL")[] = ["ALL", "CULTURAL", "TECHNICAL", "BUSINESS", "FINE ARTS", "LITERARY", "MEDIA"];

  const filteredEvents = useMemo(() => {
    return eventsData.filter(event => {
      const matchSearch =
        event.name.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === "ALL" || event.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory]);

  // Scroll-spark setup
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  });
  const sparkY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const fillScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Ambient */}
      <div className="ambient-bg">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="mb-16 text-center max-w-3xl mx-auto"
        >
          <span className="inline-block px-4 py-1.5 bg-brand-gold/[0.08] text-brand-gold/80 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-6 border border-brand-gold/20">
            All Events
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold text-brand-cream mb-5 tracking-tight">
            Event Explorer
          </h1>
          <p className="text-brand-cream/40 text-xl font-medium">Discover your stage. Find your passion.</p>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
          className="glass-card rounded-3xl p-6 mb-20 max-w-4xl mx-auto"
        >
          <div className="flex flex-col md:flex-row gap-5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream/30 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                className="w-full bg-brand-cream/[0.05] border border-brand-cream/10 rounded-2xl pl-12 pr-4 py-4 text-brand-cream placeholder:text-brand-cream/25 focus:outline-none focus:border-brand-gold/50 font-medium transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {categories.map(cat => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-colors border ${
                    selectedCategory === cat
                      ? "bg-brand-cream text-brand-dark border-brand-cream shadow-lg shadow-brand-cream/10"
                      : "bg-brand-cream/[0.05] text-brand-cream/40 border-brand-cream/10 hover:text-brand-cream/70 hover:bg-brand-cream/[0.08]"
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative" ref={timelineRef}>
          {/* Static grey spine */}
          <div className="absolute left-[24px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-[2px] bg-white/[0.06] rounded-full" />

          {/* scaleY fill — grows top→bottom with scroll, color matches active card */}
          <motion.div
            className="absolute left-[24px] md:left-1/2 md:-translate-x-px top-0 w-[3px] rounded-full origin-top"
            style={{
              scaleY: fillScaleY,
              height: "100%",
              backgroundColor: activeColor,
              willChange: "transform",
              transition: "background-color 0.6s ease",
            }}
          />

          {/* Spark orb — color matches active card */}
          <motion.div
            className="absolute left-[24px] -translate-x-[45%] md:left-1/2 md:-translate-x-1/2 z-30"
            style={{ top: 0, y: sparkY, willChange: "transform" }}
          >
            <div className="absolute inset-0 -m-5 rounded-full blur-lg spark-aura" style={{ backgroundColor: `${activeColor}40` }} />
            <div
              className="relative w-5 h-5 rounded-full border-2 border-brand-cream/60"
              style={{ backgroundColor: activeColor, boxShadow: `0 0 20px 4px ${activeColor}80` }}
            />
          </motion.div>

          {/* Cards */}
          <div className="flex flex-col gap-16 md:gap-24 py-8">
            {filteredEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 glass-card rounded-3xl relative z-10"
              >
                <p className="text-brand-cream/30 font-medium text-lg">No events found matching your criteria.</p>
              </motion.div>
            ) : (
              filteredEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  onActivate={handleActivate}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
