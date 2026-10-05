import { getDb } from "@/lib/db/client";
import Link from "next/link";
import { Eye, ArrowLeft } from "lucide-react";
import ExportExcelButton from "@/components/admin/ExportExcelButton";
import RegistrationsTable from "./RegistrationsTable";

import { headers } from "next/headers";
import { ObjectId } from "mongodb";

export default async function RegistrationsPage() {
  const db = await getDb();
  
  const headersList = await headers();
  const payloadStr = headersList.get("x-user-payload");
  const user = payloadStr ? JSON.parse(payloadStr) : null;
  const role = user?.role || "super_admin";
  const assignedCategoryIds = user?.assignedCategoryIds || [];

  let filterQuery = {};
  
  if (role === "sub_admin" && assignedCategoryIds.length > 0) {
    const assignedCategoryObjectIds = assignedCategoryIds.map((id: string) => new ObjectId(id));
    const subAdminEvents = await db.collection("events").find({ categoryId: { $in: assignedCategoryObjectIds } }, { projection: { _id: 1 } }).toArray();
    const eventIds = subAdminEvents.map(e => e._id.toString());
    
    // Only show registrations that have at least one event belonging to this sub_admin's assigned categories
    filterQuery = {
      "selectedEvents.eventId": { $in: eventIds }
    };
  } else if (role === "sub_admin") {
    // If sub_admin has no assigned categories, they see nothing
    filterQuery = { _id: null };
  }

  // Fetch registrations, sort by newest
  const registrations = await db
    .collection("registrations")
    .find(filterQuery)
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
      "Team Name": r.teamDetails?.teamName || "N/A",
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
          <RegistrationsTable initialData={JSON.parse(JSON.stringify(registrations.slice(0, 50)))} />
        </table>
      </div>
    </div>
  );
}
