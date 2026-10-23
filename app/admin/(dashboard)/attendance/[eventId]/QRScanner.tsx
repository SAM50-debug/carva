"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Camera,
  Users,
  Building2,
  RefreshCw,
  X,
  Check
} from "lucide-react";

interface Participant {
  registrationId: string;
  studentName: string;
  university: string;
  mobile: string;
  rollNumber?: string;
  course?: string;
  year?: string;
  participationType: string;
  isPresent: boolean;
  teamName?: string;
  leaderName?: string;
  memberCount?: number;
}

interface RecentScan {
  name: string;
  time: Date;
  method: "qr" | "search";
}

export default function QRScanner({
  eventId,
  eventName,
  categoryName
}: {
  eventId: string;
  eventName: string;
  categoryName?: string;
}) {
  // Mode: "qr" or "search"
  const [mode, setMode] = useState<"qr" | "search">("qr");

  // Camera QR Scanner State
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "pending_mark" | "success" | "error" | "already_marked">("idle");
  const [message, setMessage] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [participantData, setParticipantData] = useState<any>(null);
  const [scannedQr, setScannedQr] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  // Manual Search State
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "present">("all");
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [searchNotice, setSearchNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Recent Scans
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);

  // Initialize camera scanner
  useEffect(() => {
    scannerRef.current = new Html5Qrcode("qr-reader");

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Fetch participants for search on mount or when switching to search
  const fetchParticipants = async () => {
    setLoadingParticipants(true);
    setParticipantsError("");
    try {
      const res = await fetch(`/api/admin/events/${eventId}/participants`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      } else {
        setParticipantsError(data.error || "Failed to load participants for this event.");
      }
    } catch (err: any) {
      setParticipantsError("Network error while loading participants.");
    } finally {
      setLoadingParticipants(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [eventId]);

  // When switching modes, stop camera if scanning to save battery/stream
  const handleModeChange = (newMode: "qr" | "search") => {
    if (newMode === "search" && scannerRef.current?.isScanning) {
      scannerRef.current.stop().catch(console.error);
      setStatus("idle");
    }
    setMode(newMode);
    if (newMode === "search" && participants.length === 0) {
      fetchParticipants();
    }
  };

  // Start Camera
  const startScanning = async () => {
    if (!scannerRef.current) return;
    setStatus("scanning");
    setMessage("");

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (scannerRef.current?.isScanning) {
            await scannerRef.current.stop();
          }
          await verifyInput(decodedText, "qr_scan");
        },
        () => {}
      );
    } catch (err) {
      console.error("Scanner error:", err);
      setStatus("error");
      setMessage("Could not start camera. Please check browser camera permissions.");
    }
  };

  // Verify QR code or manual string
  const verifyInput = async (inputStr: string, method: "qr_scan" | "manual_input") => {
    setStatus("scanning");
    setMessage("Verifying...");

    try {
      const res = await fetch("/api/admin/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode: inputStr,
          eventId,
          status: "present",
          method,
          action: "verify",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("pending_mark");
        setScannedQr(inputStr);
        setParticipantData(data);
        setMessage("Participant Found");
      } else if (res.status === 409) {
        setStatus("already_marked");
        setParticipantData(data);
        setParticipantName(data.participantName || "Participant");
        setMessage("Already marked present for this event.");
      } else {
        setStatus("error");
        setMessage(data.error || "Verification failed");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Network error occurred during verification");
    }
  };

  // Confirm attendance from Camera/Verify preview
  const confirmAttendance = async () => {
    setStatus("scanning");
    setMessage("Marking Attendance...");

    try {
      const res = await fetch("/api/admin/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode: scannedQr,
          eventId,
          status: "present",
          method: "qr_scan",
          action: "mark",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const markedName = participantData?.participantName || data.participantName;
        setStatus("success");
        setParticipantName(markedName);
        setMessage("Attendance marked successfully!");
        setRecentScans(prev => [
          { name: markedName, time: new Date(), method: "qr" as const },
          ...prev
        ].slice(0, 5));

        // Update in participants state as well
        setParticipants(prev =>
          prev.map(p =>
            p.studentName?.toLowerCase() === markedName?.toLowerCase()
              ? { ...p, isPresent: true }
              : p
          )
        );
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to mark attendance");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Network error occurred");
    }
  };

  const resetScanner = () => {
    setStatus("idle");
    setMessage("");
    setParticipantName("");
    setParticipantData(null);
    setScannedQr("");
    startScanning();
  };

  // Manual verify from input box under camera
  const handleQuickManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setManualLoading(true);
    await verifyInput(manualInput.trim(), "manual_input");
    setManualLoading(false);
  };

  // Mark attendance directly from manual search card
  const handleMarkParticipant = async (participant: Participant) => {
    setMarkingId(participant.registrationId);
    setSearchNotice(null);

    try {
      const res = await fetch("/api/admin/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: participant.registrationId,
          eventId,
          status: "present",
          method: "manual_search",
          action: "mark",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Mark present in local list
        setParticipants(prev =>
          prev.map(p =>
            p.registrationId === participant.registrationId
              ? { ...p, isPresent: true }
              : p
          )
        );

        setRecentScans(prev => [
          { name: participant.studentName, time: new Date(), method: "search" as const },
          ...prev
        ].slice(0, 5));

        setSearchNotice({
          type: "success",
          message: `Attendance marked for ${participant.studentName}!`,
        });
      } else if (res.status === 409) {
        // Already marked
        setParticipants(prev =>
          prev.map(p =>
            p.registrationId === participant.registrationId
              ? { ...p, isPresent: true }
              : p
          )
        );
        setSearchNotice({
          type: "error",
          message: `${participant.studentName} is already marked present!`,
        });
      } else {
        setSearchNotice({
          type: "error",
          message: data.error || "Failed to mark attendance",
        });
      }
    } catch (err) {
      setSearchNotice({
        type: "error",
        message: "Network error while marking attendance",
      });
    } finally {
      setMarkingId(null);
    }
  };

  // Filter participants
  const filteredParticipants = useMemo(() => {
    let list = participants;

    if (filterStatus === "pending") {
      list = list.filter(p => !p.isPresent);
    } else if (filterStatus === "present") {
      list = list.filter(p => p.isPresent);
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(p =>
      p.studentName?.toLowerCase().includes(q) ||
      p.teamName?.toLowerCase().includes(q) ||
      p.leaderName?.toLowerCase().includes(q) ||
      p.rollNumber?.toLowerCase().includes(q) ||
      p.mobile?.includes(q) ||
      p.university?.toLowerCase().includes(q)
    );
  }, [participants, filterStatus, searchQuery]);

  const totalCount = participants.length;
  const presentCount = participants.filter(p => p.isPresent).length;
  const pendingCount = totalCount - presentCount;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Main Container */}
      <div className="bg-[#111827]/80 rounded-3xl border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          {categoryName && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#c8102e]/10 text-[#c8102e] border border-[#c8102e]/20 mb-2">
              {categoryName}
            </span>
          )}
          <h2 className="text-2xl font-bold text-white tracking-tight">{eventName}</h2>
          <p className="text-slate-400 text-sm mt-1">
            Mark event attendance via live camera QR code or participant / team name search
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mb-6">
          <button
            onClick={() => handleModeChange("qr")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              mode === "qr"
                ? "bg-[#c8102e] text-white shadow-lg shadow-[#c8102e]/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Camera className="w-4 h-4" />
            QR Scanner
          </button>
          <button
            onClick={() => handleModeChange("search")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              mode === "search"
                ? "bg-[#c8102e] text-white shadow-lg shadow-[#c8102e]/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Search className="w-4 h-4" />
            Search Name / Team
            {pendingCount > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                mode === "search" ? "bg-white text-[#c8102e]" : "bg-white/10 text-slate-300"
              }`}>
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* ================= MODE 1: QR CAMERA SCANNER ================= */}
        {mode === "qr" && (
          <div className="text-center">
            {/* Scanner Window */}
            <div className="relative w-full aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden bg-black/60 border-2 border-dashed border-white/20 mb-6">
              <div id="qr-reader" className="w-full h-full" />

              {status === "idle" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6">
                  <Camera className="w-12 h-12 text-slate-500 mb-3" />
                  <p className="text-sm text-slate-300 mb-4">Point device camera at participant ticket QR code</p>
                  <button
                    onClick={startScanning}
                    className="bg-[#c8102e] hover:bg-[#a50e26] text-white px-6 py-3 rounded-xl font-medium transition-all active:scale-95 duration-200 shadow-lg shadow-[#c8102e]/20"
                  >
                    Start Camera
                  </button>
                </div>
              )}

              {status === "scanning" && message === "Verifying..." && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85">
                  <Loader2 className="w-10 h-10 text-[#c8102e] animate-spin mb-4" />
                  <p className="text-white font-medium">Verifying Ticket...</p>
                </div>
              )}
            </div>

            {/* Quick Manual Code / Roll fallback under camera */}
            {status === "idle" && (
              <form onSubmit={handleQuickManualVerify} className="max-w-sm mx-auto mb-6 flex gap-2">
                <input
                  type="text"
                  placeholder="Or enter QR / Roll / Phone / Name"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#c8102e]"
                />
                <button
                  type="submit"
                  disabled={manualLoading || !manualInput.trim()}
                  className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-1.5"
                >
                  {manualLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                </button>
              </form>
            )}

            {/* Verification & Results Overlay */}
            {status === "pending_mark" && participantData && (
              <div className="animate-in zoom-in duration-300 max-w-sm mx-auto">
                <div className="bg-black/40 border border-white/10 rounded-2xl p-5 mb-5 text-left">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center justify-between">
                    <span>Participant Details</span>
                    <span className="text-xs uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                      Verified
                    </span>
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Name</span>
                      <span className="text-white font-medium">{participantData.participantName}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">University</span>
                      <span className="text-white font-medium truncate max-w-[200px] text-right">{participantData.university}</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-slate-400">Type</span>
                      <span className="text-white font-medium capitalize">{participantData.participationType}</span>
                    </div>

                    {participantData.participationType === "team" && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span className="text-slate-400">Team Name</span>
                          <span className="text-white font-medium text-[#c8102e]">{participantData.teamName}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span className="text-slate-400">Team Leader</span>
                          <span className="text-white font-medium">{participantData.leaderName}</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-slate-400">Members</span>
                          <span className="text-white font-medium">{participantData.memberCount || "N/A"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={resetScanner}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAttendance}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-medium transition active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Mark Present
                  </button>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="animate-in zoom-in duration-300 max-w-sm mx-auto">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{participantName}</h3>
                <p className="text-emerald-400 font-medium mb-6">{message}</p>
                <button
                  onClick={resetScanner}
                  className="w-full bg-[#c8102e] hover:bg-[#a50e26] text-white py-3 rounded-xl font-medium transition active:scale-95 shadow-lg shadow-[#c8102e]/20"
                >
                  Scan Next Participant
                </button>
              </div>
            )}

            {status === "error" && (
              <div className="animate-in zoom-in duration-300 max-w-sm mx-auto">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-red-400 font-medium mb-6 px-4">{message}</p>
                <button
                  onClick={resetScanner}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition"
                >
                  Try Again
                </button>
              </div>
            )}

            {status === "already_marked" && (
              <div className="animate-in zoom-in duration-300 max-w-sm mx-auto">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                  <span className="text-3xl text-amber-500 font-bold">!</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{participantName}</h3>
                <p className="text-amber-400 font-medium mb-6 px-4">{message}</p>
                <button
                  onClick={resetScanner}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition active:scale-95"
                >
                  Scan Next Participant
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= MODE 2: PARTICIPANT & TEAM SEARCH ================= */}
        {mode === "search" && (
          <div className="space-y-4">
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, team name, roll no, or phone..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-10 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#c8102e] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Chips & Live Stats */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                    filterStatus === "all"
                      ? "bg-white/15 text-white border border-white/20"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  onClick={() => setFilterStatus("pending")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                    filterStatus === "pending"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-white/5 text-slate-400 hover:text-amber-300"
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  onClick={() => setFilterStatus("present")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                    filterStatus === "present"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-white/5 text-slate-400 hover:text-emerald-300"
                  }`}
                >
                  Present ({presentCount})
                </button>
              </div>

              <button
                onClick={fetchParticipants}
                disabled={loadingParticipants}
                title="Refresh participants list"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded-lg bg-white/5 border border-white/5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingParticipants ? "animate-spin text-[#c8102e]" : ""}`} />
                Refresh
              </button>
            </div>

            {/* Search Toast / Alert Notice */}
            {searchNotice && (
              <div
                className={`p-3 rounded-xl text-sm flex items-center justify-between border animate-in fade-in duration-200 ${
                  searchNotice.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                }`}
              >
                <span>{searchNotice.message}</span>
                <button onClick={() => setSearchNotice(null)} className="p-1 hover:opacity-75">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Participant Cards List */}
            {loadingParticipants && participants.length === 0 ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#c8102e] animate-spin mb-3" />
                <p className="text-sm">Loading event participants...</p>
              </div>
            ) : participantsError ? (
              <div className="py-8 text-center text-red-400 bg-red-500/5 rounded-2xl border border-red-500/10 p-4">
                <p className="text-sm mb-3">{participantsError}</p>
                <button
                  onClick={fetchParticipants}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-medium"
                >
                  Retry
                </button>
              </div>
            ) : filteredParticipants.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-white/5 rounded-2xl border border-white/5 p-6">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-white mb-1">
                  {searchQuery ? `No participants matching "${searchQuery}"` : "No participants found"}
                </p>
                <p className="text-xs text-slate-500">
                  {searchQuery ? "Try searching by another keyword or roll number" : "No registered participants for this event yet."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-3 text-xs text-[#c8102e] hover:underline"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredParticipants.map((p) => {
                  const isMarking = markingId === p.registrationId;

                  return (
                    <div
                      key={p.registrationId + p.studentName}
                      className={`p-4 rounded-2xl border transition-all duration-200 ${
                        p.isPresent
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Participant / Team Info */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white text-base">
                              {p.studentName}
                            </span>

                            {p.participationType === "team" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                <Users className="w-3 h-3" />
                                Team
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                Individual
                              </span>
                            )}

                            {p.teamName && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#c8102e]/15 text-[#c8102e] border border-[#c8102e]/30">
                                👥 {p.teamName}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                            {p.university && (
                              <span className="inline-flex items-center gap-1 truncate max-w-[220px]" title={p.university}>
                                <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                                {p.university}
                              </span>
                            )}
                            {p.rollNumber && (
                              <span className="font-mono text-slate-400">
                                Roll: {p.rollNumber}
                              </span>
                            )}
                            {p.mobile && (
                              <span className="text-slate-500 font-mono">
                                📞 {p.mobile}
                              </span>
                            )}
                          </div>

                          {p.participationType === "team" && p.leaderName && p.leaderName !== p.studentName && (
                            <p className="text-[11px] text-slate-400">
                              Leader: <span className="text-slate-300 font-medium">{p.leaderName}</span>
                              {p.memberCount ? ` • ${p.memberCount} members` : ""}
                            </p>
                          )}
                        </div>

                        {/* Action / Attendance Status */}
                        <div className="shrink-0 flex items-center justify-end">
                          {p.isPresent ? (
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              Present
                            </div>
                          ) : (
                            <button
                              onClick={() => handleMarkParticipant(p)}
                              disabled={isMarking}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white transition-all active:scale-95 shadow-md shadow-emerald-500/20"
                            >
                              {isMarking ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Marking...
                                </>
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  Mark Present
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recently Marked Scans */}
      {recentScans.length > 0 && (
        <div className="bg-[#111827]/80 rounded-2xl border border-white/10 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Recently Marked Present
            </h3>
            <span className="text-xs text-slate-500">Live Session</span>
          </div>
          <div className="space-y-2">
            {recentScans.map((scan, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{scan.name}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                    {scan.method === "qr" ? "QR Scan" : "Name Search"}
                  </span>
                </div>
                <span className="text-emerald-400 font-mono">
                  {scan.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
