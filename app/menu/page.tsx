import { getRedis, KEYS } from "@/lib/redis";
import type { MenuItem, Category, RestaurantSettings } from "@/lib/types";
import { CustomerMenuClient } from "@/components/customer/customer-menu-client";
import { defaultSettings, seedCategories, createSeedMenuItems, createSeedFloors, seedInventory } from "@/lib/seed-data";

async function getMenuData() {
  try {
    const redis = getRedis();

    // Auto-seed if empty
    const existingIds = (await redis.get(KEYS.menuItems) as string[]) || [];
    if (existingIds.length === 0) {
      // Seed categories
      const catIds: string[] = [];
      for (const cat of seedCategories) {
        await redis.set(KEYS.category(cat.id), JSON.stringify(cat));
        catIds.push(cat.id);
      }
      await redis.set(KEYS.categories, catIds);

      // Seed menu items
      const menuItems = createSeedMenuItems(seedCategories);
      const itemIds: string[] = [];
      for (const item of menuItems) {
        await redis.set(KEYS.menuItem(item.id), JSON.stringify(item));
        itemIds.push(item.id);
      }
      await redis.set(KEYS.menuItems, itemIds);

      // Seed floors + tables
      const { floors, tables } = createSeedFloors();
      const floorIds: string[] = [];
      for (const floor of floors) { await redis.set(KEYS.floor(floor.id), JSON.stringify(floor)); floorIds.push(floor.id); }
      await redis.set(KEYS.floors, floorIds);
      const tableIds: string[] = [];
      for (const table of tables) { await redis.set(KEYS.table(table.id), JSON.stringify(table)); tableIds.push(table.id); }
      await redis.set(KEYS.tables, tableIds);

      // Seed inventory
      const invIds: string[] = [];
      for (const item of seedInventory) { await redis.set(KEYS.inventoryItem(item.id), JSON.stringify(item)); invIds.push(item.id); }
      await redis.set(KEYS.inventory, invIds);

      // Seed settings
      await redis.set(KEYS.settings, JSON.stringify(defaultSettings));
    }

    // Fetch categories
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

    // Fetch items
    const itemIds = (await redis.get(KEYS.menuItems) as string[]) || [];
    const items: MenuItem[] = [];
    for (const id of itemIds) {
      const raw = await redis.get(KEYS.menuItem(id));
      if (raw) {
        const item: MenuItem = typeof raw === "string" ? JSON.parse(raw) : raw as MenuItem;
        if (item.status === "available") items.push(item);
      }
    }

    // Fetch settings
    const rawSettings = await redis.get(KEYS.settings);
    const settings: RestaurantSettings = rawSettings
      ? typeof rawSettings === "string" ? JSON.parse(rawSettings) : (rawSettings as RestaurantSettings)
      : defaultSettings;

    return { categories, items, settings };
  } catch (e) {
    console.error("Menu data error:", e);
    return { categories: [], items: [], settings: defaultSettings };
  }
}

export default async function CustomerMenuPage() {
  const { categories, items, settings } = await getMenuData();
  return <CustomerMenuClient categories={categories} items={items} settings={settings} />;
}
