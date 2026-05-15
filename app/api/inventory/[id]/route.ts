import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const redis = getRedis();
    const body = await req.json();
    const raw = await redis.get(KEYS.inventoryItem(id));
    if (!raw) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    const item = typeof raw === "string" ? JSON.parse(raw) : raw;
    const updated = { ...item, ...body, updatedAt: new Date().toISOString() };
    await redis.set(KEYS.inventoryItem(id), JSON.stringify(updated));
    return NextResponse.json({ item: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const redis = getRedis();
    await redis.del(KEYS.inventoryItem(id));
    const itemIds = (await redis.get(KEYS.inventory) as string[]) || [];
    await redis.set(KEYS.inventory, itemIds.filter((iid: string) => iid !== id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
