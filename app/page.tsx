"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { eventsData } from "@/data/events";
import { ArrowRight, Sparkles, Code2, Briefcase, Palette, BookOpen, Video, Calendar } from "lucide-react";
import { useRef, useEffect, useState } from "react";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const opacityHero = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const yHero = useTransform(scrollYProgress, [0, 0.4], ["0%", "15%"]);

  // Mouse parallax for ambient blobs
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const categories = [
    { name: "CULTURAL EVENTS", slug: "CULTURAL", icon: Sparkles, color: "#D21B21" },
    { name: "TECHNICAL EVENTS", slug: "TECHNICAL", icon: Code2, color: "#3b82f6" },
    { name: "BUSINESS BATTLES", slug: "BUSINESS", icon: Briefcase, color: "#10b981" },
    { name: "FINE ARTS EVENTS", slug: "FINE ARTS", icon: Palette, color: "#a855f7" },
    { name: "LITERARY EVENTS", slug: "LITERARY", icon: BookOpen, color: "#f59e0b" },
    { name: "MEDIA CLUB", slug: "MEDIA", icon: Video, color: "#6366f1" },
  ];

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { type: "spring", stiffness: 200, damping: 22, delay: i * 0.12 }
    })
  };

  return (
    <div className="flex flex-col overflow-hidden min-h-screen" ref={containerRef}>

      {/* ── Ambient 3D Background & Video ── */}
      <div className="ambient-bg">
        <motion.div style={{ opacity: opacityHero }} className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-screen"
            src="/hero.mp4"
          />
        </motion.div>
        {/* Dark overlay shield to guarantee text readability */}
        <div className="absolute inset-0 bg-[#08122A]/70 z-0 pointer-events-none" />

        <motion.div
          className="ambient-blob-1"
          style={{ x: mouse.x * -0.5, y: mouse.y * -0.5 }}
          transition={{ type: "spring", stiffness: 60, damping: 20 }}
        />
        <motion.div
          className="ambient-blob-2"
          style={{ x: mouse.x * 0.3, y: mouse.y * 0.3 }}
          transition={{ type: "spring", stiffness: 60, damping: 20 }}
        />
        <div className="ambient-blob-3" />
      </div>

      {/* ── Hero ── */}
      <section className="relative pt-32 md:pt-40 pb-32 px-4 md:px-6 max-w-7xl mx-auto w-full flex flex-col items-center justify-center text-center z-10 min-h-screen overflow-hidden">
        <motion.div
          style={{ opacity: opacityHero, y: yHero }}
          className="relative w-full max-w-5xl mx-auto"
        >
          {/* Date badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-brand-gold/[0.08] border border-brand-gold/30 mb-10"
          >
            <span className="w-2 h-2 rounded-full bg-brand-gold" style={{ animation: "dot-pulse 1.5s ease-in-out infinite" }} />
            <Calendar size={14} className="text-brand-gold" />
            <span className="text-sm font-semibold text-brand-cream/90">October 23–24, 2026 · RIMT University</span>
          </motion.div>

          {/* Headline — word-by-word entrance */}
          <div className="overflow-hidden mb-6">
            <div className="text-[4rem] sm:text-[5rem] md:text-[8.5rem] leading-[0.9] font-sans font-black tracking-tighter">
              {["Connect.", "Create.", "Celebrate."].map((word, i) => (
                <motion.span
                  key={word}
                  custom={i}
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                  className={`block ${
                    i === 2 ? "text-brand-crimson" :
                    i === 1 ? "text-brand-gold" :
                    "text-brand-cream"
                  }`}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.55 }}
            className="text-xl md:text-2xl text-white/50 mb-14 max-w-2xl mx-auto font-medium"
          >
            The ultimate Inter-University Youth Festival. 30+ events across 6 arenas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200, damping: 22 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.a
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              href="https://forms.cloud.microsoft/r/3c3TxNrbsM"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto bg-brand-crimson text-brand-cream px-10 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(196,30,58,0.4)] hover:shadow-[0_0_60px_rgba(196,30,58,0.6)] transition-shadow"
            >
              Register Now <ArrowRight size={20} />
            </motion.a>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/events"
                className="w-full sm:w-auto bg-brand-cream/[0.07] text-brand-cream px-10 py-4 rounded-full font-bold text-lg border border-brand-cream/20 hover:bg-brand-cream/[0.12] transition-colors flex items-center justify-center"
              >
                Explore Events
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 bounce-chevron text-white/30"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.div>
      </section>

      {/* ── Categories ── */}
      <section id="categories" className="relative z-10 py-20 md:py-32 px-4 md:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-1.5 bg-brand-gold/[0.08] text-brand-gold/80 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-6 border border-brand-gold/20">
              6 Competition Arenas
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-brand-cream mb-6">Explore the Arena</h2>
            <p className="text-xl text-brand-cream/40 max-w-2xl mx-auto">Discover the perfect stage for your talent.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              const count = eventsData.filter(e =>
                e.category === cat.slug || e.category.startsWith(cat.slug.split(" ")[0])
              ).length;

              const isLeft = i % 3 === 0;
              const isRight = i % 3 === 1;
              const xDir = isLeft ? -60 : isRight ? 60 : 0;
              const yDir = !isLeft && !isRight ? 40 : 0;

              return (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, x: xDir, y: yDir }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ type: "spring", stiffness: 120, damping: 18, delay: i * 0.08 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ willChange: "transform, opacity" }}
                  className="h-full"
                >
                  <Link
                    href={`/events`}
                    className="group glass-card relative flex flex-col h-full p-6 md:p-10 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden transition-colors duration-300"
                  >
                    {/* Pre-rendered glow — fades via opacity only */}
                    <div className="card-glow" />

                    {/* Accent corner */}
                    <div
                      className="absolute top-0 right-0 w-40 h-40 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                      style={{ background: `radial-gradient(ellipse at top right, ${cat.color}, transparent 70%)` }}
                    />

                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-brand-cream/10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <Icon style={{ color: cat.color }} className="w-7 h-7" />
                    </div>

                    <h3 className="text-xl font-black text-brand-cream tracking-tight mb-2">{cat.name}</h3>
                    <p className="text-brand-cream/40 font-medium mb-8 flex-1">{count} Competitions</p>

                    <div className="flex items-center text-brand-cream/40 font-semibold text-sm group-hover:text-brand-gold transition-colors mt-auto">
                      View Events <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
