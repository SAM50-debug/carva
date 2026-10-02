"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function QRScanner({ eventId, eventName }: { eventId: string; eventName: string }) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error" | "already_marked">("idle");
  const [message, setMessage] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [recentScans, setRecentScans] = useState<{name: string, time: Date}[]>([]);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode("qr-reader");

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    if (!scannerRef.current) return;
    setStatus("scanning");
    setMessage("");
    
    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // Pause scanning while we verify
          if (scannerRef.current?.isScanning) {
            await scannerRef.current.stop();
          }
          await verifyQRCode(decodedText);
        },
        (error) => {
          // Ignore frequent "not found" errors during scanning
        }
      );
    } catch (err) {
      console.error("Scanner error:", err);
      setStatus("error");
      setMessage("Could not start camera. Please ensure you have granted camera permissions.");
    }
  };

  const verifyQRCode = async (qrCode: string) => {
    setStatus("scanning");
    setMessage("Verifying...");

    try {
      const res = await fetch("/api/admin/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode,
          eventId,
          status: "present",
          method: "qr_scan",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setParticipantName(data.participantName);
        setMessage("Attendance marked successfully!");
        setRecentScans(prev => [{ name: data.participantName, time: new Date() }, ...prev].slice(0, 5));
      } else if (res.status === 409) {
        setStatus("already_marked");
        setParticipantName(data.participantName || "Participant");
        setMessage("Already marked present for this event.");
      } else {
        setStatus("error");
        setMessage(data.error || "Verification failed");
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
    startScanning();
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-[#111827]/50 rounded-3xl border border-white/10 p-6 backdrop-blur-sm text-center">
        <h2 className="text-xl font-bold text-white mb-2">{eventName}</h2>
        <p className="text-slate-400 text-sm mb-8">Scan participant QR code to mark attendance</p>

        {/* Scanner Window */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black/50 border-2 border-dashed border-white/20 mb-8">
          <div id="qr-reader" className="w-full h-full" />
          
          {status === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <button 
                onClick={startScanning}
                className="bg-[#c8102e] hover:bg-[#a50e26] text-white px-6 py-3 rounded-xl font-medium transition-all active:scale-95 duration-200"
              >
                Start Camera
              </button>
            </div>
          )}
          
          {status === "scanning" && message === "Verifying..." && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <Loader2 className="w-10 h-10 text-[#c8102e] animate-spin mb-4" />
              <p className="text-white font-medium">Verifying Ticket...</p>
            </div>
          )}
        </div>

        {/* Results */}
        {status === "success" && (
          <div className="animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{participantName}</h3>
            <p className="text-emerald-400 font-medium mb-8">{message}</p>
            <button 
              onClick={resetScanner}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition"
            >
              Scan Next Participant
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-400 font-medium mb-8 px-4">{message}</p>
            <button 
              onClick={resetScanner}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition"
            >
              Try Again
            </button>
          </div>
        )}

        {status === "already_marked" && (
          <div className="animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <CheckCircle2 className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{participantName}</h3>
            <p className="text-amber-400 font-medium mb-8 px-4">{message}</p>
            <button 
              onClick={resetScanner}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all active:scale-95 duration-200"
            >
              Scan Next Participant
            </button>
          </div>
        )}
      </div>

      {recentScans.length > 0 && (
        <div className="mt-8 bg-[#111827]/50 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
          <h3 className="text-white font-semibold mb-4">Recently Scanned</h3>
          <div className="space-y-3">
            {recentScans.map((scan, i) => (
              <div key={i} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg p-3">
                <span className="text-white font-medium">{scan.name}</span>
                <span className="text-xs text-emerald-400">
                  {scan.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
