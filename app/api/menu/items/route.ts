import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";
import type { MenuItem } from "@/lib/types";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    const redis = getRedis();
    const itemIds = (await redis.get(KEYS.menuItems) as string[]) || [];
    const items: MenuItem[] = [];

    for (const id of itemIds) {
      const raw = await redis.get(KEYS.menuItem(id));
      if (raw) {
        items.push(typeof raw === "string" ? JSON.parse(raw) : raw as MenuItem);
      }
    }

    items.sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const redis = getRedis();
    const body = await req.json();
    const id = generateId();
    const now = new Date().toISOString();

    const item: MenuItem = {
      id,
      categoryId: body.categoryId,
      name: body.name,
      description: body.description || "",
      price: body.price,
      image: body.image,
      status: body.status || "available",
      isFeatured: body.isFeatured || false,
      isPopular: body.isPopular || false,
      tags: body.tags || [],
      addons: body.addons || [],
      preparationTime: body.preparationTime || 15,
      calories: body.calories,
      createdAt: now,
      updatedAt: now,
    };

    await redis.set(KEYS.menuItem(id), JSON.stringify(item));
    const itemIds = (await redis.get(KEYS.menuItems) as string[]) || [];
    await redis.set(KEYS.menuItems, [...itemIds, id]);

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
  }
}
