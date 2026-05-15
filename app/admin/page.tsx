import { getSession } from "@/lib/auth";
import { getRedis, KEYS } from "@/lib/redis";
import type { Order, Table, InventoryItem } from "@/lib/types";
import { StatCard } from "@/components/ui/stat-card";
import { ShoppingCart, DollarSign, Grid3X3, ChefHat, Package, TrendingUp, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { RecentOrders } from "@/components/dashboard/recent-orders";

async function getDashboardData() {
  try {
    const redis = getRedis();
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const orderIds = (await redis.get(KEYS.orders) as string[]) || [];
    const allOrders: Order[] = [];
    for (const id of orderIds.slice(-100)) {
      const raw = await redis.get(KEYS.order(id));
      if (raw) allOrders.push(typeof raw === "string" ? JSON.parse(raw) : raw as Order);
    }

    const todayOrders = allOrders.filter((o) => new Date(o.createdAt) >= today);
    const activeOrders = allOrders.filter((o) => ["pending", "preparing", "ready"].includes(o.status));
    const pendingKitchen = allOrders.filter((o) => ["pending", "preparing"].includes(o.status));
    const todayRevenue = todayOrders.filter((o) => o.isPaid).reduce((s, o) => s + o.total, 0);

    const tableIds = (await redis.get(KEYS.tables) as string[]) || [];
    let activeTables = 0;
    for (const id of tableIds) {
      const raw = await redis.get(KEYS.table(id));
      if (raw) { const t: Table = typeof raw === "string" ? JSON.parse(raw) : raw as Table; if (t.status === "occupied") activeTables++; }
    }

    const invIds = (await redis.get(KEYS.inventory) as string[]) || [];
    let lowStock = 0;
    for (const id of invIds) {
      const raw = await redis.get(KEYS.inventoryItem(id));
      if (raw) { const item: InventoryItem = typeof raw === "string" ? JSON.parse(raw) : raw as InventoryItem; if (item.quantity <= item.minQuantity) lowStock++; }
    }

    const recentOrders = allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
    return { totalOrders: allOrders.length, todayOrders: todayOrders.length, activeOrders: activeOrders.length, pendingKitchen: pendingKitchen.length, todayRevenue, activeTables, totalTables: tableIds.length, lowStock, recentOrders };
  } catch {
    return { totalOrders: 0, todayOrders: 0, activeOrders: 0, pendingKitchen: 0, todayRevenue: 0, activeTables: 0, totalTables: 0, lowStock: 0, recentOrders: [] };
  }
}

export default async function AdminDashboard() {
  const session = await getSession();
  const data = await getDashboardData();

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-6 bg-[#ff6b6b] border border-[#1a1a1a] rounded-full" />
          <h1 className="text-xl font-black text-[#1a1a1a] tracking-tight">Dashboard</h1>
        </div>
        <p className="text-sm text-[#a8a29e] font-medium ml-4">
          Good day, <span className="text-[#1a1a1a] font-semibold">{session?.email.split("@")[0]}</span>
        </p>
      </div>

      {/* Stats row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <StatCard title="Today's Orders"   value={data.todayOrders}                icon={<ShoppingCart size={15} />} color="coral"   trend={{ value: 12, label: "vs yesterday" }} />
        <StatCard title="Today's Revenue"  value={formatCurrency(data.todayRevenue)} icon={<DollarSign size={15} />}   color="mint"    trend={{ value: 8,  label: "vs yesterday" }} />
        <StatCard title="Active Tables"    value={`${data.activeTables}/${data.totalTables}`} icon={<Grid3X3 size={15} />} color="sky" />
        <StatCard title="Kitchen Queue"    value={data.pendingKitchen}              icon={<ChefHat size={15} />}      color={data.pendingKitchen > 5 ? "amber" : "default"} />
      </div>

      {/* Stats row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard title="Active Orders"    value={data.activeOrders}   icon={<Clock size={15} />}    color="lilac" />
        <StatCard title="Low Stock Items"  value={data.lowStock}        icon={<Package size={15} />}  color={data.lowStock > 0 ? "coral" : "default"} />
        <StatCard title="Total Orders"     value={data.totalOrders}    icon={<TrendingUp size={15} />} />
        <StatCard title="Total Tables"     value={data.totalTables}    icon={<Grid3X3 size={15} />}  color="sky" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><DashboardCharts /></div>
        <div><RecentOrders orders={data.recentOrders} /></div>
      </div>
    </div>
  );
}
