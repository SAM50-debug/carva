import { getDb } from "@/lib/db/client";
import Link from "next/link";
import { UserPlus, Shield, ShieldAlert, ArrowLeft } from "lucide-react";

export default async function StaffPage() {
  const db = await getDb();

  const staff = await db.collection("adminUsers").find({}).toArray();

  return (
    <div className="p-4 md:p-8">
      <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Staff & Sub-Admins</h1>
          <p className="text-slate-400">Manage event coordinators and their permissions</p>
        </div>
        <Link href="/admin/staff/new" className="bg-[#c8102e] hover:bg-[#a50e26] text-white px-4 py-2.5 rounded-xl font-medium transition flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Add Staff Member
        </Link>
      </div>

      <div className="bg-[#111827]/50 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#1f2937]/50 text-xs uppercase text-slate-400 border-b border-white/10">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {staff.map((user) => (
              <tr key={user._id.toString()} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    {user.role === "super_admin" ? (
                      <>
                        <ShieldAlert className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 font-medium capitalize">Super Admin</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 font-medium capitalize">Sub Admin</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                    {user.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {user.role !== "super_admin" && (
                    <Link href={`/admin/staff/${user._id.toString()}/edit`} className="text-slate-400 hover:text-white transition">Edit</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
