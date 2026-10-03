import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-white/5 rounded-xl animate-pulse" />
      </div>

      {/* Controls Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="h-11 flex-1 max-w-md bg-white/5 rounded-xl animate-pulse" />
        <div className="h-11 w-40 bg-white/5 rounded-xl animate-pulse" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-[#111827] border border-white/8 rounded-2xl overflow-hidden">
        <div className="h-12 bg-white/5 border-b border-white/8" />
        <div className="divide-y divide-white/8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-6">
              <div className="h-10 w-10 bg-white/5 rounded-full animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/4 bg-white/5 rounded-lg animate-pulse" />
                <div className="h-3 w-1/3 bg-white/5 rounded-lg animate-pulse" />
              </div>
              <div className="h-8 w-20 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-8">
        <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
      </div>
    </div>
  );
}
