import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";
import { getSession } from "@/lib/auth";
import type { Order } from "@/lib/types";
import { generateId } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const redis = getRedis();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const orderIds = (await redis.get(KEYS.orders) as string[]) || [];
    const orders: Order[] = [];

    for (const id of orderIds.slice(-100)) {
      const raw = await redis.get(KEYS.order(id));
      if (raw) {
        const order = typeof raw === "string" ? JSON.parse(raw) : raw as Order;
        if (!status || order.status === status) {
          orders.push(order);
        }
      }
    }

    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ orders: orders.slice(0, limit) });
  } catch (error) {
    console.error("GET orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const redis = getRedis();
    const body = await req.json();

    const counter = await redis.incr(KEYS.orderCounter);
    const orderId = generateId();
    const now = new Date().toISOString();

    const order: Order = {
      id: orderId,
      orderNumber: counter,
      tableId: body.tableId,
      tableNumber: body.tableNumber,
      status: "pending",
      type: body.type || "dine_in",
      items: body.items || [],
      subtotal: body.subtotal || 0,
      tax: body.tax || 0,
      discount: body.discount || 0,
      total: body.total || 0,
      notes: body.notes,
      customerName: body.customerName,
      createdAt: now,
      updatedAt: now,
      isPaid: false,
    };

    await redis.set(KEYS.order(orderId), JSON.stringify(order));
    const orderIds = (await redis.get(KEYS.orders) as string[]) || [];
    await redis.set(KEYS.orders, [...orderIds, orderId]);

    // Update table status if dine-in
    if (order.tableId) {
      const rawTable = await redis.get(KEYS.table(order.tableId));
      if (rawTable) {
        const table = typeof rawTable === "string" ? JSON.parse(rawTable) : rawTable;
        table.status = "occupied";
        table.currentOrderId = orderId;
        await redis.set(KEYS.table(order.tableId), JSON.stringify(table));
      }
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("POST order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
