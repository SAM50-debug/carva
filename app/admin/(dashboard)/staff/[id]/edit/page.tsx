import { getDb } from "@/lib/db/client";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditStaffForm from "./EditStaffForm";

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) return notFound();

  const db = await getDb();
  
  const staffMember = await db.collection("adminUsers").findOne({ _id: new ObjectId(id) });
  if (!staffMember) return notFound();

  if (staffMember.role === "super_admin") {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto text-center mt-20">
        <h1 className="text-2xl font-bold text-white mb-4">Cannot Edit Super Admin</h1>
        <p className="text-slate-400 mb-6">The super admin account cannot be modified through this interface.</p>
        <Link href="/admin/staff" className="text-[#c8102e] hover:text-white transition-colors">
          Return to Staff List
        </Link>
      </div>
    );
  }

  const categories = await db.collection("categories").find({ isActive: true }).toArray();

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Link href="/admin/staff" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Staff
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Edit Staff Member</h1>
        <p className="text-slate-400">Update details, categories, or reset password for {staffMember.name}</p>
      </div>

      <div className="bg-[#111827]/50 rounded-2xl border border-white/10 p-6 md:p-8 backdrop-blur-sm">
        <EditStaffForm 
          staffId={staffMember._id.toString()}
          initialName={staffMember.name}
          initialEmail={staffMember.email}
          initialCategories={staffMember.assignedCategoryIds?.map((id: any) => id.toString()) || []}
          categories={categories.map(c => ({ id: c._id.toString(), name: c.name }))}
        />
      </div>
    </div>
  );
}
