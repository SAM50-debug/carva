"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Image as ImageIcon, Plus, X } from "lucide-react";
import { EventDoc } from "@/lib/db/models/types";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<EventDoc>>({
    name: "",
    slug: "",
    descriptor: "",
    isActive: true,
    imageUrl: "",
    subEvents: [],
  });

  const [newSubEvent, setNewSubEvent] = useState("");

  useEffect(() => {
    fetch(`/api/admin/events/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData(data);
        setLoading(false);
      });
  }, [params.id]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const data = new FormData();
    data.append("file", file);
    data.append("folder", "caravan26/events");

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const { url } = await res.json();
      if (url) setFormData((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      alert("Image upload failed");
    }
  }

  function addSubEvent() {
    if (!newSubEvent.trim()) return;
    setFormData((prev) => ({
      ...prev,
      subEvents: [...(prev.subEvents || []), newSubEvent.trim()],
    }));
    setNewSubEvent("");
  }

  function removeSubEvent(index: number) {
    setFormData((prev) => ({
      ...prev,
      subEvents: (prev.subEvents || []).filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch(`/api/admin/events/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        router.push("/admin/events");
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
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/events" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Event</h1>
          <p className="text-slate-400 text-sm mt-1">{formData.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Info */}
        <div className="bg-[#111827] border border-white/8 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white border-b border-white/8 pb-4">Core Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Event Banner (Cloudinary)</label>
            <div className="flex items-start gap-6">
              {formData.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={formData.imageUrl} alt="Banner" className="w-64 h-32 object-cover rounded-xl border border-white/10" />
              ) : (
                <div className="w-64 h-32 rounded-xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-slate-500">
                  <ImageIcon className="w-6 h-6 mb-2" />
                  <span className="text-xs">No image</span>
                </div>
              )}
              <div className="flex-1">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white cursor-pointer transition-colors">
                  Upload Event Banner
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
                <p className="text-xs text-slate-500 mt-2">Recommended size: 1200x600px. Appears on the event detail page.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Slug</label>
              <input type="text" required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Descriptor (Subtitle)</label>
            <input type="text" value={formData.descriptor} onChange={(e) => setFormData({...formData, descriptor: e.target.value})} className="w-full bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 rounded border-white/20 bg-[#1f2937] text-[#c8102e] focus:ring-[#c8102e]/60 focus:ring-offset-0" />
            <label htmlFor="isActive" className="text-sm font-medium text-white">Active (Visible on public site)</label>
          </div>
        </div>

        {/* Sub-events */}
        <div className="bg-[#111827] border border-white/8 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white border-b border-white/8 pb-4">Sub-events / Categories</h2>
          <p className="text-sm text-slate-400">If this event requires participants to choose a specific style or theme (e.g. "Bhangra" vs "Western Dance"), list them here.</p>
          
          <div className="space-y-3">
            {formData.subEvents?.map((sub, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-sm text-white">{sub}</span>
                <button type="button" onClick={() => removeSubEvent(i)} className="text-slate-500 hover:text-red-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <input 
              type="text" 
              value={newSubEvent}
              onChange={(e) => setNewSubEvent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubEvent())}
              placeholder="Add new sub-event (e.g. Social Issues)"
              className="flex-1 bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" 
            />
            <button type="button" onClick={addSubEvent} className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              Add
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-[#c8102e] hover:bg-[#a50e26] text-white px-8 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50">
            <Save className="w-5 h-5" />
            {saving ? "Saving Changes..." : "Save Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
