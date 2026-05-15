import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";
import type { ActivityLog } from "@/lib/types";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    const redis = getRedis();
    const logIds = (await redis.get(KEYS.activityLogs) as string[]) || [];
    const logs: ActivityLog[] = [];

    for (const id of logIds.slice(-100)) {
      const raw = await redis.get(KEYS.activityLog(id));
      if (raw) logs.push(typeof raw === "string" ? JSON.parse(raw) : raw as ActivityLog);
    }

    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const redis = getRedis();
    const body = await req.json();
    const id = generateId();

    const log: ActivityLog = {
      id,
      userId: body.userId,
      userEmail: body.userEmail,
      userName: body.userName,
      userRole: body.userRole,
      action: body.action,
      details: body.details,
      metadata: body.metadata,
      ip: body.ip,
      device: body.device,
      createdAt: new Date().toISOString(),
      status: body.status || "success",
    };

    await redis.setex(KEYS.activityLog(id), 30 * 24 * 60 * 60, JSON.stringify(log));
    const logIds = (await redis.get(KEYS.activityLogs) as string[]) || [];
    await redis.set(KEYS.activityLogs, [...logIds, id]);

    return NextResponse.json({ log }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 });
  }
}
