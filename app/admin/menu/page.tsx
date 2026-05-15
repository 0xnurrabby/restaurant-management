import { getRedis, KEYS } from "@/lib/redis";
import type { MenuItem, Category } from "@/lib/types";
import { MenuClient } from "@/components/menu/menu-client";

async function getMenuData() {
  try {
    const redis = getRedis();

    const catIds = (await redis.get(KEYS.categories) as string[]) || [];
    const categories: Category[] = [];
    for (const id of catIds) {
      const raw = await redis.get(KEYS.category(id));
      if (raw) categories.push(typeof raw === "string" ? JSON.parse(raw) : raw as Category);
    }
    categories.sort((a, b) => a.order - b.order);

    const itemIds = (await redis.get(KEYS.menuItems) as string[]) || [];
    const items: MenuItem[] = [];
    for (const id of itemIds) {
      const raw = await redis.get(KEYS.menuItem(id));
      if (raw) items.push(typeof raw === "string" ? JSON.parse(raw) : raw as MenuItem);
    }

    return { categories, items };
  } catch {
    return { categories: [], items: [] };
  }
}

export default async function MenuPage() {
  const { categories, items } = await getMenuData();
  return <MenuClient initialCategories={categories} initialItems={items} />;
}
