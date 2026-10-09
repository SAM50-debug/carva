import { getDb } from "@/lib/db/client";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, School, Calendar, Smartphone, QrCode, Mail, Users } from "lucide-react";
import Image from "next/image";
import { EditRegistrationModal } from "./EditRegistrationModal";

export default async function RegistrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!ObjectId.isValid(id)) return notFound();

  const db = await getDb();
  const reg = await db.collection("registrations").findOne({ _id: new ObjectId(id) });

  if (!reg) return notFound();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/admin/registrations" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Registrations
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{reg.studentName}</h1>
          <p className="text-slate-400 flex items-center gap-2">
            <School className="w-4 h-4" /> {reg.university || "RIMT University"}
          </p>
        </div>
        <div className="text-right flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
            <EditRegistrationModal registration={JSON.parse(JSON.stringify(reg))} />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Verified
            </div>
          </div>
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5" /> {reg.qrCode}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Participant Info */}
          <div className="bg-[#111827]/50 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#c8102e]" /> Participant Details
            </h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Roll Number</p>
                <p className="text-slate-300 font-medium">{reg.rollNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Course & Year</p>
                <p className="text-slate-300 font-medium">{reg.course} • {reg.year} Year</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Phone</p>
                <p className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" /> {reg.mobile}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Email</p>
                <p className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {reg.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Gender</p>
                <p className="text-slate-300 font-medium capitalize">{reg.gender}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Participation Type</p>
                <p className="text-slate-300 font-medium capitalize flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> {reg.participationType}
                </p>
              </div>
            </div>
          </div>

          {/* Team Info */}
          {reg.participationType === "team" && reg.teamDetails && (
            <div className="bg-[#111827]/50 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#c8102e]" /> Team Details
              </h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Team Name</p>
                  <p className="text-slate-300 font-medium">{reg.teamDetails.teamName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Leader Name</p>
                  <p className="text-slate-300 font-medium">{reg.teamDetails.leaderName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500">Note: Member count and info are specific to each event below.</p>
                </div>
              </div>
            </div>
          )}

          {/* Events */}
          <div className="bg-[#111827]/50 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#c8102e]" /> Selected Events
            </h2>
            <div className="space-y-3">
              {reg.selectedEvents?.map((evt: any, i: number) => (
                <div key={i} className="flex flex-col bg-white/5 border border-white/10 rounded-xl p-4">
                  <span className="text-xs text-[#c8102e] font-semibold tracking-wider uppercase mb-1">
                    {evt.categoryName}
                  </span>
                  <span className="text-white font-medium text-lg">{evt.eventName}</span>
                  {evt.subEvent && (
                    <span className="text-sm text-slate-400 mt-1">Format: {evt.subEvent}</span>
                  )}
                  {evt.teamDetails && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-sm">
                      <div className="flex justify-between text-slate-400 mb-2">
                        <span>Members:</span>
                        <span className="text-white font-medium">{evt.teamDetails.memberCount}</span>
                      </div>
                      <div className="text-slate-400">
                        <span className="block mb-1">Members Info:</span>
                        <span className="text-white whitespace-pre-wrap block bg-black/30 p-3 rounded-lg border border-white/5">{evt.teamDetails.membersInfo}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: ID/Payment Proof */}
        <div className="space-y-6">
          <div className="bg-[#111827]/50 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-4">
              {reg.isRIMT ? "Student ID Card" : "Payment Receipt"}
            </h2>
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black/50 border border-white/10">
              {reg.idCardUrl || reg.paymentProofUrl ? (
                <Image 
                  src={reg.idCardUrl || reg.paymentProofUrl}
                  alt="Proof Document"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                  No image provided
                </div>
              )}
            </div>
            
            {(reg.idCardUrl || reg.paymentProofUrl) && (
              <a 
                href={reg.idCardUrl || reg.paymentProofUrl} 
                target="_blank" 
                rel="noreferrer"
                className="mt-4 block w-full text-center py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition"
              >
                Open Original Image
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
