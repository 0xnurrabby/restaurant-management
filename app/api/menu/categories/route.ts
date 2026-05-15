import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";
import type { Category } from "@/lib/types";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    const redis = getRedis();
    const catIds = (await redis.get(KEYS.categories) as string[]) || [];
    const categories: Category[] = [];

    for (const id of catIds) {
      const raw = await redis.get(KEYS.category(id));
      if (raw) {
        categories.push(typeof raw === "string" ? JSON.parse(raw) : raw as Category);
      }
    }

    categories.sort((a, b) => a.order - b.order);
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const redis = getRedis();
    const body = await req.json();
    const id = generateId();

    const catIds = (await redis.get(KEYS.categories) as string[]) || [];
    const category: Category = {
      id,
      name: body.name,
      description: body.description || "",
      image: body.image,
      order: catIds.length + 1,
      isActive: true,
      itemCount: 0,
    };

    await redis.set(KEYS.category(id), JSON.stringify(category));
    await redis.set(KEYS.categories, [...catIds, id]);

    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
