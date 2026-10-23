"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquareHeart,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building,
  CalendarCheck,
  Star,
  User,
  GraduationCap,
  Trophy,
} from "lucide-react";
import { FeedbackRatings } from "@/lib/validators/feedbackSchema";

interface ParticipantFeedbackModalProps {
  isOpen: boolean;
  student: {
    name: string;
    mobile: string;
    university: string;
  };
  event: {
    registrationId: string;
    eventId: string;
    eventName: string;
  };
  onSuccess: () => void;
  onCancel?: () => void;
}

interface QuestionDef {
  key: keyof FeedbackRatings;
  title: string;
  options: string[];
}

const SECTION_1_QUESTIONS: QuestionDef[] = [
  {
    key: "q1_campus_environment",
    title: "1. How would you rate the overall campus environment?",
    options: ["Excellent", "Good", "Average", "Poor"],
  },
  {
    key: "q2_staff_volunteers",
    title: "2. How welcoming and helpful were the university staff and volunteers?",
    options: ["Excellent", "Good", "Average", "Poor"],
  },
  {
    key: "q3_locating_venue",
    title: "3. How easy was it to locate the event venue and other facilities?",
    options: ["Very easy", "Easy", "Difficult", "Very difficult"],
  },
  {
    key: "q4_registration_process",
    title: "4. How would you rate the registration and reporting process?",
    options: ["Excellent", "Good", "Average", "Poor"],
  },
  {
    key: "q9_campus_cleanliness",
    title: "9. How would you rate the cleanliness of the campus and common areas?",
    options: ["Excellent", "Good", "Average", "Poor"],
  },
  {
    key: "q10_washrooms",
    title: "10. How clean and well-maintained were the washrooms?",
    options: ["Excellent", "Good", "Average", "Poor", "Not used"],
  },
  {
    key: "q11_drinking_water",
    title: "11. How would you rate the drinking-water facilities?",
    options: ["Excellent", "Good", "Average", "Poor"],
  },
  {
    key: "q12_food_refreshments",
    title: "12. How satisfied were you with food / refreshments arrangements, if applicable?",
    options: ["Excellent", "Good", "Average", "Poor", "Not applicable"],
  },
  {
    key: "q13_signage_directions",
    title: "13. How would you rate the signage and directions around the campus?",
    options: ["Excellent", "Good", "Average", "Poor"],
  },
  {
    key: "q14_parking_transport",
    title: "14. How would you rate the parking and transport arrangements, if applicable?",
    options: ["Excellent", "Good", "Average", "Poor", "Not applicable"],
  },
];

const SECTION_2_QUESTIONS: QuestionDef[] = [
  {
    key: "q5_schedule_communication",
    title: "5. Were the event schedule and instructions communicated clearly?",
    options: ["Yes, completely", "Mostly", "Partly", "No"],
  },
  {
    key: "q6_event_management",
    title: "6. How satisfied were you with the event management and coordination?",
    options: ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied"],
  },
  {
    key: "q7_venue_arrangements",
    title: "7. How would you rate the arrangements at the competition venue?",
    options: ["Excellent", "Good", "Average", "Poor"],
  },
  {
    key: "q8_required_facilities",
    title: "8. Were the required facilities (seating, stage, sound, lighting, etc.) adequate?",
    options: ["Fully adequate", "Mostly adequate", "Partly adequate", "Inadequate"],
  },
  {
    key: "q15_schedule_adherence",
    title: "15. Did the event begin and proceed according to the announced schedule?",
    options: ["Yes", "Mostly", "Partly", "No"],
  },
  {
    key: "q16_query_handling",
    title: "16. Were queries or issues handled promptly by the organising team?",
    options: ["Always", "Usually", "Sometimes", "Never"],
  },
  {
    key: "q17_fair_competition",
    title: "17. How fair and transparent did the competition process appear?",
    options: ["Excellent", "Good", "Average", "Poor", "Not applicable"],
  },
  {
    key: "q18_safety_security",
    title: "18. How would you rate the safety and security arrangements on campus?",
    options: ["Excellent", "Good", "Average", "Poor"],
  },
];

const SECTION_3_QUESTIONS: QuestionDef[] = [
  {
    key: "q19_visit_again",
    title: "19. Would you like to participate in or visit CARAVAN again?",
    options: ["Definitely", "Probably", "Not sure", "No"],
  },
  {
    key: "q20_overall_experience",
    title: "20. Overall, how would you rate your experience at CARAVAN’26?",
    options: ["Excellent", "Good", "Average", "Poor"],
  },
];

