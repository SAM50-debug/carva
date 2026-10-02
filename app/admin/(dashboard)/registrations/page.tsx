import { getDb } from "@/lib/db/client";
import Link from "next/link";
import { Eye, ArrowLeft } from "lucide-react";
import ExportExcelButton from "@/components/admin/ExportExcelButton";

export default async function RegistrationsPage() {
  const db = await getDb();
  
  // Fetch registrations, sort by newest
  const registrations = await db
    .collection("registrations")
    .find({})
    .sort({ submittedAt: -1 })
    .toArray();

  // Fetch events for mapping names in Excel
  const allEvents = await db.collection("events").find({}).project({ name: 1 }).toArray();

  // Prepare safe data for client component
  const exportData = registrations.map(r => {
    // Get comma-separated names of selected events
    const registeredEventNames = (r.selectedEvents || [])
      .map((se: any) => {
        const ev = allEvents.find(e => e._id.toString() === se.eventId.toString());
        return ev ? ev.name : "Unknown Event";
      })
      .join(", ");

    return {
      "Participant Name": r.studentName || "N/A",
      "Roll Number": r.rollNumber || "N/A",
      "Email": r.email || "N/A",
      "Phone": r.phone || r.mobile || "N/A", // handles both phone/mobile key if it exists
      "Gender": r.gender || "N/A",
      "Course": r.course || "N/A",
      "Year": r.year || "N/A",
      "University": r.university || r.collegeName || "RIMT University",
      "Participation Type": r.participationType || r.type || "individual",
      "Status": r.status || "verified",
      "QR Code": r.qrCode || "N/A",
      "Total Events": r.selectedEvents?.length || 0,
      "Registered Events": registeredEventNames,
      "Submitted At": r.submittedAt?.toString()
    };
  });

  return (
    <div className="p-8">
      <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Registrations Dashboard</h1>
        <ExportExcelButton data={exportData} filename="caravan26_registrations" />
      </div>
      
      <div className="bg-[#111827]/50 rounded-2xl border border-white/10 overflow-hidden overflow-x-auto backdrop-blur-sm">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#1f2937]/50 text-xs uppercase text-slate-400 border-b border-white/10">
            <tr>
              <th className="px-6 py-4">Participant</th>
              <th className="px-6 py-4">University</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {registrations.map((reg) => (
              <tr key={reg._id.toString()} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-white">{reg.studentName}</div>
                  <div className="text-xs text-slate-500">{reg.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-white">{reg.collegeName || "RIMT University"}</div>
                  <div className="text-xs text-slate-500">{reg.course} • {reg.year} Year</div>
                </td>
                <td className="px-6 py-4 capitalize">{reg.participationType}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium ${
                    reg.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    reg.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {reg.status || 'pending'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {new Date(reg.submittedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/registrations/${reg._id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-medium transition-all active:scale-95 duration-200">
                    <Eye className="w-3.5 h-3.5" /> View
                  </Link>
                </td>
              </tr>
            ))}
            
            {registrations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No registrations found yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
