"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Search,
  Building2,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Trophy,
  Medal,
  Calendar,
} from "lucide-react";
import CertificateCanvas from "@/components/certificate/CertificateCanvas";
import { EligibleEventItem } from "@/lib/services/certificateService";
import { CertificateRecord } from "@/lib/db/models/types";

export default function CertificateClaimPage() {
  // Step state: 1 = Form, 2 = Events List, 3 = Certificate Canvas
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form inputs
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [university, setUniversity] = useState("");
  const [universities, setUniversities] = useState<string[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);

  // Search / Lookup state
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-detection state for university
  const [isDetectingUniv, setIsDetectingUniv] = useState(false);
  const [autoDetectedUniv, setAutoDetectedUniv] = useState<string | null>(null);

  // Lookup results
  const [studentInfo, setStudentInfo] = useState<{ name: string; university: string; mobile: string } | null>(null);
  const [eligibleEvents, setEligibleEvents] = useState<EligibleEventItem[]>([]);

  // Selected event for generation
  const [selectedEvent, setSelectedEvent] = useState<EligibleEventItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState<CertificateRecord | null>(null);

  // Load distinct universities on mount
  useEffect(() => {
    async function loadUniversities() {
      try {
        const res = await fetch("/api/public/certificates/universities");
        const json = await res.json();
        if (json.success && Array.isArray(json.universities)) {
          setUniversities(json.universities);
        }
      } catch (err) {
        console.error("Failed to load universities", err);
      } finally {
        setLoadingUniversities(false);
      }
    }
    loadUniversities();
  }, []);

  // Automatically detect student's registered university when 10-digit mobile number is entered
  useEffect(() => {
    const cleanMobile = mobile.trim().replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      setIsDetectingUniv(false);
      return;
    }

    let isMounted = true;
    setIsDetectingUniv(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/public/certificates/detect-university", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mobile: cleanMobile,
            name: name.trim() || undefined,
          }),
        });

        const json = await res.json();
        if (isMounted && json.success && json.data?.found && json.data.university) {
          const detected = json.data.university;
          setAutoDetectedUniv(detected);
          setUniversity(detected);
        }
      } catch (err) {
        console.error("Auto-detect university failed:", err);
      } finally {
        if (isMounted) {
          setIsDetectingUniv(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [mobile, name]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    const cleanMobile = mobile.trim().replace(/\D/g, "");
    const cleanUniv = (university || autoDetectedUniv || "").trim();

    if (!cleanName || cleanName.length < 2) {
      setErrorMessage("Please enter your full registered name.");
      return;
    }
    if (cleanMobile.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!cleanUniv) {
      setErrorMessage("Please select or specify your university/college.");
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch("/api/public/certificates/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          mobile: cleanMobile,
          university: cleanUniv,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMessage(json.error || "Lookup failed. Please verify your details.");
        setIsSearching(false);
        return;
      }

      setStudentInfo(json.data.student);
      setEligibleEvents(json.data.events || []);

      if (!json.data.events || json.data.events.length === 0) {
        setErrorMessage(
          "No verified event participation was found for this name and mobile number. Please ensure your event attendance was scanned at the arena or verify your registration details."
        );
      } else {
        setStep(2);
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setErrorMessage("An unexpected network error occurred. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectEvent = async (eventItem: EligibleEventItem) => {
    setSelectedEvent(eventItem);
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/public/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: eventItem.registrationId,
          eventId: eventItem.eventId,
          studentName: studentInfo?.name || name,
          mobile: studentInfo?.mobile || mobile,
          university: studentInfo?.university || university,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMessage(json.error || "Failed to generate certificate.");
        setIsGenerating(false);
        return;
      }

      setActiveCertificate(json.certificate);
      setStep(3);
      window.scrollTo({ top: 100, behavior: "smooth" });
    } catch (err) {
      console.error("Generation error:", err);
      setErrorMessage("Could not generate certificate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getPositionBadge = (pos: number) => {
    switch (pos) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> 1st Position (Winner)
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-300/20 text-slate-200 border border-slate-300/40 shadow-sm shadow-slate-300/20">
            <Medal className="w-3.5 h-3.5 text-slate-200" /> 2nd Position (1st Runner Up)
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-700/30 text-amber-200 border border-amber-600/40">
            <Medal className="w-3.5 h-3.5 text-amber-500" /> 3rd Position (2nd Runner Up)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Award className="w-3.5 h-3.5 text-blue-400" /> Certificate of Participation
          </span>
        );
    }
  };

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden pt-28 sm:pt-32">
      {/* Ambient glowing blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-brand-gold/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-brand-crimson/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
        {/* Header Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Official Certification Portal
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Claim Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-amber-200 to-yellow-400">Caravan ’26</span> Certificate
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300/80 leading-relaxed">
            Download your high-resolution official achievement and participation certificates, stamped with anti-forgery QR verification.
          </p>
        </motion.div>

        {/* Global Error Banner */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm flex items-start gap-3 backdrop-blur-md max-w-2xl mx-auto"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* ─── STEP 1: Identification & College Form ─── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-xl mx-auto"
            >
              <div className="relative rounded-3xl p-6 sm:p-8 border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none" />

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-gold" />
                    Enter Participant Details
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Provide the name and phone number you used during festival registration.
                  </p>
                </div>

                <form onSubmit={handleLookup} className="space-y-5">
                  {/* Student Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Full Student Name <span className="text-brand-crimson">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aman Kumar"
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold/40 transition-all"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      10-Digit Mobile Number <span className="text-brand-crimson">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                        placeholder="e.g. 9876543210"
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold/40 transition-all"
                      />
                    </div>
                  </div>

                  {/* University Dropdown */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        University / College <span className="text-brand-crimson">*</span>
                      </label>
                      {isDetectingUniv && (
                        <span className="flex items-center gap-1.5 text-[11px] text-amber-300 font-medium animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin text-amber-400" /> Detecting college...
                        </span>
                      )}
                      {!isDetectingUniv && autoDetectedUniv && (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <Sparkles className="w-3 h-3 text-emerald-400" /> Auto-detected
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select
                        value={university}
                        onChange={(e) => {
                          setUniversity(e.target.value);
                          if (e.target.value !== autoDetectedUniv) {
                            setAutoDetectedUniv(null);
                          }
                        }}
                        required
                        className={`w-full bg-[#0d1527] border rounded-xl pl-10 pr-8 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold/40 transition-all appearance-none cursor-pointer [color-scheme:dark] ${
                          autoDetectedUniv
                            ? "border-emerald-500/50 bg-[#0d1829] ring-1 ring-emerald-500/20"
                            : "border-white/10"
                        }`}
                      >
                        <option value="" disabled>
                          {loadingUniversities
                            ? "Loading colleges from database..."
                            : "— Select Your University / College —"}
                        </option>
                        {autoDetectedUniv && !universities.includes(autoDetectedUniv) && (
                          <option value={autoDetectedUniv} className="bg-[#0b1220] text-emerald-300 font-semibold">
                            ⭐️ {autoDetectedUniv} (Registered College)
                          </option>
                        )}
                        {universities.map((univ) => (
                          <option key={univ} value={univ} className="bg-[#0b1220] text-white">
                            {univ === autoDetectedUniv ? `⭐️ ${univ} (Auto-detected)` : univ}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                        ▼
                      </div>
                    </div>
                    {autoDetectedUniv && (
                      <p className="text-[11px] text-emerald-400/90 flex items-center gap-1.5 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
                        <span>
                          Auto-selected from your registration: <strong className="font-semibold text-emerald-300">{autoDetectedUniv}</strong>
                        </span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSearching}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-gold via-amber-400 to-yellow-500 text-black hover:opacity-95 shadow-lg shadow-brand-gold/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Looking Up Your Records...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" /> Find My Certificates
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 2: Event Discovery & Selection Deck ─── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              {/* Student Summary Header */}
              <div className="rounded-2xl p-5 border border-white/10 bg-white/[0.04] backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-gold uppercase tracking-wider mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Identity Verified
                  </div>
                  <h2 className="text-xl font-bold text-white">{studentInfo?.name}</h2>
                  <p className="text-xs text-slate-300 mt-0.5">{studentInfo?.university}</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Search Another
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-gold" />
                  Your Participated Events ({eligibleEvents.length})
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Select an event below to preview and download your official certificate.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eligibleEvents.map((item) => (
                    <motion.div
                      key={item.eventId}
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent backdrop-blur-xl shadow-lg flex flex-col justify-between gap-4 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300">
                            {item.categoryName} [{item.categoryLetter}]
                          </span>
                          {getPositionBadge(item.position)}
                        </div>
                        <h4 className="text-base font-bold text-white group-hover:text-brand-gold transition-colors">
                          {item.eventName}
                        </h4>
                        <div className="text-xs font-mono text-slate-400">
                          Serial Tag: <span className="text-brand-gold font-semibold">{item.suffix}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectEvent(item)}
                        disabled={isGenerating}
                        className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-brand-gold/15 hover:bg-brand-gold text-brand-gold hover:text-black border border-brand-gold/30 hover:border-transparent transition-all shadow-sm"
                      >
                        {isGenerating && selectedEvent?.eventId === item.eventId ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Preparing Certificate...
                          </>
                        ) : (
                          <>
                            Generate / View Certificate <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 3: Live Interactive Certificate Stage ─── */}
          {step === 3 && activeCertificate && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              {/* Back to Events Bar */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to My Events
                </button>

                <div className="text-right">
                  <span className="text-xs font-bold text-brand-gold">
                    {activeCertificate.awardTitle}
                  </span>
                </div>
              </div>

              {/* The Live High-Resolution Canvas Renderer */}
              <CertificateCanvas
                studentName={activeCertificate.studentName}
                university={activeCertificate.university}
                eventName={activeCertificate.eventName}
                templateUrl={activeCertificate.templateUrl}
                serialNumber={activeCertificate.serialNumber}
                suffix={activeCertificate.suffix}
                position={activeCertificate.position}
                qrUrl={activeCertificate.qrUrl}
                certificateId={activeCertificate.certificateId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
