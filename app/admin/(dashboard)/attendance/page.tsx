import { getDb } from "@/lib/db/client";
import Link from "next/link";
import { QrCode, ArrowRight, ArrowLeft } from "lucide-react";
import { headers } from "next/headers";

export default async function AttendanceEventPicker() {
  const db = await getDb();
  
  const headersList = await headers();
  const payloadStr = headersList.get("x-user-payload");
  const user = payloadStr ? JSON.parse(payloadStr) : null;

  // Fetch active events and their categories
  const events = await db.collection("events").find({ isActive: true }).toArray();
  let categories = await db.collection("categories").find({ isActive: true }).toArray();

  // If sub_admin, filter categories
  if (user && user.role === "sub_admin") {
    const assignedIds = user.assignedCategoryIds || [];
    categories = categories.filter(c => assignedIds.includes(c._id.toString()));
  }

  const getCategoryName = (id: any) => {
    return categories.find(c => c._id.toString() === id.toString())?.name || "Unknown";
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <QrCode className="w-8 h-8 text-[#c8102e]" />
          Attendance Scanner
        </h1>
        <p className="text-slate-400">Select an event below to start scanning participant QR codes.</p>
      </div>

      <div className="space-y-10">
        {categories.map(category => {
          const categoryEvents = events.filter(e => e.categoryId.toString() === category._id.toString());
          if (categoryEvents.length === 0) return null;

          return (
            <div key={category._id.toString()}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                <span className="w-2 h-2 rounded-full bg-[#c8102e]" />
                {category.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryEvents.map((evt) => (
                  <Link 
                    href={`/admin/attendance/${evt._id.toString()}`} 
                    key={evt._id.toString()}
                    className="group block p-5 rounded-2xl bg-[#111827]/50 border border-white/10 hover:border-[#c8102e]/50 hover:bg-white/5 transition-all"
                  >
                    <h3 className="text-lg font-bold text-white mb-4">{evt.name}</h3>
                    <div className="flex items-center text-sm font-medium text-slate-400 group-hover:text-white transition-colors">
                      Start Scanning <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
