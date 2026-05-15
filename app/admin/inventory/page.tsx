import { getRedis, KEYS } from "@/lib/redis";
import type { InventoryItem } from "@/lib/types";
import { InventoryClient } from "@/components/inventory/inventory-client";

async function getInventory(): Promise<InventoryItem[]> {
  try {
    const redis = getRedis();
    const ids = (await redis.get(KEYS.inventory) as string[]) || [];
    const items: InventoryItem[] = [];
    for (const id of ids) {
      const raw = await redis.get(KEYS.inventoryItem(id));
      if (raw) items.push(typeof raw === "string" ? JSON.parse(raw) : raw as InventoryItem);
    }
    return items;
  } catch {
    return [];
  }
}

export default async function InventoryPage() {
  const items = await getInventory();
  return <InventoryClient initialItems={items} />;
}
