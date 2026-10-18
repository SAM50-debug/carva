import { getDb } from "@/lib/db/client";
import { ShieldCheck, Users, Building2, ExternalLink, QrCode } from "lucide-react";
import Link from "next/link";
import ExportExcelButton from "@/components/admin/ExportExcelButton";
import { GATE_SECURITY_KEY } from "@/lib/constants";

export default async function AdminGateRecordsPage() {
  const db = await getDb();

  // Query recent 500 gate records and aggregate counts efficiently in parallel
  const [totalEntriesCount, universities, headcountAgg, gateEntries] = await Promise.all([
    db.collection("gate_entries").countDocuments(),
    db.collection("gate_entries").distinct("university"),
    db.collection("gate_entries").aggregate([
      { $match: { isReEntry: { $ne: true } } },
      { $group: { _id: null, total: { $sum: "$admittedCount" } } }
    ]).toArray(),
    db.collection("gate_entries")
      .find()
      .sort({ scannedAt: -1 })
      .limit(500)
      .toArray()
  ]);

  const totalHeadcount = headcountAgg[0]?.total || totalEntriesCount;

  // Prepare Excel export payload
  const exportData = gateEntries.map((e, index) => ({
    "S.No": index + 1,
    "Participant Name": e.studentName || "N/A",
    "University / College": e.university || "N/A",
    "Roll Number": e.rollNumber || "N/A",
    "Participation Type": e.participationType || "individual",
    "Team Name": e.teamName || "N/A",
    "Headcount Admitted": e.admittedCount || 1,
    "Gate": e.gateName || "Main Gate",
    "Entry Type": e.isReEntry ? "Re-Entry" : "Initial Entry",
    "Scanned At": e.scannedAt ? new Date(e.scannedAt).toLocaleString("en-IN") : "N/A",
    "Scanned By": e.scannedBy || "Security Staff",
  }));

  const gateScannerUrl = `/gate?key=${encodeURIComponent(GATE_SECURITY_KEY)}`;

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-[#c8102e]" />
            Gate Security & Admissions
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Real-time campus gate entry logs and headcount management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={gateScannerUrl}
            target="_blank"
            className="flex items-center gap-2 bg-[#c8102e] hover:bg-[#a50e26] text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#c8102e]/20"
          >
            <QrCode className="w-4 h-4" />
            <span>Open Security Scanner</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
          </Link>

          {exportData.length > 0 && (
            <ExportExcelButton data={exportData} filename="caravan26_gate_admissions" />
          )}
        </div>
      </div>

      {/* ── Quick Link Banner for Guards ── */}
      <div className="bg-[#0b1329] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
            Security Link for Guards (Share via WhatsApp / SMS):
          </span>
          <code className="text-sm font-mono text-emerald-400 font-bold select-all break-all mt-1 block">
            {typeof window !== "undefined" ? window.location.origin : ""}{gateScannerUrl}
          </code>
        </div>
        <div className="text-xs text-slate-400 shrink-0">
          Access Key: <span className="text-white font-mono font-bold bg-white/10 px-2.5 py-1 rounded-lg">{GATE_SECURITY_KEY}</span>
        </div>
      </div>

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-sm text-slate-400 font-medium">Total Headcount Admitted</span>
          </div>
          <div className="text-3xl font-bold text-white">{totalHeadcount}</div>
          <div className="text-xs text-slate-400 mt-1">Students & team members inside campus</div>
        </div>

        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-sm text-slate-400 font-medium">Total Gate Scans</span>
          </div>
          <div className="text-3xl font-bold text-white">{totalEntriesCount}</div>
          <div className="text-xs text-slate-400 mt-1">Total physical scans at entry gates</div>
        </div>

        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-sm text-slate-400 font-medium">Universities Represented</span>
          </div>
          <div className="text-3xl font-bold text-white">{universities.length}</div>
          <div className="text-xs text-slate-400 mt-1">Institutions through the gates</div>
        </div>
      </div>

      {/* ── Gate Admissions Table ── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Live Gate Admissions Feed</h2>
          <span className="text-xs text-slate-400">{gateEntries.length} total entries recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-black/30 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Participant / Team</th>
                <th className="px-5 py-3.5">University</th>
                <th className="px-5 py-3.5">Roll No</th>
                <th className="px-5 py-3.5">Headcount</th>
                <th className="px-5 py-3.5">Gate</th>
                <th className="px-5 py-3.5">Entry Type</th>
                <th className="px-5 py-3.5">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {gateEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    No gate scans recorded yet. Share the scanner link with gate security to begin admissions.
                  </td>
                </tr>
              ) : (
                gateEntries.map((e: any) => (
                  <tr key={e._id.toString()} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-white">{e.studentName}</div>
                      {e.teamName && (
                        <div className="text-xs text-slate-400">Team: {e.teamName}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium">{e.university}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">{e.rollNumber || "N/A"}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white">
                        {e.admittedCount || 1} {e.participationType === "team" ? "Members" : "Person"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-300">{e.gateName || "Main Gate"}</td>
                    <td className="px-5 py-3.5">
                      {e.isReEntry ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Re-Entry
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          First Entry
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {e.scannedAt ? new Date(e.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
