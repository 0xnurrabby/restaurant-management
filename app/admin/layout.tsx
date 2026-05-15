import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { NavProgress } from "@/components/layout/nav-progress";
import { PageTransition } from "@/components/layout/page-transition";
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
      <NavProgress />
      <Sidebar session={session} restaurantName={restaurantName} />
      <main
        className="admin-main-content"
        style={{ flex: 1, minWidth: 0, overflowY: "auto", overflowX: "hidden", padding: "28px" }}
      >
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  );
}
