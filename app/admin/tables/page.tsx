import { getRedis, KEYS } from "@/lib/redis";
import type { Table, Floor } from "@/lib/types";
import { TablesClient } from "@/components/tables/tables-client";

async function getTablesData() {
  try {
    const redis = getRedis();

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
    floors.sort((a, b) => a.order - b.order);

    return { tables, floors };
  } catch {
    return { tables: [], floors: [] };
  }
}

export default async function TablesPage() {
  const { tables, floors } = await getTablesData();
  return <TablesClient initialTables={tables} initialFloors={floors} />;
}
