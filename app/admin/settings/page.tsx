import { getRedis, KEYS } from "@/lib/redis";
import type { RestaurantSettings } from "@/lib/types";
import { SettingsClient } from "@/components/settings/settings-client";
import { defaultSettings } from "@/lib/seed-data";

async function getSettings(): Promise<RestaurantSettings> {
  try {
    const redis = getRedis();
    const raw = await redis.get(KEYS.settings);
    if (raw) return typeof raw === "string" ? JSON.parse(raw) : raw as RestaurantSettings;
    return defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export default async function SettingsPage() {
  const settings = await getSettings();
  return <SettingsClient initialSettings={settings} />;
}
