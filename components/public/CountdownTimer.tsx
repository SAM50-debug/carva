"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Target Date: 16th Oct 2026, 23:59:59 IST
// IST is UTC+05:30
const TARGET_DATE = new Date("2026-10-16T23:59:59+05:30").getTime();

function FlipUnit({ value, label }: { value: number; label: string }) {
  const paddedValue = value.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl shadow-black/50" style={{ perspective: "1000px" }}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={paddedValue}
            initial={{ rotateX: -90, opacity: 0, y: -20, scale: 0.8 }}
            animate={{ rotateX: 0, opacity: 1, y: 0, scale: 1 }}
            exit={{ rotateX: 90, opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            className="absolute text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tighter"
            style={{ transformOrigin: "center center" }}
          >
            {paddedValue}
          </motion.div>
        </AnimatePresence>
        
        {/* Glossy overlay for glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-xl" />
        {/* Horizontal divider to simulate flip clock split */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/30 shadow-[0_1px_0_rgba(255,255,255,0.1)] z-10" />
      </div>
      <span className="mt-3 text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

export function CountdownTimer({ onExpire }: { onExpire: () => void }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = TARGET_DATE - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    // Set initial time
    const initialTime = calculateTime();
    setTimeLeft(initialTime);
    
    if (initialTime.days === 0 && initialTime.hours === 0 && initialTime.minutes === 0 && initialTime.seconds === 0) {
        onExpire();
    }

    const interval = setInterval(() => {
      const newTime = calculateTime();
      setTimeLeft(newTime);
      
      if (newTime.days === 0 && newTime.hours === 0 && newTime.minutes === 0 && newTime.seconds === 0) {
          onExpire();
          clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onExpire]);

  if (!timeLeft) {
    // Return empty placeholder with same dimensions to avoid layout shift
    return (
      <div className="flex gap-3 sm:gap-4 md:gap-6 justify-center mb-8 opacity-0">
        <FlipUnit value={0} label="Days" />
        <FlipUnit value={0} label="Hours" />
        <FlipUnit value={0} label="Minutes" />
        <FlipUnit value={0} label="Seconds" />
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 md:gap-6 justify-center mb-8 w-full">
      <FlipUnit value={timeLeft.days} label="Days" />
      <FlipUnit value={timeLeft.hours} label="Hours" />
      <FlipUnit value={timeLeft.minutes} label="Minutes" />
      <FlipUnit value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}
