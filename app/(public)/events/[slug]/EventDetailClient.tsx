"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, Users, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

const CATEGORY_GRADIENTS: Record<string, string> = {
  CULTURAL: "from-rose-900/50 via-red-900/20 to-transparent",
  TECHNICAL: "from-blue-900/50 via-blue-900/20 to-transparent",
  BUSINESS: "from-emerald-900/50 via-emerald-900/20 to-transparent",
  "FINE ARTS": "from-purple-900/50 via-purple-900/20 to-transparent",
  LITERARY: "from-amber-900/50 via-amber-900/20 to-transparent",
  MEDIA: "from-indigo-900/50 via-indigo-900/20 to-transparent",
};
const CATEGORY_COLORS: Record<string, string> = {
  CULTURAL: "#D21B21",
  TECHNICAL: "#3b82f6",
  BUSINESS: "#10b981",
  "FINE ARTS": "#a855f7",
  LITERARY: "#f59e0b",
  MEDIA: "#6366f1",
};

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
};

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="glass-card rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 relative overflow-hidden"
    >
      <div className="card-glow" />
      <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 border"
          style={{ backgroundColor: "rgba(201,162,39,0.12)", borderColor: "rgba(201,162,39,0.35)", color: "#C9A227" }}
        >
          {num}
        </span>
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

