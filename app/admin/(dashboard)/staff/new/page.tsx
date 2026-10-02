import { getDb } from "@/lib/db/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CreateStaffForm from "./CreateStaffForm";

export default async function CreateStaffPage() {
  const db = await getDb();

  const categories = await db.collection("categories").find({ isActive: true }).toArray();
  const events = await db.collection("events").find({ isActive: true }).toArray();

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Link href="/admin/staff" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Staff
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Add Sub-Admin</h1>
        <p className="text-slate-400">Create a new account for an event coordinator</p>
      </div>

      <div className="bg-[#111827]/50 rounded-2xl border border-white/10 p-6 md:p-8 backdrop-blur-sm">
        <CreateStaffForm
          categories={categories.map(c => ({ id: c._id.toString(), name: c.name }))}
          events={events.map(e => ({ id: e._id.toString(), name: e.name, categoryId: e.categoryId.toString() }))}
        />
      </div>
    </div>
  );
}
