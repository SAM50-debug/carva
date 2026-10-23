import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  Building2,
  Calendar,
  CheckCircle,
  FileCheck,
  ArrowRight,
  Sparkles,
  Trophy,
  Medal,
} from "lucide-react";
import { certificateService } from "@/lib/services/certificateService";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ certId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { certId } = await params;
  return {
    title: `Verify Certificate #${certId} | Caravan ’26 RIMT University`,
    description: `Official verification portal for Caravan ’26 certificate #${certId}.`,
  };
}

export default async function CertificateVerificationPage({ params }: Props) {
  const { certId } = await params;

  const verification = await certificateService.verifyCertificate(certId);
  const { isValid, isAuthentic, certificate } = verification;

  const formattedDate = certificate?.issuedAt
    ? new Date(certificate.issuedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "October 2026";

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden pt-28 sm:pt-36">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-brand-gold/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 max-w-3xl relative z-10">
        {/* Verification Status Card */}
        <div className="relative rounded-3xl p-6 sm:p-10 border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />

          {isValid && isAuthentic && certificate ? (
            <div className="space-y-6">
              {/* Authenticity Badge */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-brand-gold/20 border-2 border-emerald-400/40 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.25)] mb-4 animate-pulse">
                  <ShieldCheck className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" /> Official & Verified Certificate
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white mt-3 tracking-tight">
                  Certificate Authenticated
                </h1>
                <p className="text-xs sm:text-sm text-slate-300/80 max-w-md mt-1">
                  Issued by RIMT University for official participation and excellence at Caravan ’26.
                </p>
              </div>

              {/* Verified Details Matrix */}
              <div className="bg-black/40 rounded-2xl p-5 sm:p-7 border border-white/10 text-left space-y-5">
                <div className="border-b border-white/10 pb-4">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Recipient Name
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    {certificate.studentName}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-brand-gold" /> Institution / University
                    </div>
                    <div className="text-sm font-semibold text-slate-200 mt-1">
                      {certificate.university}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-brand-gold" /> Award / Standing
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      {certificate.position === 1 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" /> 1st Position (Winner)
                        </span>
                      )}
                      {certificate.position === 2 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-300/20 text-slate-200 border border-slate-300/40">
                          <Medal className="w-3.5 h-3.5 text-slate-200" /> 2nd Position
                        </span>
                      )}
                      {certificate.position === 3 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-700/30 text-amber-200 border border-amber-600/40">
                          <Medal className="w-3.5 h-3.5 text-amber-500" /> 3rd Position
                        </span>
                      )}
                      {certificate.position === 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          <Award className="w-3.5 h-3.5 text-blue-400" /> Participation
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Event Name
                    </div>
                    <div className="text-sm font-bold text-white mt-1">
                      {certificate.eventName}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Category
                    </div>
                    <div className="text-sm font-mono text-slate-300 mt-1">
                      {certificate.categoryName} [{certificate.categoryLetter}]
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Official Certificate No.
                    </div>
                    <div className="text-sm font-mono font-bold text-brand-gold mt-1">
                      {(certificate.serialNumber || "").replace(/[\[\]]/g, "")}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date of Issuance
                    </div>
                    <div className="text-sm text-slate-300 mt-1">
                      {formattedDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cryptographic Proof Pill */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>HMAC-SHA256 Cryptographic Signature Verified</span>
                </div>
                <div className="font-mono text-[11px] text-slate-500 truncate max-w-[200px]">
                  ID: {certificate.certificateId}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/certificate"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm bg-gradient-to-r from-brand-gold to-amber-500 text-black hover:opacity-95 shadow-lg shadow-brand-gold/20 transition-all hover:scale-105"
                >
                  Claim Your Certificate <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all"
                >
                  Explore Festival Events
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="w-20 h-20 rounded-2xl bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.25)] mx-auto">
                <ShieldAlert className="w-10 h-10 text-red-400" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/15 text-red-300 border border-red-500/30">
                Authentication Failed
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Invalid or Unverified Certificate
              </h1>
              <p className="text-sm text-slate-300/80 max-w-md mx-auto">
                The certificate identifier <span className="font-mono text-red-300 font-bold">{certId}</span> was not found in the official Caravan ’26 registry or has failed cryptographic verification.
              </p>
              <div className="pt-4">
                <Link
                  href="/certificate"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all"
                >
                  Search Valid Certificate
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
