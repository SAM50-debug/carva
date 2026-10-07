import { getDb } from "@/lib/db/client";
import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { headers } from "next/headers";

export default async function AttendanceListPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  
  if (!ObjectId.isValid(eventId)) return notFound();

  const db = await getDb();
  const event = await db.collection("events").findOne({ _id: new ObjectId(eventId) });

  if (!event) return notFound();

  // Authorization Check
  const headersList = await headers();
  const payloadStr = headersList.get("x-user-payload");
  const user = payloadStr ? JSON.parse(payloadStr) : null;
  if (user && user.role === "sub_admin") {
    const assignedIds = user.assignedCategoryIds || [];
    if (!assignedIds.includes(event.categoryId.toString())) {
      redirect("/admin/attendance"); // Kick them out to the picker
    }
  }

  // Fetch attendance records and join with registrations to get student names
  const attendanceRecords = await db.collection("attendance").aggregate([
    { $match: { eventId: eventId } },
    {
      $lookup: {
        from: "registrations",
        localField: "registrationId",
        foreignField: "_id",
        as: "studentInfo"
      }
    },
    { $unwind: "$studentInfo" },
    { $sort: { scannedAt: -1 } }
  ]).toArray();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <Link href={`/admin/attendance/${eventId}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Scanner
      </Link>
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{event.name}</h1>
          <p className="text-slate-400">Marked Present: {attendanceRecords.length}</p>
        </div>
        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center">
          <Users className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      <div className="bg-[#111827]/50 rounded-2xl border border-white/10 overflow-hidden overflow-x-auto backdrop-blur-sm">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#1f2937]/50 text-xs uppercase text-slate-400 border-b border-white/10">
            <tr>
              <th className="px-6 py-4">Participant</th>
              <th className="px-6 py-4">Roll Number</th>
              <th className="px-6 py-4">Course & Year</th>
              <th className="px-6 py-4 text-right">Time Scanned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {attendanceRecords.map((record) => (
              <tr key={record._id.toString()} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{record.studentInfo.studentName}</td>
                <td className="px-6 py-4">{record.studentInfo.rollNumber}</td>
                <td className="px-6 py-4">{record.studentInfo.course} • {record.studentInfo.year}</td>
                <td className="px-6 py-4 text-right font-mono text-xs text-emerald-400">
                  {new Date(record.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}

            {attendanceRecords.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No attendance records found for this event yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
