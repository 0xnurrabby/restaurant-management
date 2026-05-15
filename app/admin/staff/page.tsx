import { getRedis, KEYS } from "@/lib/redis";
import type { User } from "@/lib/types";
import { StaffClient } from "@/components/staff/staff-client";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getStaff(): Promise<User[]> {
  try {
    const redis = getRedis();
    const emails = (await redis.get(KEYS.users) as string[]) || [];
    const staff: User[] = [];
    for (const email of emails) {
      const raw = await redis.get(KEYS.user(email));
      if (raw) {
        const user: User = typeof raw === "string" ? JSON.parse(raw) : raw as User;
        staff.push(user);
      }
    }
    return staff;
  } catch {
    return [];
  }
}

export default async function StaffPage() {
  const session = await getSession();
  if (!session || !["main_admin", "admin"].includes(session.role)) {
    redirect("/admin");
  }
  const staff = await getStaff();
  return <StaffClient initialStaff={staff} currentRole={session.role} />;
}
