"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const weeklyData = [
  { day: "Mon", orders: 24, revenue: 680 },
  { day: "Tue", orders: 32, revenue: 890 },
  { day: "Wed", orders: 28, revenue: 760 },
  { day: "Thu", orders: 38, revenue: 1020 },
  { day: "Fri", orders: 52, revenue: 1480 },
  { day: "Sat", orders: 64, revenue: 1820 },
  { day: "Sun", orders: 45, revenue: 1250 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border-2 border-[#1a1a1a] rounded-xl px-3 py-2 text-xs">
        <p className="font-bold mb-1 text-[#1a1a1a]">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-[#6b6560]">{p.name}: <span className="font-semibold text-[#1a1a1a]">{p.name === "revenue" ? `$${p.value}` : p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardCharts() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Orders</CardTitle>
          <span className="text-[10px] font-bold text-[#a8a29e] uppercase tracking-wide bg-[#f5f0e8] border border-[#1a1a1a] px-2 py-0.5 rounded-lg">This week</span>
        </CardHeader>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barSize={26}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a8a29e", fontWeight: 600 }} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#ff6b6b" radius={[6, 6, 2, 2]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <span className="text-[10px] font-bold text-[#a8a29e] uppercase tracking-wide bg-[#d4f5ec] border border-[#1a1a1a] px-2 py-0.5 rounded-lg text-[#1a7a5e]">This week</span>
        </CardHeader>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a8a29e", fontWeight: 600 }} />
              <YAxis hide />
              <CartesianGrid stroke="#f5f0e8" strokeDasharray="4 4" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="#52c4a0" strokeWidth={2.5} dot={{ r: 3, fill: "#52c4a0", stroke: "#1a1a1a", strokeWidth: 1.5 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
