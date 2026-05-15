import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set"
      );
    }

    redis = new Redis({ url, token });
  }
  return redis;
}

export const KEYS = {
  otp: (email: string) => `otp:${email}`,
  session: (token: string) => `session:${token}`,
  user: (email: string) => `user:${email}`,
  users: "users",
  orders: "orders",
  order: (id: string) => `order:${id}`,
  orderCounter: "order:counter",
  menuItems: "menu:items",
  menuItem: (id: string) => `menu:item:${id}`,
  categories: "menu:categories",
  category: (id: string) => `menu:category:${id}`,
  tables: "tables",
  table: (id: string) => `table:${id}`,
  floors: "floors",
  floor: (id: string) => `floor:${id}`,
  inventory: "inventory",
  inventoryItem: (id: string) => `inventory:item:${id}`,
  activityLogs: "activity:logs",
  activityLog: (id: string) => `activity:log:${id}`,
  notifications: "notifications",
  notification: (id: string) => `notification:${id}`,
  settings: "settings",
  staff: "staff",
  staffMember: (email: string) => `staff:${email}`,
};
