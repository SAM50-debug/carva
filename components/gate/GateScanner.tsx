"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Flashlight, 
  FlashlightOff, 
  RefreshCw, 
  Search, 
  Volume2, 
  VolumeX, 
  Building2, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  X,
  UserCheck,
  ZoomIn,
  Loader2
} from "lucide-react";

interface ParticipantProfile {
  id: string;
  studentName: string;
  university: string;
  rollNumber: string;
  course: string;
  gender: string;
  mobile: string;
  email: string;
  participationType: string;
  teamName?: string;
  leaderName?: string;
  memberCount: number;
  membersInfo?: string;
  events: string[];
  idCardUrl: string | null;
  isRIMT: boolean;
}

interface ScanResult {
  status: "pending_mark" | "admitted" | "already_entered" | "re_entry_admitted" | "invalid" | "unverified";
  message: string;
  firstEntryTime?: string;
  scannedAt?: string;
  totalScans?: number;
  participant?: ParticipantProfile;
  error?: string;
}

export function GateScanner({ gateKey, gateName = "Main Campus Gate" }: { gateKey: string; gateName?: string }) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scannedQr, setScannedQr] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [autoResumeTimer, setAutoResumeTimer] = useState<number | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(3);
  
  // Lightbox for ID Photo
  const [enlargedPhotoUrl, setEnlargedPhotoUrl] = useState<string | null>(null);

  // Manual Search fallback
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [manualQuery, setManualQuery] = useState("");
  const [manualSearching, setManualSearching] = useState(false);

  // Audio tones synthesized via Web Audio API
  const playSound = useCallback((type: "verify" | "success" | "warning" | "error") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === "verify") {
        // Soft double chime (ready for inspection)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.22);
      } else if (type === "success") {
        // Triumphant entry confirmed chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.07);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "warning") {
        // Duplicate warning tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(370, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else {
        // Error buzz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // AudioContext unavailable
    }
  }, [soundEnabled]);

  // Haptic feedback
  const triggerHaptic = useCallback((type: "verify" | "success" | "warning" | "error") => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      if (type === "verify") navigator.vibrate(60);
      else if (type === "success") navigator.vibrate([80, 50, 100]);
      else if (type === "warning") navigator.vibrate([150, 60, 150]);
      else navigator.vibrate(280);
    }
  }, []);

  // Initialize camera scanner
  const startCamera = useCallback(async () => {
    try {
      setCameraError("");
      const scanner = new Html5Qrcode("gate-qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode },
        {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          handleVerifyScan(decodedText);
        },
        () => {
          // Scanning frame
        }
      );

      setIsScanning(true);

      // Check torch support
      try {
        const capabilities = (scanner as any).getRunningTrackCapabilities?.() || {};
        if ("torch" in capabilities) {
          setHasTorch(true);
        }
      } catch {}
    } catch (err: any) {
      console.error("Camera start error:", err);
      setIsScanning(false);
      setCameraError(err?.message || "Could not access camera. Please grant camera permission.");
    }
  }, [facingMode]);

  // Stop camera helper
  const stopCamera = useCallback(async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  }, []);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextState = !torchOn;
      await (scannerRef.current as any).applyVideoConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
    } catch (err) {
      console.error("Torch error:", err);
    }
  };

  // Toggle Front/Back Camera
  const toggleFacingMode = async () => {
    await stopCamera();
    setFacingMode(prev => (prev === "environment" ? "user" : "environment"));
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // PHASE 1: Verify Scan (Camera pauses, guard inspects details, DOES NOT auto-mark)
  const handleVerifyScan = async (qrCode: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setScannedQr(qrCode);

    // Pause camera scanning during inspection
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.pause(true);
      } catch {}
    }

    try {
      const res = await fetch("/api/gate/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode,
          gateKey,
          gateName,
          action: "verify", // Verify only
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Pending mark: details fetched, ready for guard to inspect and confirm
        playSound("verify");
        triggerHaptic("verify");
        setScanResult(data);
      } else if (res.status === 409) {
        // Already entered: warn guard
        playSound("warning");
        triggerHaptic("warning");
        setScanResult(data);
      } else {
        // Invalid or unverified
        playSound("error");
        triggerHaptic("error");
        setScanResult({
          status: "invalid",
          message: data.error || "Verification failed",
          error: data.error,
        });
      }
    } catch (err: any) {
      playSound("error");
      triggerHaptic("error");
      setScanResult({
        status: "invalid",
        message: "Network Error: Could not verify ticket.",
        error: err.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // PHASE 2: Guard explicitly clicks "Mark Entry" or "Authorize Re-Entry"
  const handleConfirmMarkEntry = async (allowReEntry = false) => {
    if (!scannedQr || isMarking) return;
    setIsMarking(true);

    try {
      const res = await fetch("/api/gate/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode: scannedQr,
          gateKey,
          gateName,
          allowReEntry,
          action: "mark", // Officially record the entry
        }),
      });

      const data = await res.json();

      if (res.ok) {
        playSound("success");
        triggerHaptic("success");
        setScanResult(data);

        // Auto-resume timer after 4 seconds
        setCountdownSeconds(4);
        const timer = window.setTimeout(() => {
          resumeScanning();
        }, 4000);
        setAutoResumeTimer(timer);
      } else if (res.status === 409) {
        playSound("warning");
        triggerHaptic("warning");
        setScanResult(data);
      } else {
        playSound("error");
        triggerHaptic("error");
        setScanResult({
          status: "invalid",
          message: data.error || "Failed to mark entry",
          error: data.error,
        });
      }
    } catch (err: any) {
      playSound("error");
      triggerHaptic("error");
      setScanResult({
        status: "invalid",
        message: "Failed to mark entry due to a network error.",
        error: err.message,
      });
    } finally {
      setIsMarking(false);
    }
  };

  // Resume camera scanner for next person
  const resumeScanning = () => {
    setScanResult(null);
    setScannedQr("");
    if (autoResumeTimer) {
      clearTimeout(autoResumeTimer);
      setAutoResumeTimer(null);
    }
    if (scannerRef.current) {
      try {
        scannerRef.current.resume();
      } catch {
        startCamera();
      }
    }
  };

  // Handle manual roll number / QR search
  const handleManualSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    setManualSearching(true);
    await handleVerifyScan(manualQuery.trim());
    setManualSearching(false);
    setShowManualSearch(false);
    setManualQuery("");
  };

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col min-h-[90vh] bg-[#070d1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* ── Top Security Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-black/40 backdrop-blur-md border-b border-white/10 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#c8102e]/20 border border-[#c8102e]/40 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#c8102e]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">GATE SCANNER</h2>
            <p className="text-[10px] text-slate-400 font-medium">{gateName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`p-2 rounded-xl border transition-all ${
                torchOn 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
                  : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
              }`}
              title="Toggle Flashlight"
            >
              {torchOn ? <Flashlight className="w-4 h-4" /> : <FlashlightOff className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={toggleFacingMode}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
            title="Switch Camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowManualSearch(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
            title="Manual Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Viewfinder Viewport ── */}
      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden min-h-[360px]">
        {/* html5-qrcode video target */}
        <div id="gate-qr-reader" className="w-full h-full [&>video]:object-cover" />

        {/* HUD Laser Framing Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Ambient vignette */}
          <div className="absolute inset-0 bg-radial-vignette opacity-60" />

          {/* Target Box */}
          <div className="relative w-64 h-64 border-2 border-white/20 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(200,16,46,0.2)]">
            {/* Neon Corner Brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#c8102e] rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#c8102e] rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#c8102e] rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#c8102e] rounded-br-2xl" />

            {/* Scanning Laser Beam */}
            {isScanning && !scanResult && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c8102e] to-transparent shadow-[0_0_15px_#c8102e] animate-laser-scan" />
            )}
          </div>
        </div>

        {/* Camera Permission / Error Fallback */}
        {cameraError && (
          <div className="absolute inset-0 bg-[#070d1a]/95 flex flex-col items-center justify-center p-6 text-center z-30">
            <AlertTriangle className="w-12 h-12 text-amber-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Camera Access Required</h3>
            <p className="text-sm text-slate-300 mb-6 max-w-xs">{cameraError}</p>
            <button
              onClick={startCamera}
              className="px-6 py-3 rounded-xl bg-[#c8102e] text-white font-bold hover:bg-[#a50e26] transition-colors"
            >
              Grant Permission & Retry
            </button>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-[#c8102e] border-t-transparent animate-spin" />
              <span className="text-sm font-semibold text-white tracking-wide">FETCHING DETAILS...</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Live Helper Footer ── */}
      <div className="p-4 bg-black/40 border-t border-white/10 text-center z-20">
        <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Point camera at participant's ticket QR code
        </p>
      </div>

      {/* ── Match Details & Action Modal ── */}
      {scanResult && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col justify-end animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="bg-[#0b1329] border-t border-white/15 rounded-t-3xl p-6 max-h-[88vh] overflow-y-auto space-y-5 shadow-2xl">
            
            {/* 1. Header Banner based on State */}
            <div className="flex items-center justify-between">
              {scanResult.status === "pending_mark" && (
                <div className="flex items-center gap-2.5 text-blue-400">
                  <UserCheck className="w-7 h-7 shrink-0 text-blue-400" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-400 block">
                      VERIFY & MATCH DETAILS
                    </span>
                    <h3 className="text-lg font-bold text-white">Participant Checked In</h3>
                  </div>
                </div>
              )}

              {scanResult.status === "admitted" && (
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <CheckCircle2 className="w-7 h-7 shrink-0 text-emerald-400" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-500 block">
                      ENTRY MARKED
                    </span>
                    <h3 className="text-lg font-bold text-white">Campus Entry Recorded!</h3>
                  </div>
                </div>
              )}

              {scanResult.status === "re_entry_admitted" && (
                <div className="flex items-center gap-2.5 text-blue-400">
                  <CheckCircle2 className="w-7 h-7 shrink-0 text-blue-400" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-400 block">
                      RE-ENTRY MARKED
                    </span>
                    <h3 className="text-lg font-bold text-white">Re-Entry Approved & Logged</h3>
                  </div>
                </div>
              )}

              {scanResult.status === "already_entered" && (
                <div className="flex items-center gap-2.5 text-amber-400">
                  <AlertTriangle className="w-7 h-7 shrink-0 text-amber-400" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 block">
                      ALREADY ENTERED
                    </span>
                    <h3 className="text-lg font-bold text-white">Duplicate Ticket Scan</h3>
                  </div>
                </div>
              )}

              {(scanResult.status === "invalid" || scanResult.status === "unverified") && (
                <div className="flex items-center gap-2.5 text-rose-500">
                  <XCircle className="w-7 h-7 shrink-0 text-rose-500" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-rose-500 block">
                      ENTRY DENIED
                    </span>
                    <h3 className="text-lg font-bold text-white">Invalid or Unverified</h3>
                  </div>
                </div>
              )}

              <button
                onClick={resumeScanning}
                className="p-2 text-slate-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Notice if Already Entered */}
            {scanResult.status === "already_entered" && (
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 text-xs text-amber-200">
                <strong className="block text-amber-300 font-semibold mb-1">⚠️ Anti-Passback Alert:</strong>
                This ticket was already admitted at{" "}
                <strong className="text-white">
                  {scanResult.firstEntryTime ? new Date(scanResult.firstEntryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "earlier"}
                </strong>. Match the student photo/ID below if authorizing re-entry.
              </div>
            )}

            {/* 3. Participant Profile Card (For Guard to match identity) */}
            {scanResult.participant && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold">
                        {scanResult.participant.participationType === "team" ? `Team of ${scanResult.participant.memberCount}` : "Solo Entry"}
                      </span>
                      {scanResult.participant.isRIMT && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#c8102e]/20 text-[#c8102e] border border-[#c8102e]/30 font-bold">
                          Host University
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-xl font-bold text-white mt-1.5">
                      {scanResult.participant.studentName}
                    </h4>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-[#c8102e] shrink-0" />
                      {scanResult.participant.university}
                    </p>
                  </div>

                  {/* ID Card Photo Preview Thumbnail with Click-to-Enlarge */}
                  {scanResult.participant.idCardUrl && (
                    <button
                      type="button"
                      onClick={() => setEnlargedPhotoUrl(scanResult.participant?.idCardUrl || null)}
                      className="group relative w-16 h-20 rounded-xl overflow-hidden border border-white/20 shrink-0 bg-black/40 focus:outline-none"
                      title="Tap to zoom photo"
                    >
                      <img
                        src={scanResult.participant.idCardUrl}
                        alt="ID Photo"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent flex items-center justify-center transition-colors">
                        <ZoomIn className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-3">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Roll Number</span>
                    <span className="font-semibold text-slate-200 font-mono">{scanResult.participant.rollNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Course / Year</span>
                    <span className="font-semibold text-slate-200">{scanResult.participant.course}</span>
                  </div>
                </div>

                {scanResult.participant.teamName && (
                  <div className="border-t border-white/5 pt-2.5 text-xs">
                    <span className="text-slate-500 text-[10px] uppercase block font-semibold">Team Name</span>
                    <span className="font-semibold text-white">{scanResult.participant.teamName}</span>
                  </div>
                )}

                {/* Registered Events */}
                {scanResult.participant.events.length > 0 && (
                  <div className="border-t border-white/5 pt-3">
                    <span className="text-slate-500 block text-[10px] uppercase mb-1.5 flex items-center gap-1 font-semibold">
                      <Calendar className="w-3 h-3 text-[#c8102e]" /> Registered Events
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {scanResult.participant.events.map((evt, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#c8102e]/10 border border-[#c8102e]/20 text-[11px] font-medium text-slate-200">
                          {evt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message if Invalid */}
            {scanResult.error && !scanResult.participant && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-xs text-rose-300">
                {scanResult.error}
              </div>
            )}

            {/* 4. Action Buttons based on Status */}
            <div className="space-y-2.5 pt-2">
              
              {/* If PENDING MARK: Let the guard confirm or cancel */}
              {scanResult.status === "pending_mark" && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleConfirmMarkEntry(false)}
                    disabled={isMarking}
                    className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isMarking ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Recording Entry...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Confirm & Mark Gate Entry</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={resumeScanning}
                    disabled={isMarking}
                    className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-semibold text-xs border border-white/10 transition-colors"
                  >
                    Cancel / Discard
                  </button>
                </div>
              )}

              {/* If ALREADY ENTERED: Offer Re-entry or Dismiss */}
              {scanResult.status === "already_entered" && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleConfirmMarkEntry(true)}
                    disabled={isMarking}
                    className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isMarking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authorizing...</span>
                      </>
                    ) : (
                      <span>Authorize Official Re-Entry</span>
                    )}
                  </button>

                  <button
                    onClick={resumeScanning}
                    className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-semibold text-xs border border-white/10 transition-colors"
                  >
                    Dismiss / Next
                  </button>
                </div>
              )}

              {/* If ENTRY CONFIRMED: Big scan next button */}
              {(scanResult.status === "admitted" || scanResult.status === "re_entry_admitted") && (
                <button
                  onClick={resumeScanning}
                  className="w-full py-3.5 px-4 bg-[#c8102e] hover:bg-[#a50e26] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#c8102e]/30 flex items-center justify-center gap-2"
                >
                  <span>Scan Next Ticket</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* If INVALID: Scan next */}
              {(scanResult.status === "invalid" || scanResult.status === "unverified") && (
                <button
                  onClick={resumeScanning}
                  className="w-full py-3.5 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-sm transition-all"
                >
                  Scan Next Ticket
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Photo Lightbox Modal ── */}
      {enlargedPhotoUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setEnlargedPhotoUrl(null)}
        >
          <div className="relative max-w-sm w-full bg-[#0b1329] border border-white/20 rounded-2xl p-3 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Student ID Card</span>
              <button 
                onClick={() => setEnlargedPhotoUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full max-h-[70vh] overflow-hidden rounded-xl bg-black/60">
              <img 
                src={enlargedPhotoUrl} 
                alt="Student ID Preview" 
                className="w-full h-auto object-contain max-h-[70vh] mx-auto" 
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center">Tap outside or close to return</p>
          </div>
        </div>
      )}

      {/* ── Manual Search Modal ── */}
      {showManualSearch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1329] border border-white/10 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-[#c8102e]" /> Manual Ticket Search
              </h3>
              <button onClick={() => setShowManualSearch(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter the 16-character QR code or ticket string printed below the barcode.
            </p>

            <form onSubmit={handleManualSearchSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="e.g. i3M0oaJiimOsgCdf"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60 font-mono"
                autoFocus
                required
              />

              <button
                type="submit"
                disabled={manualSearching}
                className="w-full py-3 bg-[#c8102e] hover:bg-[#a50e26] text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
              >
                {manualSearching ? "Checking..." : "Inspect & Match"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
