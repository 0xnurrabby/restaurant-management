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

    // Always re-seed settings
    await redis.set(KEYS.settings, JSON.stringify(defaultSettings));

    // Re-seed categories (clear old ones first)
    const oldCatIds = (await redis.get(KEYS.categories) as string[]) || [];
    for (const id of oldCatIds) await redis.del(KEYS.category(id));

    const catIds: string[] = [];
    for (const cat of seedCategories) {
      await redis.set(KEYS.category(cat.id), JSON.stringify(cat));
      catIds.push(cat.id);
    }
    await redis.set(KEYS.categories, catIds);

    // Re-seed menu items (clear old ones)
    const oldItemIds = (await redis.get(KEYS.menuItems) as string[]) || [];
    for (const id of oldItemIds) await redis.del(KEYS.menuItem(id));

    const menuItems = createSeedMenuItems(seedCategories);
    const itemIds: string[] = [];
    for (const item of menuItems) {
      await redis.set(KEYS.menuItem(item.id), JSON.stringify(item));
      itemIds.push(item.id);
    }
    await redis.set(KEYS.menuItems, itemIds);

    // Re-seed floors + tables (clear old)
    const oldFloorIds = (await redis.get(KEYS.floors) as string[]) || [];
    for (const id of oldFloorIds) await redis.del(KEYS.floor(id));
    const oldTableIds = (await redis.get(KEYS.tables) as string[]) || [];
    for (const id of oldTableIds) await redis.del(KEYS.table(id));

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

    // Re-seed inventory
    const oldInvIds = (await redis.get(KEYS.inventory) as string[]) || [];
    for (const id of oldInvIds) await redis.del(KEYS.inventoryItem(id));

    const invIds: string[] = [];
    for (const item of seedInventory) {
      await redis.set(KEYS.inventoryItem(item.id), JSON.stringify(item));
      invIds.push(item.id);
    }
    await redis.set(KEYS.inventory, invIds);

    return NextResponse.json({
      success: true,
      seeded: {
        categories: catIds.length,
        menuItems: itemIds.length,
        floors: floorIds.length,
        tables: tableIds.length,
        inventory: invIds.length,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
