"use client";
import { ArrowLeft } from "lucide-react";

export default function Loading() {
  return (
    <div className="relative min-h-screen pb-24 overflow-hidden pt-36">
      {/* Ambient static for loading */}
      <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-white/5 to-transparent z-0 pointer-events-none" />

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        {/* Back Button Skeleton */}
        <div className="inline-flex items-center gap-2 mb-10 bg-white/[0.02] px-4 py-2 rounded-full border border-white/5 opacity-50 cursor-not-allowed animate-pulse">
          <ArrowLeft size={14} className="text-white/20" /> 
          <div className="w-24 h-4 bg-white/10 rounded" />
        </div>

        {/* Header Skeleton */}
        <div className="mb-12 animate-pulse">
          {/* Category Badge */}
          <div className="w-24 h-6 rounded-full bg-white/10 mb-4" />
          
          {/* Title */}
          <div className="h-16 md:h-20 bg-white/10 rounded-2xl w-3/4 mb-6 md:mb-8" />

          {/* Info Strip */}
          <div className="glass-card rounded-[1.5rem] flex flex-wrap h-24 divide-x divide-white/[0.06] overflow-hidden opacity-50" />
        </div>

        <div className="space-y-12 animate-pulse opacity-50">
          {/* Section 1 Skeleton */}
          <div className="glass-card rounded-[1.5rem] p-6 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-white/10 shrink-0" />
              <div className="h-6 bg-white/10 rounded w-1/3" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-5/6" />
              <div className="h-4 bg-white/10 rounded w-4/6" />
            </div>
          </div>

          {/* Section 2 Skeleton */}
          <div className="glass-card rounded-[1.5rem] p-6 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-white/10 shrink-0" />
              <div className="h-6 bg-white/10 rounded w-1/4" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
