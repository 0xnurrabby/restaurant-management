import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { getRedis, KEYS } from "@/lib/redis";
import type { RestaurantSettings } from "@/lib/types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "customer") redirect("/menu");

  let restaurantName = "Zunayed";
  try {
    const redis = getRedis();
    const raw = await redis.get(KEYS.settings);
    if (raw) {
      const s: RestaurantSettings = typeof raw === "string" ? JSON.parse(raw) : (raw as RestaurantSettings);
      if (s.name) restaurantName = s.name;
    }
  } catch { /* use default */ }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#faf9f7" }}>
      <Sidebar session={session} restaurantName={restaurantName} />
      <main style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        {/* Mobile top padding */}
        <div style={{ padding: "24px" }} className="pt-20 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