export default function EventDetailClient({ event }: { event: { id: string; name: string; category: string; description: string; teamSize: string; duration?: string; objective?: string; theme?: string; rounds?: string[]; rules?: string[]; deliverables?: string[]; judgingCriteria?: string[]; participation?: any } }) {
  const gradient = CATEGORY_GRADIENTS[event.category] ?? "from-white/5 to-transparent";
  const color = CATEGORY_COLORS[event.category] ?? "#ffffff";
  const [isNavigating, setIsNavigating] = useState(false);

  const isFashionModeling = event.name.toLowerCase().includes("fashion modeling");
  const displayRules = [...(event.rules || [])];
  
  if (isFashionModeling) {
    displayRules.unshift(
      "Must have 11 to 13 participants.",
      "Only one team allowed per university.",
      "Prohibited on stage: original gun, sword, knife, fire, etc.",
      "Performance time: 12 to 15 minutes (disqualification if violated)."
    );
  }

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Ambient */}
      <div className="ambient-bg">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />
      </div>

      {/* Category hero gradient banner */}
      <div className={`absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b ${gradient} z-0 pointer-events-none`} />

      <div className="container mx-auto px-6 max-w-4xl relative z-10 pt-36">
        {/* Back */}
        <motion.div whileHover={isNavigating ? {} : { scale: 1.05, x: -4 }} whileTap={isNavigating ? {} : { scale: 0.95 }} className="inline-block mb-10">
          <Link
            href="/events"
            onClick={() => setIsNavigating(true)}
            className={`inline-flex items-center gap-2 text-sm font-semibold transition-opacity bg-brand-cream/[0.05] px-4 py-2 rounded-full border border-brand-cream/10 ${
              isNavigating ? "text-brand-gold opacity-80 pointer-events-none" : "text-brand-cream/40 hover:text-brand-cream/80"
            }`}
          >
            {isNavigating ? (
              <><Loader2 size={14} className="animate-spin" /> Returning...</>
            ) : (
              <><ArrowLeft size={14} /> Back to Events</>
            )}
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="mb-12"
        >
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border"
            style={{ color, borderColor: `${color}30`, backgroundColor: `${color}15` }}
          >
            {event.category}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold text-brand-cream mb-6 md:mb-8 tracking-tight drop-shadow">
            {event.name}
          </h1>

          {/* Info strip */}
          <div className="glass-card rounded-[1.5rem] flex flex-wrap divide-y sm:divide-y-0 sm:divide-x divide-brand-cream/[0.06] overflow-hidden">
            <div className="flex-1 min-w-[120px] p-4 md:p-6 hover:bg-brand-cream/[0.03] transition-colors">
              <p className="text-[10px] md:text-xs font-bold text-brand-cream/30 uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-2">
                <Users size={12} /> Team Size
              </p>
              <p className="font-bold text-base md:text-lg text-brand-cream">{event.teamSize}</p>
            </div>
            {event.duration && (
              <div className="flex-1 min-w-[120px] p-4 md:p-6 hover:bg-brand-cream/[0.03] transition-colors">
                <p className="text-[10px] md:text-xs font-bold text-brand-cream/30 uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-2">
                  <Clock size={12} /> Duration
                </p>
                <p className="font-bold text-base md:text-lg text-brand-cream">{event.duration}</p>
              </div>
            )}
            <div className="flex-1 min-w-[120px] p-4 md:p-6 hover:bg-brand-cream/[0.03] transition-colors">
              <p className="text-[10px] md:text-xs font-bold text-brand-cream/30 uppercase tracking-widest mb-1 md:mb-2">Category</p>
              <p className="font-bold text-base md:text-lg" style={{ color }}>{event.category}</p>
            </div>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          <Section num="01" title="About">
            <p className="text-white/50 text-lg leading-relaxed font-medium">{event.description}</p>
          </Section>

          {(event.objective || event.theme) && (
            <Section num="02" title="Objective & Theme">
              <div className="space-y-4">
                {event.objective && (
                  <p className="text-white/50 leading-relaxed">
                    <strong className="text-white/80 font-bold">Objective:</strong> {event.objective}
                  </p>
                )}
                {event.theme && (
                  <p className="text-white/50 leading-relaxed">
                    <strong className="text-white/80 font-bold">Theme:</strong> {event.theme}
                  </p>
                )}
              </div>
            </Section>
          )}

          {event.rounds && event.rounds.length > 0 && (
            <Section num="03" title="Competition Format">
              <motion.ul variants={listVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {event.rounds.map((round, i) => (
                  <motion.li key={i} variants={itemVariants} className="flex items-start text-white/50 font-medium bg-white/[0.04] rounded-xl px-4 py-3 border border-white/[0.06]">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 mr-3 shrink-0" style={{ backgroundColor: color }} />
                    {round}
                  </motion.li>
                ))}
              </motion.ul>
            </Section>
          )}

          {displayRules.length > 0 && (
            <Section num="04" title="Rules & Guidelines">
              <motion.ul variants={listVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-3">
                {displayRules.map((rule, i) => (
                  <motion.li key={i} variants={itemVariants} className="flex items-start text-white/50 font-medium leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full mt-2.5 mr-4 shrink-0 bg-brand-red" />
                    {rule}
                  </motion.li>
                ))}
              </motion.ul>
            </Section>
          )}

          {event.deliverables && event.deliverables.length > 0 && (
            <Section num="05" title="Deliverables">
              <div className="flex flex-wrap gap-3">
                {event.deliverables.map((del, i) => (
                  <span key={i} className="px-4 py-2 rounded-xl text-sm font-bold bg-white/[0.06] text-white/50 border border-white/8">
                    {del}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {event.judgingCriteria && event.judgingCriteria.length > 0 && (
            <Section num="06" title="Judging Criteria">
              <motion.ul variants={listVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-3">
                {event.judgingCriteria.map((crit, i) => (
                  <motion.li key={i} variants={itemVariants} className="flex items-start text-white/50 font-medium leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full mt-2.5 mr-4 shrink-0" style={{ backgroundColor: color }} />
                    {crit}
                  </motion.li>
                ))}
              </motion.ul>
            </Section>
          )}

          {/* Entry Fee */}
          <Section num="07" title="Entry Fee">
            <div className="overflow-hidden rounded-2xl border border-white/10 p-6 bg-white/[0.03]">
              <p className="text-xl font-bold text-center" style={{ color }}>Registration is free</p>
            </div>
          </Section>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="group glass-card relative rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-16 text-center overflow-hidden"
          >
            <div className="card-glow" />
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-bl-full opacity-10 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at top right, ${color}, transparent 70%)` }}
            />
            
            <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-brand-cream mb-4 relative z-10">
              Ready to compete in {event.name}?
            </h3>
            <p className="text-brand-cream/70 text-lg font-medium mb-10 relative z-10">
              Secure your spot and represent your university.
            </p>
            <motion.a
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              href={`/register?event=${event.id}`}
              className="inline-flex items-center gap-3 bg-brand-crimson text-brand-cream px-10 py-5 rounded-full font-extrabold shadow-[0_0_40px_rgba(196,30,58,0.3)] hover:shadow-[0_0_60px_rgba(201,162,39,0.5)] transition-shadow relative z-10"
            >
              REGISTER NOW <ArrowRight size={20} />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
