"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  GraduationCap,
  Trophy,
  Phone,
  Calendar,
  Building,
  Star,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export interface FeedbackDetailItem {
  _id: string;
  studentName: string;
  mobile: string;
  university: string;
  eventName: string;
  submittedAt?: string | null;
  comments?: string;
  ratings?: Record<string, string>;
}

const QUESTION_LABELS: { key: string; label: string; category: "campus" | "event" | "overall" }[] = [
  // Campus & Facilities
  { key: "q1_campus_environment", label: "1. Campus Environment", category: "campus" },
  { key: "q2_staff_volunteers", label: "2. Staff & Volunteers", category: "campus" },
  { key: "q3_locating_venue", label: "3. Locating Venue & Facilities", category: "campus" },
  { key: "q4_registration_process", label: "4. Registration & Reporting Process", category: "campus" },
  { key: "q9_campus_cleanliness", label: "9. Campus Cleanliness", category: "campus" },
  { key: "q10_washrooms", label: "10. Washroom Cleanliness", category: "campus" },
  { key: "q11_drinking_water", label: "11. Drinking Water Facilities", category: "campus" },
  { key: "q12_food_refreshments", label: "12. Food & Refreshments", category: "campus" },
  { key: "q13_signage_directions", label: "13. Signage & Directions", category: "campus" },
  { key: "q14_parking_transport", label: "14. Parking & Transport", category: "campus" },

  // Event Coordination
  { key: "q5_schedule_communication", label: "5. Schedule Communication", category: "event" },
  { key: "q6_event_management", label: "6. Event Coordination & Management", category: "event" },
  { key: "q7_venue_arrangements", label: "7. Competition Venue Arrangements", category: "event" },
  { key: "q8_required_facilities", label: "8. Facilities (Seating/Stage/Sound/Light)", category: "event" },
  { key: "q15_schedule_adherence", label: "15. Schedule Adherence", category: "event" },
  { key: "q16_query_handling", label: "16. Query & Issue Handling", category: "event" },
  { key: "q17_fair_competition", label: "17. Fair & Transparent Judging", category: "event" },
  { key: "q18_safety_security", label: "18. Safety & Security Arrangements", category: "event" },

  // Overall Experience
  { key: "q19_visit_again", label: "19. Participate / Visit CARAVAN Again", category: "overall" },
  { key: "q20_overall_experience", label: "20. Overall CARAVAN '26 Experience", category: "overall" },
];

export default function FeedbackDetailModal({
  item,
  onClose,
}: {
  item: FeedbackDetailItem | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lock background scrolling on mobile & desktop when modal is active
    if (item) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [item]);

  if (!item || !mounted) return null;

  const ratings = item.ratings || {};

  const getBadgeColor = (val: string = "") => {
    const v = val.toLowerCase();
    if (
      v.includes("excellent") ||
      v.includes("very easy") ||
      v.includes("very satisfied") ||
      v.includes("fully") ||
      v.includes("definitely") ||
      v === "yes" ||
      v === "always"
    ) {
      return "bg-emerald-500/15 border-emerald-500/40 text-emerald-300";
    }
    if (
      v.includes("good") ||
      v.includes("easy") ||
      v.includes("satisfied") ||
      v.includes("mostly") ||
      v.includes("probably") ||
      v === "usually"
    ) {
      return "bg-blue-500/15 border-blue-500/40 text-blue-300";
    }
    if (
      v.includes("average") ||
      v.includes("neutral") ||
      v.includes("partly") ||
      v.includes("not sure") ||
      v === "sometimes"
    ) {
      return "bg-amber-500/15 border-amber-500/40 text-amber-300";
    }
    if (
      v.includes("poor") ||
      v.includes("difficult") ||
      v.includes("dissatisfied") ||
      v.includes("inadequate") ||
      v === "no" ||
      v === "never"
    ) {
      return "bg-rose-500/15 border-rose-500/40 text-rose-300";
    }
    return "bg-white/10 border-white/10 text-slate-300";
  };

  const campusQuestions = QUESTION_LABELS.filter((q) => q.category === "campus");
  const eventQuestions = QUESTION_LABELS.filter((q) => q.category === "event");
  const overallQuestions = QUESTION_LABELS.filter((q) => q.category === "overall");

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-slate-950 border border-white/15 shadow-2xl shadow-black/80 text-white overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative px-5 py-4 border-b border-white/10 bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 truncate">
                <span>Participant Responses</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/30 font-semibold shrink-0">
                  20 Qs
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                {item.submittedAt ? new Date(item.submittedAt).toLocaleString("en-IN") : "Recorded"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Participant Info Chips */}
        <div className="px-5 py-2.5 bg-white/[0.02] border-b border-white/5 flex flex-wrap items-center gap-2 text-xs shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
            <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold text-white">{item.studentName}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{item.mobile}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 max-w-[220px] truncate">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{item.university}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 max-w-[200px] truncate">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-medium text-amber-300 truncate">{item.eventName}</span>
          </div>
        </div>

        {/* Scrollable Questions & Answers Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6 scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent">
          {/* Section 1: Campus & Facilities */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 pb-1 border-b border-white/5">
              <Building className="w-3.5 h-3.5" /> Part 1: Campus Environment & Facilities (10 Qs)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {campusQuestions.map((q) => {
                const answer = ratings[q.key] || "Not answered";
                return (
                  <div
                    key={q.key}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2.5"
                  >
                    <span className="text-xs text-slate-300 font-medium leading-snug">
                      {q.label}
                    </span>
                    <span
                      className={`inline-flex items-center shrink-0 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${getBadgeColor(
                        answer
                      )}`}
                    >
                      {answer}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Event Coordination */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-400 pb-1 border-b border-white/5">
              <Calendar className="w-3.5 h-3.5" /> Part 2: Event Coordination & Management (8 Qs)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {eventQuestions.map((q) => {
                const answer = ratings[q.key] || "Not answered";
                return (
                  <div
                    key={q.key}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2.5"
                  >
                    <span className="text-xs text-slate-300 font-medium leading-snug">
                      {q.label}
                    </span>
                    <span
                      className={`inline-flex items-center shrink-0 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${getBadgeColor(
                        answer
                      )}`}
                    >
                      {answer}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Overall & Suggestions */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400 pb-1 border-b border-white/5">
              <Star className="w-3.5 h-3.5" /> Part 3: Overall Impressions & Suggestions (2 Qs)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {overallQuestions.map((q) => {
                const answer = ratings[q.key] || "Not answered";
                return (
                  <div
                    key={q.key}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2.5"
                  >
                    <span className="text-xs text-slate-300 font-medium leading-snug">
                      {q.label}
                    </span>
                    <span
                      className={`inline-flex items-center shrink-0 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${getBadgeColor(
                        answer
                      )}`}
                    >
                      {answer}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Comments Box */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5 mt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <MessageSquare className="w-3.5 h-3.5 text-brand-gold" />
                Additional Comments / Suggestions
              </div>
              <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 text-xs text-slate-200 min-h-[48px] whitespace-pre-wrap leading-relaxed">
                {item.comments ? (
                  item.comments
                ) : (
                  <span className="text-slate-500 italic">No additional suggestions provided.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-slate-900/90 backdrop-blur-md flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
