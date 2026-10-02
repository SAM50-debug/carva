import { getDb } from "@/lib/db/client";
import DashboardCharts from "./DashboardCharts";

export default async function AdminDashboardPage() {
  // Quick stats — gracefully handle DB not yet seeded
  let stats = { registrations: 0, events: 0, categories: 0, staff: 0 };
  let universityStats: { name: string; value: number }[] = [];
  let dailyStats: { date: string; registrations: number }[] = [];
  let categoryStats: { name: string; value: number }[] = [];
  let eventStats: { name: string; value: number }[] = [];

  try {
    const db = await getDb();
    const [regs, evts, cats, stfs] = await Promise.all([
      db.collection("registrations").countDocuments(),
      db.collection("events").countDocuments({ isActive: true }),
      db.collection("categories").countDocuments({ isActive: true }),
      db.collection("adminUsers").countDocuments({ isActive: true }),
    ]);
    stats = { registrations: regs, events: evts, categories: cats, staff: stfs };

    // 1. RIMT vs Non-RIMT
    const rimtCount = await db.collection("registrations").countDocuments({ university: { $regex: /rimt/i } });
    const nonRimtCount = regs - rimtCount;
    universityStats = [
      { name: "RIMT", value: rimtCount },
      { name: "Non-RIMT", value: nonRimtCount }
    ];

    // 2. Daily Registration Trend
    const dailyAggr = await db.collection("registrations").aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
          registrations: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 14 }
    ]).toArray();
    dailyStats = dailyAggr.map(d => ({ date: d._id, registrations: d.registrations }));

    // 3. Category & Event Stats
    const eventParticipation = await db.collection("registrations").aggregate([
      { $unwind: "$selectedEvents" },
      {
        $group: {
          _id: "$selectedEvents.eventId",
          categoryId: { $first: "$selectedEvents.categoryId" },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Map Event names
    const eventsLookup = await db.collection("events").find({}).project({ name: 1, categoryId: 1 }).toArray();
    const categoriesLookup = await db.collection("categories").find({}).project({ name: 1 }).toArray();

    const categoryCountMap: Record<string, number> = {};
    const eventCountMap: { name: string, value: number }[] = [];

    eventParticipation.forEach(p => {
      // Find event
      const eventObj = eventsLookup.find(e => e._id.toString() === p._id.toString());
      if (eventObj) {
        eventCountMap.push({ name: eventObj.name, value: p.count });
        
        // Find category
        const catId = p.categoryId?.toString() || eventObj.categoryId?.toString();
        const catObj = categoriesLookup.find(c => c._id.toString() === catId);
        if (catObj) {
          categoryCountMap[catObj.name] = (categoryCountMap[catObj.name] || 0) + p.count;
        }
      }
    });

    categoryStats = Object.keys(categoryCountMap).map(k => ({ name: k, value: categoryCountMap[k] })).sort((a, b) => b.value - a.value);
    eventStats = eventCountMap.sort((a, b) => b.value - a.value).slice(0, 5); // top 5 events

  } catch (err) {
    console.error("Dashboard fetch error:", err);
  }

  const cards = [
    { label: "Total Registrations", value: stats.registrations, color: "text-emerald-400" },
    { label: "Active Events", value: stats.events, color: "text-blue-400" },
    { label: "Categories", value: stats.categories, color: "text-purple-400" },
    { label: "Staff Members", value: stats.staff, color: "text-amber-400" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">CARAVAN &apos;26 — Event Management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-[#111827] border border-white/8 rounded-2xl p-5"
          >
            <p className="text-sm text-slate-400">{label}</p>
            <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Render Charts */}
      {stats.registrations > 0 ? (
        <DashboardCharts 
          universityStats={universityStats}
          categoryStats={categoryStats}
          eventStats={eventStats}
          dailyStats={dailyStats}
        />
      ) : (
        <div className="mt-10 bg-[#111827] border border-white/8 rounded-2xl p-8 text-center">
          <p className="text-slate-400">No registration data available yet to display charts.</p>
        </div>
      )}
    </div>
  );
}
