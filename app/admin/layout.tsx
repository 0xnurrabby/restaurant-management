import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { getRedis, KEYS } from "@/lib/redis";
import type { RestaurantSettings } from "@/lib/types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "customer") redirect("/menu");

  let restaurantName = "Zunayed Restaurant";
  try {
    const redis = getRedis();
    const raw = await redis.get(KEYS.settings);
    if (raw) {
      const s: RestaurantSettings = typeof raw === "string" ? JSON.parse(raw) : (raw as RestaurantSettings);
      if (s.name) restaurantName = s.name;
    }
  } catch { /* use default */ }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#faf9f7" }}>
      {/* Sidebar — fixed height, scrollable nav */}
      <Sidebar session={session} restaurantName={restaurantName} />
      {/* Main content — scrollable */}
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto", overflowX: "hidden" }}>
        <div style={{ padding: "28px 28px", paddingTop: 28 }} className="lg:pt-7 pt-20">
          {children}
        </div>
      </main>
    </div>
  );
}
