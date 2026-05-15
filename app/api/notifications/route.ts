import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";
import type { Notification } from "@/lib/types";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    const redis = getRedis();
    const notifIds = (await redis.get(KEYS.notifications) as string[]) || [];
    const notifications: Notification[] = [];

    for (const id of notifIds.slice(-50)) {
      const raw = await redis.get(KEYS.notification(id));
      if (raw) notifications.push(typeof raw === "string" ? JSON.parse(raw) : raw as Notification);
    }

    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ notifications });
  } catch {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const redis = getRedis();
    const body = await req.json();
    const id = generateId();

    const notification: Notification = {
      id,
      type: body.type,
      title: body.title,
      message: body.message,
      isRead: false,
      createdAt: new Date().toISOString(),
      metadata: body.metadata,
    };

    await redis.setex(KEYS.notification(id), 24 * 60 * 60, JSON.stringify(notification));
    const notifIds = (await redis.get(KEYS.notifications) as string[]) || [];
    await redis.set(KEYS.notifications, [...notifIds, id]);

    return NextResponse.json({ notification }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const redis = getRedis();
    const { id, isRead, markAll } = await req.json();

    if (markAll) {
      const notifIds = (await redis.get(KEYS.notifications) as string[]) || [];
      for (const nid of notifIds) {
        const raw = await redis.get(KEYS.notification(nid));
        if (raw) {
          const n = typeof raw === "string" ? JSON.parse(raw) : raw;
          n.isRead = true;
          await redis.set(KEYS.notification(nid), JSON.stringify(n));
        }
      }
      return NextResponse.json({ success: true });
    }

    if (id) {
      const raw = await redis.get(KEYS.notification(id));
      if (raw) {
        const n = typeof raw === "string" ? JSON.parse(raw) : raw;
        n.isRead = isRead;
        await redis.set(KEYS.notification(id), JSON.stringify(n));
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
