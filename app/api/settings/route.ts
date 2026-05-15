import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";
import { defaultSettings } from "@/lib/seed-data";

export async function GET() {
  try {
    const redis = getRedis();
    const raw = await redis.get(KEYS.settings);
    const settings = raw
      ? typeof raw === "string"
        ? JSON.parse(raw)
        : raw
      : defaultSettings;
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const redis = getRedis();
    const body = await req.json();
    const raw = await redis.get(KEYS.settings);
    const current = raw
      ? typeof raw === "string"
        ? JSON.parse(raw)
        : raw
      : defaultSettings;
    const updated = { ...current, ...body };
    await redis.set(KEYS.settings, JSON.stringify(updated));
    return NextResponse.json({ settings: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
