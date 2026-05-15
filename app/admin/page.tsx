import { getSession } from "@/lib/auth";
import { getRedis, KEYS } from "@/lib/redis";
import type { Order, Table, InventoryItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { RecentOrders } from "@/components/dashboard/recent-orders";

async function getStats() {
  try {
    const redis = getRedis();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const orderIds = (await redis.get(KEYS.orders) as string[]) || [];
    const allOrders: Order[] = [];
    for (const id of orderIds.slice(-200)) {
      const raw = await redis.get(KEYS.order(id));
      if (raw) allOrders.push(typeof raw === "string" ? JSON.parse(raw) : raw as Order);
    }
    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= today);
    const todayRevenue = todayOrders.filter(o => o.isPaid).reduce((s, o) => s + o.total, 0);
    const activeOrders = allOrders.filter(o => ["pending", "preparing", "ready"].includes(o.status)).length;
    const kitchenQueue = allOrders.filter(o => ["pending", "preparing"].includes(o.status)).length;
    const tableIds = (await redis.get(KEYS.tables) as string[]) || [];
    let activeTables = 0;
    for (const id of tableIds) { const raw = await redis.get(KEYS.table(id)); if (raw) { const t: Table = typeof raw === "string" ? JSON.parse(raw) : raw as Table; if (t.status === "occupied") activeTables++; } }
    const invIds = (await redis.get(KEYS.inventory) as string[]) || [];
    let lowStock = 0;
    for (const id of invIds) { const raw = await redis.get(KEYS.inventoryItem(id)); if (raw) { const i: InventoryItem = typeof raw === "string" ? JSON.parse(raw) : raw as InventoryItem; if (i.quantity <= i.minQuantity) lowStock++; } }
    const recent = allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
    return { todayOrders: todayOrders.length, todayRevenue, activeOrders, kitchenQueue, activeTables, totalTables: tableIds.length, totalOrders: allOrders.length, lowStock, recent };
  } catch { return { todayOrders: 0, todayRevenue: 0, activeOrders: 0, kitchenQueue: 0, activeTables: 0, totalTables: 0, totalOrders: 0, lowStock: 0, recent: [] }; }
}

function StatBox({ title, value, sub, color }: { title: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{ background: color, border: "2px solid #1a1a1a", borderRadius: 16, padding: "18px 20px" }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#6b6560", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: "#1a1a1a", lineHeight: 1, marginBottom: sub ? 6 : 0 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#a8a29e", fontWeight: 600, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default async function AdminDashboard() {
  const session = await getSession();
  const d = await getStats();
  const name = session?.email.split("@")[0] ?? "Admin";

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.02em" }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: "#a8a29e", fontWeight: 600, marginTop: 4 }}>Welcome back, {name}</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
        <StatBox title="Today's Orders" value={d.todayOrders} sub="+12% vs yesterday" color="#fff0f0" />
        <StatBox title="Today's Revenue" value={formatCurrency(d.todayRevenue)} sub="+8% vs yesterday" color="#edfaf5" />
        <StatBox title="Active Tables" value={`${d.activeTables}/${d.totalTables}`} color="#edf5ff" />
        <StatBox title="Kitchen Queue" value={d.kitchenQueue} color={d.kitchenQueue > 5 ? "#fff8ec" : "#faf9f7"} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <StatBox title="Active Orders" value={d.activeOrders} color="#f0eeff" />
        <StatBox title="Low Stock Items" value={d.lowStock} color={d.lowStock > 0 ? "#fff0f0" : "#faf9f7"} />
        <StatBox title="Total Orders" value={d.totalOrders} color="#faf9f7" />
        <StatBox title="Total Tables" value={d.totalTables} color="#edf5ff" />
      </div>

      {/* Charts + Recent */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
        <DashboardCharts />
        <RecentOrders orders={d.recent} />
      </div>
    </div>
  );
}
