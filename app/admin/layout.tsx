import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { getRedis, KEYS } from "@/lib/redis";
import type { RestaurantSettings } from "@/lib/types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "customer") redirect("/menu");

  let restaurantName = "Zunayed";
  try {
    const redis = getRedis();
    const raw = await redis.get(KEYS.settings);
    if (raw) {
      const settings: RestaurantSettings =
        typeof raw === "string" ? JSON.parse(raw) : (raw as RestaurantSettings);
      restaurantName = settings.name;
    }
  } catch {
    // use default
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar session={session} restaurantName={restaurantName} />
      <main className="flex-1 min-w-0 lg:p-6 p-4 pt-16 lg:pt-6 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
