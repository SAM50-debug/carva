"use client";

import { useEffect, useState } from "react";
import { GateScanner } from "@/components/gate/GateScanner";
import { ShieldCheck, Lock, ArrowRight, Building2, Users } from "lucide-react";
import { GATE_SECURITY_KEY } from "@/lib/constants";

export default function GateSecurityPage() {
  const [gateKey, setGateKey] = useState<string>("");
  const [keyInput, setKeyInput] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState("");
  const [stats, setStats] = useState<{ totalHeadcount: number; totalEntries: number; totalUniversities: number } | null>(null);

  // Check URL query param or sessionStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const keyFromUrl = urlParams.get("key");
    const storedKey = sessionStorage.getItem("caravan_gate_key") || localStorage.getItem("caravan_gate_key");

    const activeKey = keyFromUrl || storedKey;

    if (activeKey) {
      verifyKey(activeKey);
    }
  }, []);

  const verifyKey = async (key: string) => {
    try {
      const res = await fetch(`/api/gate/stats?key=${encodeURIComponent(key)}`);
      if (res.ok) {
        const data = await res.json();
        setGateKey(key);
        setIsAuthorized(true);
        setStats(data);
        sessionStorage.setItem("caravan_gate_key", key);
        localStorage.setItem("caravan_gate_key", key);
      } else {
        setIsAuthorized(false);
        setAuthError("Invalid Gate Access Key. Please check the security link or enter valid key.");
      }
    } catch {
      setIsAuthorized(false);
      setAuthError("Network error validating gate key.");
    }
  };

  const handleManualAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!keyInput.trim()) {
      setAuthError("Please enter the Security Access Key.");
      return;
    }
    verifyKey(keyInput.trim());
  };

  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 flex flex-col justify-between p-3 sm:p-6">
      {/* ── Background Ambient Glow ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#c8102e]/10 blur-[120px] rounded-full" />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 max-w-md mx-auto w-full flex items-center justify-between py-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-base tracking-tight text-white">
            CARAVAN <span className="text-[#c8102e]">'26</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#c8102e]/20 text-[#c8102e] border border-[#c8102e]/30">
            SECURITY GATE
          </span>
        </div>

        {isAuthorized && stats && (
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-slate-300">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <strong className="text-white">{stats.totalHeadcount}</strong> Admitted
            </span>
          </div>
        )}
      </header>

      {/* ── Main Content Body ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full">
        {isAuthorized ? (
          <GateScanner gateKey={gateKey} gateName="Main Campus Gate" />
        ) : (
          <div className="w-full max-w-sm bg-[#0b1329] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#c8102e]/15 border border-[#c8102e]/30 flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#c8102e]" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Security Authorization</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your Gate Access Key to unlock the live QR Scanner.
              </p>
            </div>

            <form onSubmit={handleManualAuth} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter Gate Key"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3.5 text-white text-center tracking-widest text-base font-mono focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60"
                  autoFocus
                />
                {authError && (
                  <p className="text-xs text-rose-400 font-medium mt-2">{authError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#c8102e] hover:bg-[#a50e26] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-[#c8102e]/25 flex items-center justify-center gap-2"
              >
                <span>Unlock Scanner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="border-t border-white/10 pt-4 text-[11px] text-slate-500">
              RIMT University · CARAVAN '26 Security Desk
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center py-2 mt-4 text-[10px] text-slate-500">
        CARAVAN '26 Gate Management System · Verified Admissions Only
      </footer>
    </div>
  );
}
