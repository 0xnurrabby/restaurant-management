import { getSession } from "@/lib/auth";
import { getRedis, KEYS } from "@/lib/redis";
import type { Order, Table, InventoryItem } from "@/lib/types";
import { StatCard } from "@/components/ui/stat-card";
import {
  ShoppingCart,
  DollarSign,
  Grid3X3,
  ChefHat,
  Package,
  TrendingUp,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { RecentOrders } from "@/components/dashboard/recent-orders";

async function getDashboardData() {
  try {
    const redis = getRedis();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orderIds = (await redis.get(KEYS.orders) as string[]) || [];
    const allOrders: Order[] = [];

    for (const id of orderIds.slice(-100)) {
      const raw = await redis.get(KEYS.order(id));
      if (raw) allOrders.push(typeof raw === "string" ? JSON.parse(raw) : raw as Order);
    }

    const todayOrders = allOrders.filter(
      (o) => new Date(o.createdAt) >= today
    );
    const activeOrders = allOrders.filter((o) =>
      ["pending", "preparing", "ready"].includes(o.status)
    );
    const pendingKitchen = allOrders.filter((o) =>
      ["pending", "preparing"].includes(o.status)
    );

    const todayRevenue = todayOrders
      .filter((o) => o.isPaid)
      .reduce((s, o) => s + o.total, 0);

    const tableIds = (await redis.get(KEYS.tables) as string[]) || [];
    let activeTables = 0;
    for (const id of tableIds) {
      const raw = await redis.get(KEYS.table(id));
      if (raw) {
        const t: Table = typeof raw === "string" ? JSON.parse(raw) : raw as Table;
        if (t.status === "occupied") activeTables++;
      }
    }

    const invIds = (await redis.get(KEYS.inventory) as string[]) || [];
    let lowStock = 0;
    for (const id of invIds) {
      const raw = await redis.get(KEYS.inventoryItem(id));
      if (raw) {
        const item: InventoryItem = typeof raw === "string" ? JSON.parse(raw) : raw as InventoryItem;
        if (item.quantity <= item.minQuantity) lowStock++;
      }
    }

    const recentOrders = allOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);

    return {
      totalOrders: allOrders.length,
      todayOrders: todayOrders.length,
      activeOrders: activeOrders.length,
      pendingKitchen: pendingKitchen.length,
      todayRevenue,
      activeTables,
      totalTables: tableIds.length,
      lowStock,
      recentOrders,
    };
  } catch {
    return {
      totalOrders: 0,
      todayOrders: 0,
      activeOrders: 0,
      pendingKitchen: 0,
      todayRevenue: 0,
      activeTables: 0,
      totalTables: 0,
      lowStock: 0,
      recentOrders: [],
    };
  }
}

export default async function AdminDashboard() {
  const session = await getSession();
  const data = await getDashboardData();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          Welcome back, {session?.email.split("@")[0]}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          title="Today's Orders"
          value={data.todayOrders}
          icon={<ShoppingCart size={16} />}
          trend={{ value: 12, label: "vs yesterday" }}
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(data.todayRevenue)}
          icon={<DollarSign size={16} />}
          trend={{ value: 8, label: "vs yesterday" }}
          color="green"
        />
        <StatCard
          title="Active Tables"
          value={`${data.activeTables}/${data.totalTables}`}
          icon={<Grid3X3 size={16} />}
        />
        <StatCard
          title="Kitchen Queue"
          value={data.pendingKitchen}
          icon={<ChefHat size={16} />}
          color={data.pendingKitchen > 5 ? "amber" : "default"}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          title="Active Orders"
          value={data.activeOrders}
          icon={<Clock size={16} />}
        />
        <StatCard
          title="Low Stock Items"
          value={data.lowStock}
          icon={<Package size={16} />}
          color={data.lowStock > 0 ? "red" : "default"}
        />
        <StatCard
          title="Total Orders"
          value={data.totalOrders}
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          title="Tables"
          value={data.totalTables}
          icon={<Grid3X3 size={16} />}
        />
      </div>

      {/* Charts + Recent */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <DashboardCharts />
        </div>
        <div>
          <RecentOrders orders={data.recentOrders} />
        </div>
      </div>
    </div>
  );
}
