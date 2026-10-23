import { getDb } from "@/lib/db/client";
import { MessageSquareHeart, Search, ArrowLeft, Star, Building, Users } from "lucide-react";
import Link from "next/link";
import ExportExcelButton from "@/components/admin/ExportExcelButton";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const db = await getDb();

  const headersList = await headers();
  const payloadStr = headersList.get("x-user-payload");
  const user = payloadStr ? JSON.parse(payloadStr) : null;
  const role = user?.role || "super_admin";

  // Fetch all feedback submissions sorted by newest first
  const feedbackDocs = await db
    .collection("feedback")
    .find({})
    .sort({ submittedAt: -1 })
    .toArray();

  // Prepare clean structured rows for display and Excel export
  const exportData = feedbackDocs.map((doc, idx) => {
    const ratings = doc.ratings || {};
    return {
      "S.No": idx + 1,
      "Student Name": doc.studentName || "N/A",
      "Mobile": doc.mobile || doc.cleanMobile || "N/A",
      "University": doc.university || "N/A",
      "Event Name": doc.eventName || "N/A",
      "Submitted At": doc.submittedAt ? new Date(doc.submittedAt).toLocaleString("en-IN") : "N/A",
      "Overall Experience": ratings.q20_overall_experience || "N/A",
      "Campus Environment": ratings.q1_campus_environment || "N/A",
      "Staff & Volunteers": ratings.q2_staff_volunteers || "N/A",
      "Locating Venue": ratings.q3_locating_venue || "N/A",
      "Registration Process": ratings.q4_registration_process || "N/A",
      "Schedule Communication": ratings.q5_schedule_communication || "N/A",
      "Event Management": ratings.q6_event_management || "N/A",
      "Venue Arrangements": ratings.q7_venue_arrangements || "N/A",
      "Required Facilities": ratings.q8_required_facilities || "N/A",
      "Campus Cleanliness": ratings.q9_campus_cleanliness || "N/A",
      "Washrooms": ratings.q10_washrooms || "N/A",
      "Drinking Water": ratings.q11_drinking_water || "N/A",
      "Food / Refreshments": ratings.q12_food_refreshments || "N/A",
      "Signage & Directions": ratings.q13_signage_directions || "N/A",
      "Parking & Transport": ratings.q14_parking_transport || "N/A",
      "Schedule Adherence": ratings.q15_schedule_adherence || "N/A",
      "Query Handling": ratings.q16_query_handling || "N/A",
      "Fair Competition": ratings.q17_fair_competition || "N/A",
      "Safety & Security": ratings.q18_safety_security || "N/A",
      "Visit Again": ratings.q19_visit_again || "N/A",
      "Comments / Suggestions": doc.comments || "None",
      "IP Address": doc.ipAddress || "N/A",
    };
  });

  // Calculate quick stats
  const totalSubmissions = feedbackDocs.length;
  const excellentCount = feedbackDocs.filter(
    (d) => d.ratings?.q20_overall_experience === "Excellent"
  ).length;
  const visitAgainCount = feedbackDocs.filter(
    (d) => d.ratings?.q19_visit_again === "Definitely"
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <MessageSquareHeart className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Participant Feedback
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                CARAVAN ’26
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              All responses from participants before certificate generation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ExportExcelButton
            data={exportData}
            filename="CARAVAN26_Participant_Feedback"
          />
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
          <p className="text-xs text-slate-400 font-medium">Total Responses</p>
          <p className="text-2xl font-black text-white mt-1">{totalSubmissions}</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] backdrop-blur-md">
          <p className="text-xs text-emerald-400 font-medium">Rated Overall &quot;Excellent&quot;</p>
          <p className="text-2xl font-black text-emerald-300 mt-1">
            {excellentCount}{" "}
            <span className="text-xs font-normal text-slate-400">
              ({totalSubmissions > 0 ? Math.round((excellentCount / totalSubmissions) * 100) : 0}%)
            </span>
          </p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] backdrop-blur-md">
          <p className="text-xs text-amber-400 font-medium">Would Definitely Visit Again</p>
          <p className="text-2xl font-black text-amber-300 mt-1">
            {visitAgainCount}{" "}
            <span className="text-xs font-normal text-slate-400">
              ({totalSubmissions > 0 ? Math.round((visitAgainCount / totalSubmissions) * 100) : 0}%)
            </span>
          </p>
        </div>
      </div>

      {/* Feedback Submissions Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            Responses Log ({totalSubmissions})
          </h2>
          <span className="text-xs text-slate-400">
            Export includes all 20 questions + comments
          </span>
        </div>

        {totalSubmissions === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <MessageSquareHeart className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">No feedback responses recorded yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Feedback submitted by participants before generating certificates will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[650px] scrollbar-thin scrollbar-thumb-white/10">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-950/90 backdrop-blur-md border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">University</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Overall Experience</th>
                  <th className="py-3 px-4">Would Visit Again</th>
                  <th className="py-3 px-4">Comments</th>
                  <th className="py-3 px-4">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {feedbackDocs.map((doc, idx) => {
                  const ratings = doc.ratings || {};
                  return (
                    <tr key={String(doc._id)} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-4 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{doc.studentName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{doc.mobile}</td>
                      <td className="py-3.5 px-4 max-w-[180px] truncate" title={doc.university}>
                        {doc.university}
                      </td>
                      <td className="py-3.5 px-4 text-amber-300 font-medium">{doc.eventName}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            ratings.q20_overall_experience === "Excellent"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : ratings.q20_overall_experience === "Good"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {ratings.q20_overall_experience || "N/A"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-300">{ratings.q19_visit_again || "N/A"}</span>
                      </td>
                      <td
                        className="py-3.5 px-4 max-w-[220px] truncate text-slate-400 italic"
                        title={doc.comments || "None"}
                      >
                        {doc.comments ? `"${doc.comments}"` : "—"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {doc.submittedAt ? new Date(doc.submittedAt).toLocaleString("en-IN") : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