export default function ParticipantFeedbackModal({
  isOpen,
  student,
  event,
  onSuccess,
  onCancel,
}: ParticipantFeedbackModalProps) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [ratings, setRatings] = useState<Partial<FeedbackRatings>>({
    q1_campus_environment: "Excellent",
    q2_staff_volunteers: "Excellent",
    q3_locating_venue: "Very easy",
    q4_registration_process: "Excellent",
    q5_schedule_communication: "Yes, completely",
    q6_event_management: "Very satisfied",
    q7_venue_arrangements: "Excellent",
    q8_required_facilities: "Fully adequate",
    q9_campus_cleanliness: "Excellent",
    q10_washrooms: "Good",
    q11_drinking_water: "Good",
    q12_food_refreshments: "Good",
    q13_signage_directions: "Good",
    q14_parking_transport: "Good",
    q15_schedule_adherence: "Yes",
    q16_query_handling: "Usually",
    q17_fair_competition: "Excellent",
    q18_safety_security: "Excellent",
    q19_visit_again: "Definitely",
    q20_overall_experience: "Excellent",
  });
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRatingChange = (key: keyof FeedbackRatings, val: string) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  };

  const validateCurrentStep = (stepNumber: 1 | 2 | 3): boolean => {
    let questionsToCheck: QuestionDef[] = [];
    if (stepNumber === 1) questionsToCheck = SECTION_1_QUESTIONS;
    if (stepNumber === 2) questionsToCheck = SECTION_2_QUESTIONS;
    if (stepNumber === 3) questionsToCheck = SECTION_3_QUESTIONS;

    for (const q of questionsToCheck) {
      if (!ratings[q.key]) {
        setErrorMsg(`Please answer: ${q.title}`);
        return false;
      }
    }
    setErrorMsg(null);
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep(activeStep)) {
      if (activeStep < 3) {
        setActiveStep((prev) => (prev + 1) as 1 | 2 | 3);
        const modalContainer = document.getElementById("feedback-modal-scroll-area");
        if (modalContainer) modalContainer.scrollTop = 0;
      }
    }
  };

  const handlePrev = () => {
    setErrorMsg(null);
    if (activeStep > 1) {
      setActiveStep((prev) => (prev - 1) as 1 | 2 | 3);
      const modalContainer = document.getElementById("feedback-modal-scroll-area");
      if (modalContainer) modalContainer.scrollTop = 0;
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep(3)) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/public/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: event.registrationId,
          studentName: student.name,
          mobile: student.mobile,
          university: student.university,
          eventName: event.eventName,
          ratings,
          comments: comments.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to submit feedback. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Success
      setIsSubmitting(false);
      onSuccess();
    } catch (err: any) {
      console.error("Feedback submit error:", err);
      setErrorMsg("Network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-white/10 shadow-2xl shadow-amber-500/10 overflow-hidden text-white"
      >
        {/* Top Header Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/10 bg-slate-900/60 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <MessageSquareHeart className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Participant Feedback
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                    CARAVAN ’26
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  RIMT University • Required once before generating your certificate
                </p>
              </div>
            </div>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Student & Event Meta Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-white">{student.name}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              <span className="truncate max-w-[200px]">{student.university}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[200px]">{event.eventName}</span>
            </div>
          </div>

          {/* 3-Step Progress Indicator */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { num: 1, label: "Campus & Facilities", icon: Building },
              { num: 2, label: "Event Coordination", icon: CalendarCheck },
              { num: 3, label: "Overall Experience", icon: Star },
            ].map((s) => {
              const Icon = s.icon;
              const isActive = activeStep === s.num;
              const isDone = activeStep > s.num;
              return (
                <div
                  key={s.num}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                    isActive
                      ? "bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10"
                      : isDone
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-white/[0.03] border-white/5 text-slate-400"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isActive
                        ? "bg-amber-400 text-black"
                        : isDone
                        ? "bg-emerald-500 text-black"
                        : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {isDone ? "✓" : s.num}
                  </div>
                  <span className="truncate hidden sm:inline">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Questions Body */}
        <div
          id="feedback-modal-scroll-area"
          className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Section 1 */}
          {activeStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-xs uppercase tracking-wider font-bold text-amber-400/90 flex items-center gap-2">
                <Building className="w-4 h-4" /> Part 1: Campus Environment & Facilities
              </div>
              {SECTION_1_QUESTIONS.map((q) => (
                <QuestionItem
                  key={q.key}
                  q={q}
                  currentValue={ratings[q.key]}
                  onSelect={(opt) => handleRatingChange(q.key, opt)}
                />
              ))}
            </div>
          )}

          {/* Section 2 */}
          {activeStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-xs uppercase tracking-wider font-bold text-amber-400/90 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4" /> Part 2: Event Management & Instructions
              </div>
              {SECTION_2_QUESTIONS.map((q) => (
                <QuestionItem
                  key={q.key}
                  q={q}
                  currentValue={ratings[q.key]}
                  onSelect={(opt) => handleRatingChange(q.key, opt)}
                />
              ))}
            </div>
          )}

          {/* Section 3 */}
          {activeStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-xs uppercase tracking-wider font-bold text-amber-400/90 flex items-center gap-2">
                <Star className="w-4 h-4" /> Part 3: Overall Impressions & Suggestions
              </div>
              {SECTION_3_QUESTIONS.map((q) => (
                <QuestionItem
                  key={q.key}
                  q={q}
                  currentValue={ratings[q.key]}
                  onSelect={(opt) => handleRatingChange(q.key, opt)}
                />
              ))}

              {/* Additional Comments */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <label className="block text-xs font-semibold text-slate-200">
                  Additional comments or suggestions (Optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share any special moments, suggestions for improvement, or feedback for future CARAVAN editions..."
                  maxLength={1000}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition resize-none"
                />
                <div className="text-[11px] text-right text-slate-500">
                  {comments.length}/1000 characters
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-900/80 backdrop-blur-sm flex items-center justify-between gap-3">
          {activeStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
          ) : (
            <div />
          )}

          {activeStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black text-xs font-bold shadow-lg shadow-amber-500/20 transition"
            >
              Next Section <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-bold shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving & Unlocking...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Submit Feedback & Unlock Certificate
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function QuestionItem({
  q,
  currentValue,
  onSelect,
}: {
  q: QuestionDef;
  currentValue?: string;
  onSelect: (opt: string) => void;
}) {
  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all">
      <p className="text-xs sm:text-sm font-semibold text-slate-200 mb-3 leading-relaxed">
        {q.title}
      </p>
      <div className="flex flex-wrap gap-2">
        {q.options.map((opt) => {
          const isSelected = currentValue === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 flex items-center gap-1.5 ${
                isSelected
                  ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/20 font-bold"
                  : "bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-slate-300 hover:text-white"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full border flex items-center justify-center transition-all ${
                  isSelected
                    ? "border-amber-400 bg-amber-400"
                    : "border-slate-500 bg-transparent"
                }`}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
              </div>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
