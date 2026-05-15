import { getRedis, KEYS } from "@/lib/redis";
import type { Order } from "@/lib/types";
import { KDSClient } from "@/components/kds/kds-client";

async function getKitchenOrders(): Promise<Order[]> {
  try {
    const redis = getRedis();
    const orderIds = (await redis.get(KEYS.orders) as string[]) || [];
    const orders: Order[] = [];
    for (const id of orderIds) {
      const raw = await redis.get(KEYS.order(id));
      if (raw) {
        const order: Order = typeof raw === "string" ? JSON.parse(raw) : raw as Order;
        if (["pending", "preparing"].includes(order.status)) {
          orders.push(order);
        }
      }
    }
    return orders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch {
    return [];
  }
}

export default async function KDSPage() {
  const orders = await getKitchenOrders();
  return <KDSClient initialOrders={orders} />;
}
