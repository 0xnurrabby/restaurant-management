import { getRedis, KEYS } from "@/lib/redis";
import type { Order } from "@/lib/types";
import { OrdersClient } from "@/components/dashboard/orders-client";

async function getOrders(): Promise<Order[]> {
  try {
    const redis = getRedis();
    const orderIds = (await redis.get(KEYS.orders) as string[]) || [];
    const orders: Order[] = [];
    for (const id of orderIds.slice(-100)) {
      const raw = await redis.get(KEYS.order(id));
      if (raw) orders.push(typeof raw === "string" ? JSON.parse(raw) : raw as Order);
    }
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export default async function OrdersPage() {
  const orders = await getOrders();
  return <OrdersClient initialOrders={orders} />;
}
