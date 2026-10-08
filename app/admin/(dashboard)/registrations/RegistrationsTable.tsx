"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Eye, Loader2, Trash2 } from "lucide-react";
import { getRegistrationsPage, deleteRegistrationAction } from "./actions";
import { EditRegistrationModal } from "./[id]/EditRegistrationModal";

type Registration = {
  _id: string;
  studentName: string;
  email: string;
  university?: string;
  course: string;
  year: string;
  participationType: string;
  teamDetails?: {
    teamName: string;
    leaderName: string;
    memberCount: number;
    membersInfo: string;
  };
  status: string;
  submittedAt: string;
};

export default function RegistrationsTable({ initialData, query = "", role, filterEventId = "", filterCategoryId = "" }: { initialData: Registration[], query?: string, role?: string, filterEventId?: string, filterCategoryId?: string }) {
  const [data, setData] = useState<Registration[]>(initialData);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialData.length === 50);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingTriggerRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const skip = page * 50;
      const nextBatch = await getRegistrationsPage(skip, 50, query, filterEventId, filterCategoryId);
      
      if (nextBatch.length === 0) {
        setHasMore(false);
      } else {
        setData(prev => [...prev, ...nextBatch]);
        setPage(prev => prev + 1);
        if (nextBatch.length < 50) setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more registrations", err);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, query, filterEventId, filterCategoryId]);

  // When initialData changes (e.g. from URL search params changing), reset the infinite scroll state
  useEffect(() => {
    setData(initialData);
    setPage(1);
    setHasMore(initialData.length === 50);
  }, [initialData]);

  useEffect(() => {
    if (!loadingTriggerRef.current) return;
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    }, { threshold: 0.5 });
    
    observerRef.current.observe(loadingTriggerRef.current);
    
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadMore]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this registration? This action cannot be undone.")) return;
    
    try {
      await deleteRegistrationAction(id);
      setData(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error("Failed to delete registration", err);
      alert("Failed to delete registration");
    }
  };

  return (
    <>
      <tbody className="divide-y divide-white/10">
        {data.map((reg) => (
          <tr key={reg._id.toString()} className="hover:bg-white/5 transition-colors">
            <td className="px-6 py-4">
              <div className="font-semibold text-white">{reg.studentName}</div>
              <div className="text-xs text-slate-500">{reg.email}</div>
            </td>
            <td className="px-6 py-4">
              <div className="text-white">{reg.university || "RIMT University"}</div>
              <div className="text-xs text-slate-500">{reg.course} • {reg.year} Year</div>
            </td>
            <td className="px-6 py-4">
              <div className="capitalize">{reg.participationType}</div>
              {reg.participationType === 'team' && reg.teamDetails && (
                <div className="text-xs text-[#c8102e] font-medium mt-0.5">{reg.teamDetails.teamName}</div>
              )}
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium ${
                reg.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                reg.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              }`}>
                {reg.status || 'pending'}
              </span>
            </td>
            <td className="px-6 py-4 text-slate-400" suppressHydrationWarning>
              {new Date(reg.submittedAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <EditRegistrationModal 
                  registration={reg} 
                  compact 
                  onSuccess={(updatedReg) => {
                    setData(prev => prev.map(r => 
                      r._id === reg._id 
                        ? { ...r, ...updatedReg } 
                        : r
                    ));
                  }}
                />
                <Link href={`/admin/registrations/${reg._id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-medium transition-all active:scale-95 duration-200">
                  <Eye className="w-3.5 h-3.5" /> View
                </Link>
                {role === "super_admin" && (
                  <button onClick={() => handleDelete(reg._id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium transition-all active:scale-95 duration-200">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
        
        {data.length === 0 && !loading && (
          <tr>
            <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
              No registrations found yet.
            </td>
          </tr>
        )}
      </tbody>
      {hasMore && (
        <tfoot className="border-t border-white/10">
          <tr>
            <td colSpan={6} className="p-4">
              <div ref={loadingTriggerRef} className="flex justify-center items-center py-4 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm font-medium">Loading more data...</span>
              </div>
            </td>
          </tr>
        </tfoot>
      )}
    </>
  );
}
