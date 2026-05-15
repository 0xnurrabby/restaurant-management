import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";
import type { Table } from "@/lib/types";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    const redis = getRedis();
    const tableIds = (await redis.get(KEYS.tables) as string[]) || [];
    const tables: Table[] = [];

    for (const id of tableIds) {
      const raw = await redis.get(KEYS.table(id));
      if (raw) tables.push(typeof raw === "string" ? JSON.parse(raw) : raw as Table);
    }

    return NextResponse.json({ tables });
  } catch {
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const redis = getRedis();
    const body = await req.json();
    const id = generateId();

    const table: Table = {
      id,
      number: body.number,
      floorId: body.floorId,
      capacity: body.capacity || 4,
      status: "available",
      x: body.x || 0,
      y: body.y || 0,
      shape: body.shape || "square",
    };

    await redis.set(KEYS.table(id), JSON.stringify(table));
    const tableIds = (await redis.get(KEYS.tables) as string[]) || [];
    await redis.set(KEYS.tables, [...tableIds, id]);

    return NextResponse.json({ table }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}
