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
    const raw = await redis.get(KEYS.table(id));
    if (!raw) return NextResponse.json({ error: "Table not found" }, { status: 404 });
    const table = typeof raw === "string" ? JSON.parse(raw) : raw;
    const updated = { ...table, ...body };
    await redis.set(KEYS.table(id), JSON.stringify(updated));
    return NextResponse.json({ table: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 });
  }
}
