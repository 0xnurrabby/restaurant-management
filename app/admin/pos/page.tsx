import { getRedis, KEYS } from "@/lib/redis";
import type { MenuItem, Category, Table, Floor } from "@/lib/types";
import { POSClient } from "@/components/pos/pos-client";

async function getPOSData() {
  try {
    const redis = getRedis();

    const itemIds = (await redis.get(KEYS.menuItems) as string[]) || [];
    const items: MenuItem[] = [];
    for (const id of itemIds) {
      const raw = await redis.get(KEYS.menuItem(id));
      if (raw) {
        const item: MenuItem = typeof raw === "string" ? JSON.parse(raw) : raw as MenuItem;
        if (item.status === "available") items.push(item);
      }
    }

    const catIds = (await redis.get(KEYS.categories) as string[]) || [];
    const categories: Category[] = [];
    for (const id of catIds) {
      const raw = await redis.get(KEYS.category(id));
      if (raw) {
        const cat: Category = typeof raw === "string" ? JSON.parse(raw) : raw as Category;
        if (cat.isActive) categories.push(cat);
      }
    }
    categories.sort((a, b) => a.order - b.order);

    const tableIds = (await redis.get(KEYS.tables) as string[]) || [];
    const tables: Table[] = [];
    for (const id of tableIds) {
      const raw = await redis.get(KEYS.table(id));
      if (raw) tables.push(typeof raw === "string" ? JSON.parse(raw) : raw as Table);
    }

    const floorIds = (await redis.get(KEYS.floors) as string[]) || [];
    const floors: Floor[] = [];
    for (const id of floorIds) {
      const raw = await redis.get(KEYS.floor(id));
      if (raw) floors.push(typeof raw === "string" ? JSON.parse(raw) : raw as Floor);
    }

    return { items, categories, tables, floors };
  } catch {
    return { items: [], categories: [], tables: [], floors: [] };
  }
}

export default async function POSPage() {
  const data = await getPOSData();
  return <POSClient {...data} />;
}
