"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";
import DashboardLoading from "../loading";

type Category = {
  _id: string;
  slug: string;
  name: string;
  descriptor?: string;
  order: number;
  isActive: boolean;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <DashboardLoading />;

  const filteredCategories = Array.isArray(categories) 
    ? categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-slate-400 text-sm mt-1">Manage event categories and branding.</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60"
          />
        </div>
      </div>

      <div className="bg-[#111827] border border-white/8 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-white/5 text-slate-400 border-b border-white/8">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Slug</th>
              <th className="px-6 py-4 font-medium">Order</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {filteredCategories.map((cat) => (
              <tr key={cat._id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-white">{cat.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{cat.descriptor}</p>
                </td>
                <td className="px-6 py-4 font-mono text-xs">{cat.slug}</td>
                <td className="px-6 py-4">{cat.order}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cat.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                    {cat.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/categories/${cat._id}`}
                    className="inline-flex items-center gap-2 text-sm text-[#c8102e] hover:text-[#ff1a3b] font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
