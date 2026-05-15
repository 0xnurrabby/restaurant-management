import { getRedis, KEYS } from "@/lib/redis";
import type { MenuItem, Category, RestaurantSettings } from "@/lib/types";
import { CustomerMenuClient } from "@/components/customer/customer-menu-client";
import { defaultSettings } from "@/lib/seed-data";

async function getMenuData() {
  try {
    const redis = getRedis();

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

    const itemIds = (await redis.get(KEYS.menuItems) as string[]) || [];
    const items: MenuItem[] = [];
    for (const id of itemIds) {
      const raw = await redis.get(KEYS.menuItem(id));
      if (raw) {
        const item: MenuItem = typeof raw === "string" ? JSON.parse(raw) : raw as MenuItem;
        if (item.status === "available") items.push(item);
      }
    }

    const rawSettings = await redis.get(KEYS.settings);
    const settings: RestaurantSettings = rawSettings
      ? typeof rawSettings === "string"
        ? JSON.parse(rawSettings)
        : (rawSettings as RestaurantSettings)
      : defaultSettings;

    return { categories, items, settings };
  } catch {
    return { categories: [], items: [], settings: defaultSettings };
  }
}

export default async function CustomerMenuPage() {
  const { categories, items, settings } = await getMenuData();
  return <CustomerMenuClient categories={categories} items={items} settings={settings} />;
}
