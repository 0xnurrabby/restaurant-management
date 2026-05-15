import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";
import type { Order } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    const redis = getRedis();

    const raw = await redis.get(KEYS.order(id));
    if (!raw) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const order: Order = typeof raw === "string" ? JSON.parse(raw) : raw as Order;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    await redis.set(KEYS.order(id), JSON.stringify(order));

    // If completed/cancelled, free the table
    if (
      (status === "completed" || status === "cancelled") &&
      order.tableId
    ) {
      const rawTable = await redis.get(KEYS.table(order.tableId));
      if (rawTable) {
        const table = typeof rawTable === "string" ? JSON.parse(rawTable) : rawTable;
        table.status = "cleaning";
        table.currentOrderId = undefined;
        await redis.set(KEYS.table(order.tableId), JSON.stringify(table));
      }
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
