"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { DollarSign, ShoppingCart, TrendingUp, Clock } from "lucide-react";

const dailyData = [
  { date: "May 9", orders: 18, revenue: 520 },
  { date: "May 10", orders: 24, revenue: 680 },
  { date: "May 11", orders: 32, revenue: 890 },
  { date: "May 12", orders: 28, revenue: 760 },
  { date: "May 13", orders: 38, revenue: 1020 },
  { date: "May 14", orders: 52, revenue: 1480 },
  { date: "May 15", orders: 45, revenue: 1250 },
];

const topItems = [
  { name: "Ribeye Steak", orders: 42, revenue: 1469.58 },
  { name: "Chicken Wings", orders: 68, revenue: 815.32 },
  { name: "Caesar Salad", orders: 55, revenue: 549.45 },
  { name: "Margherita Pizza", orders: 48, revenue: 719.52 },
  { name: "Lava Cake", orders: 36, revenue: 323.64 },
];

const categoryData = [
  { name: "Main Course", value: 38 },
  { name: "Pizza", value: 22 },
  { name: "Burgers", value: 18 },
  { name: "Starters", value: 12 },
  { name: "Desserts", value: 10 },
];

const COLORS = ["#000000", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB"];

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

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports & Analytics" description="Sales performance and insights" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard title="This Week" value="$6,600" icon={<DollarSign size={16} />} color="green" />
        <StatCard title="Total Orders" value="237" icon={<ShoppingCart size={16} />} />
        <StatCard title="Avg Order Value" icon={<TrendingUp size={16} />} value="$27.85" />
        <StatCard title="Avg Prep Time" value="14 min" icon={<Clock size={16} />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Daily Revenue */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue (Last 7 Days)</CardTitle>
            </CardHeader>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} barSize={32}>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#78716c" }}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#000" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Category Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <div className="h-56 flex flex-col items-center">
            <div className="h-36">
              <ResponsiveContainer width={180} height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    dataKey="value"
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-2">
              {categoryData.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: COLORS[i] }}
                  />
                  <span className="text-stone-600">{item.name}</span>
                  <span className="font-semibold ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Top Items */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Items</CardTitle>
        </CardHeader>
        <div className="space-y-2">
          {topItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-stone-100 rounded-lg flex items-center justify-center text-xs font-bold text-stone-600">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{item.name}</span>
                  <div className="flex gap-4 text-xs text-stone-500">
                    <span>{item.orders} orders</span>
                    <span className="font-semibold text-black">${item.revenue.toFixed(2)}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full">
                  <div
                    className="h-full bg-black rounded-full"
                    style={{ width: `${(item.orders / 68) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
