import { getDb } from "@/lib/db/client";
import { Users, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ExportExcelButton from "@/components/admin/ExportExcelButton";

export default async function GlobalAttendanceRecordsPage() {
  const db = await getDb();

  // Aggregate all attendance records with student and event info
  const records = await db.collection("attendance").aggregate([
    {
      $lookup: {
        from: "registrations",
        localField: "registrationId",
        foreignField: "_id",
        as: "studentInfo"
      }
    },
    { $unwind: "$studentInfo" },
    {
      $lookup: {
        from: "events",
        // Event ID is a string in attendance collection right now, but let's be safe 
        // We'll convert attendance.eventId to ObjectId for the lookup
        let: { event_id: { $toObjectId: "$eventId" } },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$event_id"] } } }
        ],
        as: "eventInfo"
      }
    },
    { $unwind: "$eventInfo" },
    { $sort: { scannedAt: -1 } },
    { $limit: 200 } // Limit to 200 most recent for performance
  ]).toArray();

  const exportData = records.map(r => ({
    studentName: r.studentInfo.studentName,
    rollNumber: r.studentInfo.rollNumber,
    eventName: r.eventInfo.name,
    scannedAt: r.scannedAt?.toString()
  }));

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Marked Attendance</h1>
          <p className="text-slate-400">Global feed of all scanned participants across all events.</p>
        </div>
        <div className="flex items-center gap-4">
          <ExportExcelButton data={exportData} filename="caravan26_attendance" />
          <div className="w-12 h-12 bg-[#c8102e]/10 rounded-2xl border border-[#c8102e]/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-[#c8102e]" />
          </div>
        </div>
      </div>

      <div className="bg-[#111827]/50 rounded-2xl border border-white/10 overflow-hidden overflow-x-auto backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1f2937]/50 text-xs uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">Roll Number</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4 text-right">Time Scanned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {records.map((record) => (
                <tr key={record._id.toString()} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{record.studentInfo.studentName}</td>
                  <td className="px-6 py-4 font-mono text-slate-400">{record.studentInfo.rollNumber}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white">
                      {record.eventInfo.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-xs text-emerald-400">
                    {new Date(record.scannedAt).toLocaleString([], { 
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </td>
                </tr>
              ))}

              {records.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No attendance records found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
