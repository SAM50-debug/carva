import { getDb } from "@/lib/db/client";
import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import QRScanner from "./QRScanner";
import { headers } from "next/headers";

export default async function AttendanceScannerPage({ params }: { params: { eventId: string } }) {
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

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6 max-w-md mx-auto">
        <Link href="/admin/attendance" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>
        <Link href={`/admin/attendance/${eventId}/list`} className="text-sm font-medium text-[#c8102e] hover:text-[#a50e26] transition-colors">
          View Attendance List
        </Link>
      </div>
      
      <QRScanner eventId={eventId} eventName={event.name} />
    </div>
  );
}
