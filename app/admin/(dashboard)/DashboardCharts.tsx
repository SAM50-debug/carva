"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";

type Props = {
  universityStats: { name: string; value: number }[];
  categoryStats: { name: string; value: number }[];
  eventStats: { name: string; value: number }[];
  dailyStats: { date: string; registrations: number }[];
};

const PIE_COLORS = ["#c8102e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

export default function DashboardCharts({ universityStats, categoryStats, eventStats, dailyStats }: Props) {
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1f2937] border border-white/10 p-3 rounded-xl shadow-xl">
          <p className="text-white font-medium mb-1">{label || payload[0].name}</p>
          <p className="text-sm text-slate-400">
            Count: <span className="text-white font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-8 space-y-6">
      
      {/* Top Row: Pie and Daily Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RIMT vs Non-RIMT */}
        <div className="bg-[#111827] border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">RIMT vs Non-RIMT Registrations</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={universityStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {universityStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Registration Trend */}
        <div className="bg-[#111827] border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Registration Trend</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="registrations" stroke="#c8102e" strokeWidth={3} dot={{ r: 4, fill: "#c8102e", strokeWidth: 2, stroke: "#111827" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Category & Event Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Participation */}
        <div className="bg-[#111827] border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Category Participation</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[(index + 1) % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-[#111827] border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Top Events</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20}>
                  {eventStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[(index + 2) % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
