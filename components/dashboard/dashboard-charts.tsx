"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const weeklyData = [
  { day: "Mon", orders: 24, revenue: 680 },
  { day: "Tue", orders: 32, revenue: 890 },
  { day: "Wed", orders: 28, revenue: 760 },
  { day: "Thu", orders: 38, revenue: 1020 },
  { day: "Fri", orders: 52, revenue: 1480 },
  { day: "Sat", orders: 64, revenue: 1820 },
  { day: "Sun", orders: 45, revenue: 1250 },
];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-stone-200 rounded-xl px-3 py-2 text-xs">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-stone-600">
            {p.name}: {p.name === "revenue" ? `$${p.value}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardCharts() {
  return (
    <div className="space-y-4">
      {/* Orders Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Orders</CardTitle>
          <span className="text-xs text-stone-500">This week</span>
        </CardHeader>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barSize={28}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#78716c" }}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#000" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Revenue Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <span className="text-xs text-stone-500">This week</span>
        </CardHeader>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#78716c" }}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#000"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#000" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
