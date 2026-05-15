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
    const raw = await redis.get(KEYS.category(id));
    if (!raw) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    const cat = typeof raw === "string" ? JSON.parse(raw) : raw;
    const updated = { ...cat, ...body };
    await redis.set(KEYS.category(id), JSON.stringify(updated));
    return NextResponse.json({ category: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const redis = getRedis();
    await redis.del(KEYS.category(id));
    const catIds = (await redis.get(KEYS.categories) as string[]) || [];
    await redis.set(KEYS.categories, catIds.filter((cid: string) => cid !== id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
