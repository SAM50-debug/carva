"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CreateStaffFormProps = {
  categories: { id: string; name: string }[];
  events: { id: string; name: string; categoryId: string }[];
};

export default function CreateStaffForm({ categories, events }: CreateStaffFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    assignedCategoryIds: [] as string[],
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

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create staff member");
      }

      router.push("/admin/staff");
      router.refresh();
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

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#c8102e]/60 focus:bg-black/20 transition-all"
            placeholder="e.g. Rahul Sharma"
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
            placeholder="rahul@rimt.ac.in"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <input
            required
            type="password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#c8102e]/60 focus:bg-black/20 transition-all"
            placeholder="••••••••"
            minLength={6}
          />
        </div>
      </div>

      <div className="pt-4">
        <label className="block text-sm font-medium text-slate-300 mb-3">Assign Categories</label>
        <p className="text-xs text-slate-500 mb-4">Select which categories this sub-admin is allowed to manage and scan attendance for.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map(cat => (
            <label
              key={cat.id}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.assignedCategoryIds.includes(cat.id)
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
        {loading ? "Creating..." : "Create Sub-Admin"}
      </button>
    </form>
  );
}
