import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";
import type { Order } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const redis = getRedis();
    const raw = await redis.get(KEYS.order(id));
    if (!raw) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const order = typeof raw === "string" ? JSON.parse(raw) : raw;
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const redis = getRedis();
    const body = await req.json();

    const raw = await redis.get(KEYS.order(id));
    if (!raw) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const order: Order = typeof raw === "string" ? JSON.parse(raw) : raw as Order;
    const updated = { ...order, ...body, updatedAt: new Date().toISOString() };
    await redis.set(KEYS.order(id), JSON.stringify(updated));

    return NextResponse.json({ order: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const redis = getRedis();
    await redis.del(KEYS.order(id));
    const orderIds = (await redis.get(KEYS.orders) as string[]) || [];
    await redis.set(KEYS.orders, orderIds.filter((oid: string) => oid !== id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
