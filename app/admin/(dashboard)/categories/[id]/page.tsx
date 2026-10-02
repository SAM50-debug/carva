"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    descriptor: "",
    order: 0,
    isActive: true,
    imageUrl: "",
    accent: "",
  });

  useEffect(() => {
    fetch(`/api/admin/categories/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          name: data.name || "",
          slug: data.slug || "",
          descriptor: data.descriptor || "",
          order: data.order || 0,
          isActive: data.isActive ?? true,
          imageUrl: data.imageUrl || "",
          accent: data.accent || "",
        });
        setLoading(false);
      });
  }, [params.id]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const data = new FormData();
    data.append("file", file);
    data.append("folder", "caravan26/categories");

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const { url } = await res.json();
      if (url) setFormData((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      alert("Image upload failed");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch(`/api/admin/categories/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        router.push("/admin/categories");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Update failed");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-slate-400">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/categories" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Category</h1>
          <p className="text-slate-400 text-sm mt-1">{formData.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-[#111827] border border-white/8 rounded-2xl p-6">
        
        {/* Image Upload Area */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Category Banner (Cloudinary)</label>
          <div className="flex items-start gap-6">
            {formData.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={formData.imageUrl} alt="Banner" className="w-48 h-32 object-cover rounded-xl border border-white/10" />
            ) : (
              <div className="w-48 h-32 rounded-xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-slate-500">
                <ImageIcon className="w-6 h-6 mb-2" />
                <span className="text-xs">No image</span>
              </div>
            )}
            <div className="flex-1">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white cursor-pointer transition-colors">
                Upload New Image
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
              <p className="text-xs text-slate-500 mt-2">Recommended size: 1200x800px (JPG, PNG, WebP)</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Name</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Slug (URL)</label>
            <input type="text" required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Descriptor</label>
          <input type="text" value={formData.descriptor} onChange={(e) => setFormData({...formData, descriptor: e.target.value})} className="w-full bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Accent Color (Hex)</label>
            <div className="flex gap-3">
              <input type="color" value={formData.accent || "#000000"} onChange={(e) => setFormData({...formData, accent: e.target.value})} className="w-11 h-11 rounded-lg bg-transparent cursor-pointer" />
              <input type="text" value={formData.accent} onChange={(e) => setFormData({...formData, accent: e.target.value})} className="flex-1 bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Display Order</label>
            <input type="number" required value={formData.order} onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})} className="w-full bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 rounded border-white/20 bg-[#1f2937] text-[#c8102e] focus:ring-[#c8102e]/60 focus:ring-offset-0" />
          <label htmlFor="isActive" className="text-sm font-medium text-white">Active (Visible on public site)</label>
        </div>

        <div className="pt-6 border-t border-white/8 flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-[#c8102e] hover:bg-[#a50e26] text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
