import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";
import type { Floor } from "@/lib/types";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    const redis = getRedis();
    const floorIds = (await redis.get(KEYS.floors) as string[]) || [];
    const floors: Floor[] = [];

    for (const id of floorIds) {
      const raw = await redis.get(KEYS.floor(id));
      if (raw) floors.push(typeof raw === "string" ? JSON.parse(raw) : raw as Floor);
    }

    floors.sort((a, b) => a.order - b.order);
    return NextResponse.json({ floors });
  } catch {
    return NextResponse.json({ error: "Failed to fetch floors" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const redis = getRedis();
    const body = await req.json();
    const id = generateId();
    const floorIds = (await redis.get(KEYS.floors) as string[]) || [];

    const floor: Floor = {
      id,
      name: body.name,
      order: floorIds.length + 1,
      tables: [],
    };

    await redis.set(KEYS.floor(id), JSON.stringify(floor));
    await redis.set(KEYS.floors, [...floorIds, id]);

    return NextResponse.json({ floor }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create floor" }, { status: 500 });
  }
}
