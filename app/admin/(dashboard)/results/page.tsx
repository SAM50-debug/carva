"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Trophy,
  Medal,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Users,
  RotateCcw,
  Sparkles,
  School,
  Hash,
  Phone,
  User,
} from "lucide-react";
import DashboardLoading from "../loading";

interface WinnerForm {
  position: 1 | 2 | 3;
  studentName: string;
  university: string;
  rollNumber?: string;
  mobile?: string;
  registrationId?: string;
}

export default function EventResultsAdminPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Participants of the selected event for quick-picking
  const [participants, setParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Form inputs for 1st, 2nd, 3rd
  const [firstPlace, setFirstPlace] = useState<WinnerForm>({
    position: 1,
    studentName: "",
    university: "",
    rollNumber: "",
    mobile: "",
  });
  const [secondPlace, setSecondPlace] = useState<WinnerForm>({
    position: 2,
    studentName: "",
    university: "",
    rollNumber: "",
    mobile: "",
  });
  const [thirdPlace, setThirdPlace] = useState<WinnerForm>({
    position: 3,
    studentName: "",
    university: "",
    rollNumber: "",
    mobile: "",
  });

  const [allResults, setAllResults] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/events").then((res) => res.json()),
      fetch("/api/admin/results").then((res) => res.json()),
    ]).then(([eventsData, resultsData]) => {
      const evts = Array.isArray(eventsData) ? eventsData : [];
      setEvents(evts);
      setAllResults(Array.isArray(resultsData) ? resultsData : []);
      if (evts.length > 0) {
        setSelectedEventId(evts[0]._id.toString());
      }
      setLoading(false);
    });
  }, []);

  // When selected event changes, load its existing winners and participants feed
  useEffect(() => {
    if (!selectedEventId) return;

    // Load existing winners
    const existing = allResults.find((r) => r.eventId === selectedEventId);
    if (existing && Array.isArray(existing.winners)) {
      const p1 = existing.winners.find((w: any) => w.position === 1);
      const p2 = existing.winners.find((w: any) => w.position === 2);
      const p3 = existing.winners.find((w: any) => w.position === 3);

      setFirstPlace(p1 ? { ...p1 } : { position: 1, studentName: "", university: "", rollNumber: "", mobile: "" });
      setSecondPlace(p2 ? { ...p2 } : { position: 2, studentName: "", university: "", rollNumber: "", mobile: "" });
      setThirdPlace(p3 ? { ...p3 } : { position: 3, studentName: "", university: "", rollNumber: "", mobile: "" });
    } else {
      setFirstPlace({ position: 1, studentName: "", university: "", rollNumber: "", mobile: "" });
      setSecondPlace({ position: 2, studentName: "", university: "", rollNumber: "", mobile: "" });
      setThirdPlace({ position: 3, studentName: "", university: "", rollNumber: "", mobile: "" });
    }
    setMessage(null);

    // Fetch participants for this event
    setLoadingParticipants(true);
    fetch(`/api/admin/events/${selectedEventId}/participants`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data?.participants)
          ? data.participants
          : Array.isArray(data)
          ? data
          : [];
        setParticipants(list);
      })
      .catch((err) => {
        console.error("Failed to load event participants", err);
        setParticipants([]);
      })
      .finally(() => {
        setLoadingParticipants(false);
      });
  }, [selectedEventId, allResults]);

  if (loading) return <DashboardLoading />;

  const selectedEvent = events.find((e) => e._id.toString() === selectedEventId);

  const handleQuickPick = (position: 1 | 2 | 3, value: string) => {
    if (!value) return;
    if (value === "CLEAR") {
      handleClearPosition(position);
      return;
    }
    const [regId, ...nameParts] = value.split(":::");
    const targetName = nameParts.join(":::").trim();

    const found =
      participants.find(
        (p) => p.registrationId === regId && (!targetName || p.studentName === targetName)
      ) || participants.find((p) => p.registrationId === regId);

    if (!found) return;

    const winnerData: WinnerForm = {
      position,
      studentName: found.studentName.replace(/ \(Leader\)$/, "").trim(),
      university: found.university?.trim() || "",
      rollNumber: found.rollNumber || "",
      mobile: found.mobile || "",
      registrationId: found.registrationId,
    };

    if (position === 1) setFirstPlace(winnerData);
    if (position === 2) setSecondPlace(winnerData);
    if (position === 3) setThirdPlace(winnerData);
  };

  const handleClearPosition = (position: 1 | 2 | 3) => {
    const blank: WinnerForm = { position, studentName: "", university: "", rollNumber: "", mobile: "" };
    if (position === 1) setFirstPlace(blank);
    if (position === 2) setSecondPlace(blank);
    if (position === 3) setThirdPlace(blank);
  };

  const handleClearAll = () => {
    handleClearPosition(1);
    handleClearPosition(2);
    handleClearPosition(3);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setSaving(true);
    setMessage(null);

    const winnersToSave: WinnerForm[] = [];
    if (firstPlace.studentName.trim()) winnersToSave.push(firstPlace);
    if (secondPlace.studentName.trim()) winnersToSave.push(secondPlace);
    if (thirdPlace.studentName.trim()) winnersToSave.push(thirdPlace);

    try {
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent._id.toString(),
          eventName: selectedEvent.name,
          categoryId: selectedEvent.categoryId?.toString(),
          winners: winnersToSave,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: json.error || "Failed to save winners." });
      } else {
        const upgradedCount = json.upgradedCertificatesCount || 0;
        setMessage({
          type: "success",
          text: `Event results saved successfully! Awarded winner certificates (${upgradedCount} previously claimed certificates upgraded immediately).`,
        });
        // Refresh local results
        const refreshed = await fetch("/api/admin/results").then((r) => r.json());
        if (Array.isArray(refreshed)) setAllResults(refreshed);
      }
    } catch {
      setMessage({ type: "error", text: "Network error saving results." });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = participants.filter((p) => p.isPresent).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 pb-12">
      {/* Top Navigation */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Page Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5 tracking-tight">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-brand-gold shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <span>Event Winners &amp; Results</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Assign 1st, 2nd, and 3rd place winners. Awarded participants automatically receive official Gold, Silver, or Bronze Achievement certificates.
          </p>
        </div>
      </div>

      {/* Status Messages */}
      {message && (
        <div
          className={`p-3.5 sm:p-4 rounded-xl flex items-start sm:items-center gap-3 text-xs sm:text-sm animate-in fade-in duration-200 ${
            message.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-200"
              : "bg-red-500/15 border border-red-500/30 text-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
          ) : (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0 mt-0.5 sm:mt-0" />
          )}
          <span className="leading-snug">{message.text}</span>
        </div>
      )}

      {/* Event Selection & Winner Editor */}
      <div className="bg-[#111827]/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
        {/* Selector & Counter Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="w-full lg:max-w-md space-y-2">
            <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Competition / Event
            </label>
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-[#1f2937] border border-white/10 hover:border-white/20 rounded-xl px-3.5 sm:px-4 py-3 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60 transition-colors [color-scheme:dark]"
              >
                {events.map((evt) => (
                  <option key={evt._id} value={evt._id}>
                    {evt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2.5 bg-white/5 px-3.5 py-2.5 rounded-xl border border-white/10 text-xs text-slate-300 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-gold shrink-0" />
              {loadingParticipants ? (
                <span className="text-slate-400">Loading participants...</span>
              ) : (
                <span>
                  <strong className="text-white font-semibold">{presentCount}</strong> present out of{" "}
                  <strong className="text-white font-semibold">{participants.length}</strong> registered
                </span>
              )}
            </div>
            {participants.length > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {presentCount > 0 ? "Active Event" : "Pending Attendance"}
              </span>
            )}
          </div>
        </div>

        {selectedEvent && (
          <form onSubmit={handleSave} className="space-y-6 pt-4 border-t border-white/10">
            {/* 1st Place Card */}
            <div className="bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg shadow-amber-500/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                  <span className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 shrink-0">
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </span>
                  <span>1st Position — Winner (Gold Certificate `[W-Cat.1]`)</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {participants.length > 0 && (
                    <select
                      onChange={(e) => handleQuickPick(1, e.target.value)}
                      value=""
                      className="w-full sm:w-auto sm:max-w-xs bg-[#1e293b] border border-amber-500/30 hover:border-amber-500/60 rounded-xl px-3 py-2 text-xs text-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors [color-scheme:dark]"
                    >
                      <option value="">— Quick Pick from Participants —</option>
                      <option value="CLEAR" className="bg-red-950 text-red-300 font-bold">❌ Clear / Remove Winner</option>
                      {participants.map((p) => (
                        <option
                          key={`p1_${p.registrationId}_${p.studentName}`}
                          value={`${p.registrationId}:::${p.studentName}`}
                        >
                          {p.isPresent ? "✅ " : "⏳ "} {p.studentName}{p.teamName ? ` [${p.teamName}]` : ""} ({p.university})
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={() => handleClearPosition(1)}
                    title="Clear 1st Position"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 transition-all active:scale-95 shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-amber-300/90 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-amber-400" /> Student Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={firstPlace.studentName}
                    onChange={(e) => setFirstPlace({ ...firstPlace, studentName: e.target.value })}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-300/90 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <School className="w-3 h-3 text-amber-400" /> College / University *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ABC University"
                    value={firstPlace.university}
                    onChange={(e) => setFirstPlace({ ...firstPlace, university: e.target.value })}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-300/90 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Hash className="w-3 h-3 text-amber-400" /> Roll Number (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 24BFA001"
                    value={firstPlace.rollNumber || ""}
                    onChange={(e) => setFirstPlace({ ...firstPlace, rollNumber: e.target.value })}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-300/90 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-amber-400" /> Mobile (optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={firstPlace.mobile || ""}
                    onChange={(e) => setFirstPlace({ ...firstPlace, mobile: e.target.value })}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2nd Place Card */}
            <div className="bg-gradient-to-br from-slate-400/15 via-slate-400/5 to-transparent border border-slate-400/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg shadow-slate-400/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-200 font-bold text-xs sm:text-sm">
                  <span className="p-1.5 rounded-lg bg-slate-400/20 border border-slate-400/30 shrink-0">
                    <Medal className="w-4 h-4 text-slate-300" />
                  </span>
                  <span>2nd Position — 1st Runner Up (Silver Certificate `[W-Cat.2]`)</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {participants.length > 0 && (
                    <select
                      onChange={(e) => handleQuickPick(2, e.target.value)}
                      value=""
                      className="w-full sm:w-auto sm:max-w-xs bg-[#1e293b] border border-slate-400/30 hover:border-slate-400/60 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-colors [color-scheme:dark]"
                    >
                      <option value="">— Quick Pick from Participants —</option>
                      <option value="CLEAR" className="bg-red-950 text-red-300 font-bold">❌ Clear / Remove Winner</option>
                      {participants.map((p) => (
                        <option
                          key={`p2_${p.registrationId}_${p.studentName}`}
                          value={`${p.registrationId}:::${p.studentName}`}
                        >
                          {p.isPresent ? "✅ " : "⏳ "} {p.studentName}{p.teamName ? ` [${p.teamName}]` : ""} ({p.university})
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={() => handleClearPosition(2)}
                    title="Clear 2nd Position"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 transition-all active:scale-95 shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300/90 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-300" /> Student Name
                  </label>
                  <input
                    type="text"
                    placeholder="Student Name"
                    value={secondPlace.studentName}
                    onChange={(e) => setSecondPlace({ ...secondPlace, studentName: e.target.value })}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-300 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300/90 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <School className="w-3 h-3 text-slate-300" /> College / University
                  </label>
                  <input
                    type="text"
                    placeholder="University / College"
                    value={secondPlace.university}
                    onChange={(e) => setSecondPlace({ ...secondPlace, university: e.target.value })}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-300 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300/90 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Hash className="w-3 h-3 text-slate-300" /> Roll Number (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Roll Number"
                    value={secondPlace.rollNumber || ""}
                    onChange={(e) => setSecondPlace({ ...secondPlace, rollNumber: e.target.value })}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-300 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300/90 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-300" /> Mobile (optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="Mobile"
                    value={secondPlace.mobile || ""}
                    onChange={(e) => setSecondPlace({ ...secondPlace, mobile: e.target.value })}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-300 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 3rd Place Card */}
            <div className="bg-gradient-to-br from-amber-800/20 via-amber-800/5 to-transparent border border-amber-700/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg shadow-amber-800/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-amber-500 font-bold text-xs sm:text-sm">
                  <span className="p-1.5 rounded-lg bg-amber-700/20 border border-amber-700/30 shrink-0">
                    <Medal className="w-4 h-4 text-amber-500" />
                  </span>
                  <span>3rd Position — 2nd Runner Up (Bronze Certificate `[W-Cat.3]`)</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {participants.length > 0 && (
                    <select
                      onChange={(e) => handleQuickPick(3, e.target.value)}
                      value=""
                      className="w-full sm:w-auto sm:max-w-xs bg-[#1e293b] border border-amber-700/30 hover:border-amber-700/60 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors [color-scheme:dark]"
                    >
                      <option value="">— Quick Pick from Participants —</option>
                      <option value="CLEAR" className="bg-red-950 text-red-300 font-bold">❌ Clear / Remove Winner</option>
                      {participants.map((p) => (
                        <option
                          key={`p3_${p.registrationId}_${p.studentName}`}
                          value={`${p.registrationId}:::${p.studentName}`}
                        >
                          {p.isPresent ? "✅ " : "⏳ "} {p.studentName}{p.teamName ? ` [${p.teamName}]` : ""} ({p.university})
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={() => handleClearPosition(3)}
                    title="Clear 3rd Position"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 transition-all active:scale-95 shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-amber-500" /> Student Name
                  </label>
                  <input
                    type="text"
                    placeholder="Student Name"
                    value={thirdPlace.studentName}
                    onChange={(e) => setThirdPlace({ ...thirdPlace, studentName: e.target.value })}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <School className="w-3 h-3 text-amber-500" /> College / University
                  </label>
                  <input
                    type="text"
                    placeholder="University / College"
                    value={thirdPlace.university}
                    onChange={(e) => setThirdPlace({ ...thirdPlace, university: e.target.value })}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Hash className="w-3 h-3 text-amber-500" /> Roll Number (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Roll Number"
                    value={thirdPlace.rollNumber || ""}
                    onChange={(e) => setThirdPlace({ ...thirdPlace, rollNumber: e.target.value })}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-amber-500" /> Mobile (optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="Mobile"
                    value={thirdPlace.mobile || ""}
                    onChange={(e) => setThirdPlace({ ...thirdPlace, mobile: e.target.value })}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-400">
                Certificates for assigned winners are automatically generated and linked to their official verification page.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-xs sm:text-sm text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all active:scale-[0.98]"
                >
                  <RotateCcw className="w-4 h-4 text-red-400" />
                  <span>Clear All</span>
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-brand-gold to-amber-500 text-black hover:opacity-95 shadow-lg shadow-brand-gold/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Winners &amp; Upgrade Certificates</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Declared Results Registry */}
      <div className="bg-[#111827]/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span>Declared Results Registry</span>
          </h2>
          <span className="text-xs text-slate-400">
            {allResults.length} {allResults.length === 1 ? "competition" : "competitions"} published
          </span>
        </div>

        {allResults.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs sm:text-sm text-slate-400">
              No winners declared yet. Select an event above and save winners to publish results.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View: Responsive Glass Cards */}
            <div className="grid grid-cols-1 gap-3.5 md:hidden">
              {allResults.map((res: any) => {
                const p1 = res.winners?.find((w: any) => w.position === 1);
                const p2 = res.winners?.find((w: any) => w.position === 2);
                const p3 = res.winners?.find((w: any) => w.position === 3);
                return (
                  <div
                    key={res._id || res.eventId}
                    className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm text-white">{res.eventName}</h3>
                      <button
                        type="button"
                        onClick={() => setSelectedEventId(res.eventId)}
                        className="text-[11px] text-brand-gold hover:underline font-medium shrink-0"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="space-y-2 text-xs divide-y divide-white/5">
                      <div className="pt-1.5 flex items-start gap-2">
                        <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="text-amber-300 font-semibold block truncate">
                            {p1 ? p1.studentName : "—"}
                          </span>
                          {p1 && (
                            <span className="text-slate-400 text-[11px] block truncate">
                              {p1.university}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-1.5 flex items-start gap-2">
                        <Medal className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="text-slate-300 font-semibold block truncate">
                            {p2 ? p2.studentName : "—"}
                          </span>
                          {p2 && (
                            <span className="text-slate-400 text-[11px] block truncate">
                              {p2.university}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-1.5 flex items-start gap-2">
                        <Medal className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="text-amber-500 font-semibold block truncate">
                            {p3 ? p3.studentName : "—"}
                          </span>
                          {p3 && (
                            <span className="text-slate-400 text-[11px] block truncate">
                              {p3.university}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Tabular Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-white/5 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">1st Place</th>
                    <th className="py-3 px-4">2nd Place</th>
                    <th className="py-3 px-4">3rd Place</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allResults.map((res: any) => {
                    const p1 = res.winners?.find((w: any) => w.position === 1);
                    const p2 = res.winners?.find((w: any) => w.position === 2);
                    const p3 = res.winners?.find((w: any) => w.position === 3);
                    return (
                      <tr key={res._id || res.eventId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">{res.eventName}</td>
                        <td className="py-3.5 px-4 text-amber-300">
                          {p1 ? `${p1.studentName} (${p1.university})` : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {p2 ? `${p2.studentName} (${p2.university})` : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-amber-500">
                          {p3 ? `${p3.studentName} (${p3.university})` : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedEventId(res.eventId)}
                            className="text-xs text-brand-gold hover:underline font-semibold"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
