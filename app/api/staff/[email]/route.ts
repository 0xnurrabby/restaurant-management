import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !["main_admin", "admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    const redis = getRedis();
    const body = await req.json();

    const raw = await redis.get(KEYS.user(decodedEmail));
    if (!raw) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const user = typeof raw === "string" ? JSON.parse(raw) : raw;
    const updated = { ...user, ...body };
    await redis.set(KEYS.user(decodedEmail), JSON.stringify(updated));

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update staff" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "main_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    const redis = getRedis();

    await redis.del(KEYS.user(decodedEmail));
    const emails = (await redis.get(KEYS.users) as string[]) || [];
    await redis.set(KEYS.users, emails.filter((e: string) => e !== decodedEmail));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete staff" }, { status: 500 });
  }
}
