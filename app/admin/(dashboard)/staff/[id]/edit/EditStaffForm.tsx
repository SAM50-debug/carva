"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type EditStaffFormProps = {
  staffId: string;
  initialName: string;
  initialEmail: string;
  initialCategories: string[];
  categories: { id: string; name: string }[];
};

export default function EditStaffForm({ staffId, initialName, initialEmail, initialCategories, categories }: EditStaffFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    name: initialName,
    email: initialEmail,
    password: "", // Optional password reset
    assignedCategoryIds: initialCategories,
  });

  const handleCategoryToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      assignedCategoryIds: prev.assignedCategoryIds.includes(id)
        ? prev.assignedCategoryIds.filter(cId => cId !== id)
        : [...prev.assignedCategoryIds, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/staff/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update staff member");
      }

      setSuccess("Staff member updated successfully!");
      if (formData.password) {
        setFormData(prev => ({ ...prev, password: "" }));
      }
      
      router.refresh();
      // Wait a moment then redirect
      setTimeout(() => router.push("/admin/staff"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#c8102e]/60 focus:bg-black/20 transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
          <input
            required
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#c8102e]/60 focus:bg-black/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Reset Password <span className="text-slate-500 font-normal">(Leave blank to keep current)</span></label>
          <input
            type="password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#c8102e]/60 focus:bg-black/20 transition-all"
            placeholder="New password"
            minLength={6}
          />
        </div>
      </div>

      <div className="pt-4">
        <label className="block text-sm font-medium text-slate-300 mb-3">Assigned Categories</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map(cat => (
            <label 
              key={cat.id} 
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                formData.assignedCategoryIds.includes(cat.id) 
                  ? "bg-[#c8102e]/10 border-[#c8102e]/50" 
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <input 
                type="checkbox" 
                checked={formData.assignedCategoryIds.includes(cat.id)}
                onChange={() => handleCategoryToggle(cat.id)}
                className="w-4 h-4 rounded text-[#c8102e] focus:ring-[#c8102e] border-white/20 bg-black/50"
              />
              <span className="text-white font-medium">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-8 bg-[#c8102e] hover:bg-[#a50e26] disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
