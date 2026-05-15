import { getRedis, KEYS } from "@/lib/redis";
import type { Notification } from "@/lib/types";
import { NotificationsClient } from "@/components/notifications/notifications-client";

async function getNotifications(): Promise<Notification[]> {
  try {
    const redis = getRedis();
    const ids = (await redis.get(KEYS.notifications) as string[]) || [];
    const notifications: Notification[] = [];
    for (const id of ids.slice(-50)) {
      const raw = await redis.get(KEYS.notification(id));
      if (raw) notifications.push(typeof raw === "string" ? JSON.parse(raw) : raw as Notification);
    }
    return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  return <NotificationsClient initialNotifications={notifications} />;
}
