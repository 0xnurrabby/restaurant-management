import { NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";
import {
  seedCategories,
  createSeedMenuItems,
  createSeedFloors,
  seedInventory,
  defaultSettings,
} from "@/lib/seed-data";

export async function POST() {
  try {
    const redis = getRedis();

    // Seed settings
    await redis.set(KEYS.settings, JSON.stringify(defaultSettings));

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

    // Seed floors and tables
    const { floors, tables } = createSeedFloors();
    const floorIds: string[] = [];
    for (const floor of floors) {
      await redis.set(KEYS.floor(floor.id), JSON.stringify(floor));
      floorIds.push(floor.id);
    }
    await redis.set(KEYS.floors, floorIds);

    const tableIds: string[] = [];
    for (const table of tables) {
      await redis.set(KEYS.table(table.id), JSON.stringify(table));
      tableIds.push(table.id);
    }
    await redis.set(KEYS.tables, tableIds);

    // Seed inventory
    const inventoryIds: string[] = [];
    for (const item of seedInventory) {
      await redis.set(KEYS.inventoryItem(item.id), JSON.stringify(item));
      inventoryIds.push(item.id);
    }
    await redis.set(KEYS.inventory, inventoryIds);

    return NextResponse.json({
      success: true,
      seeded: {
        categories: catIds.length,
        menuItems: itemIds.length,
        floors: floorIds.length,
        tables: tableIds.length,
        inventory: inventoryIds.length,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
