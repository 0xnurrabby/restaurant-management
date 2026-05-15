import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";
import type { InventoryItem } from "@/lib/types";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    const redis = getRedis();
    const itemIds = (await redis.get(KEYS.inventory) as string[]) || [];
    const items: InventoryItem[] = [];

    for (const id of itemIds) {
      const raw = await redis.get(KEYS.inventoryItem(id));
      if (raw) items.push(typeof raw === "string" ? JSON.parse(raw) : raw as InventoryItem);
    }

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const redis = getRedis();
    const body = await req.json();
    const id = generateId();
    const now = new Date().toISOString();

    const item: InventoryItem = {
      id,
      name: body.name,
      unit: body.unit,
      quantity: body.quantity || 0,
      minQuantity: body.minQuantity || 5,
      cost: body.cost || 0,
      category: body.category || "General",
      supplier: body.supplier,
      createdAt: now,
      updatedAt: now,
    };

    await redis.set(KEYS.inventoryItem(id), JSON.stringify(item));
    const itemIds = (await redis.get(KEYS.inventory) as string[]) || [];
    await redis.set(KEYS.inventory, [...itemIds, id]);

    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 });
  }
}
