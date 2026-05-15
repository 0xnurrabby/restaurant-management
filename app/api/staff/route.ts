import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";
import { getSession } from "@/lib/auth";
import type { User } from "@/lib/types";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !["main_admin", "admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const redis = getRedis();
    const emails = (await redis.get(KEYS.users) as string[]) || [];
    const staff: User[] = [];

    for (const email of emails) {
      const raw = await redis.get(KEYS.user(email));
      if (raw) {
        const user = typeof raw === "string" ? JSON.parse(raw) : raw as User;
        if (user.role !== "customer") staff.push(user);
      }
    }

    return NextResponse.json({ staff });
  } catch {
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "main_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const redis = getRedis();
    const body = await req.json();

    const existingRaw = await redis.get(KEYS.user(body.email));
    if (existingRaw) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const user: User = {
      id: generateId(),
      email: body.email,
      name: body.name,
      role: body.role || "staff",
      permissions: body.permissions || [],
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    await redis.set(KEYS.user(body.email), JSON.stringify(user));
    const emails = (await redis.get(KEYS.users) as string[]) || [];
    if (!emails.includes(body.email)) {
      await redis.set(KEYS.users, [...emails, body.email]);
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create staff member" }, { status: 500 });
  }
}
