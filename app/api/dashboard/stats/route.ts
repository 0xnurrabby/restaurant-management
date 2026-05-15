import { NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";
import type { Order, Table, InventoryItem } from "@/lib/types";

export async function GET() {
  try {
    const redis = getRedis();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get orders
    const orderIds = (await redis.get(KEYS.orders) as string[]) || [];
    let totalOrders = 0;
    let activeOrders = 0;
    let totalRevenue = 0;
    let todayRevenue = 0;
    let pendingKitchenOrders = 0;

    for (const id of orderIds) {
      const raw = await redis.get(KEYS.order(id));
      if (!raw) continue;
      const order: Order = typeof raw === "string" ? JSON.parse(raw) : raw as Order;
      totalOrders++;
      if (["pending", "preparing", "ready"].includes(order.status)) {
        activeOrders++;
      }
      if (order.status === "pending" || order.status === "preparing") {
        pendingKitchenOrders++;
      }
      if (order.isPaid) {
        totalRevenue += order.total;
        if (new Date(order.createdAt) >= today) {
          todayRevenue += order.total;
        }
      }
    }

    // Get tables
    const tableIds = (await redis.get(KEYS.tables) as string[]) || [];
    let activeTables = 0;
    const totalTables = tableIds.length;

    for (const id of tableIds) {
      const raw = await redis.get(KEYS.table(id));
      if (!raw) continue;
      const table: Table = typeof raw === "string" ? JSON.parse(raw) : raw as Table;
      if (table.status === "occupied") activeTables++;
    }

    // Get low stock items
    const inventoryIds = (await redis.get(KEYS.inventory) as string[]) || [];
    let lowStockItems = 0;

    for (const id of inventoryIds) {
      const raw = await redis.get(KEYS.inventoryItem(id));
      if (!raw) continue;
      const item: InventoryItem = typeof raw === "string" ? JSON.parse(raw) : raw as InventoryItem;
      if (item.quantity <= item.minQuantity) lowStockItems++;
    }

    return NextResponse.json({
      stats: {
        totalOrders,
        activeOrders,
        totalRevenue,
        todayRevenue,
        activeTables,
        totalTables,
        pendingKitchenOrders,
        lowStockItems,
        activeStaff: 0,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
