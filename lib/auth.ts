import { cookies } from "next/headers";
import { getRedis, KEYS } from "./redis";
import type { Session, UserRole, StaffPermission } from "./types";
import { generateId } from "./utils";

export function isMainAdmin(email: string): boolean {
  const adminEmails = process.env.MAIN_ADMIN_EMAILS || "";
  return adminEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(email.toLowerCase());
}

export async function createSession(
  email: string,
  role: UserRole,
  permissions: StaffPermission[]
): Promise<string> {
  const redis = getRedis();
  const token = generateId();
  const session: Session = {
    id: token,
    userId: email,
    email,
    role,
    permissions,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  await redis.setex(KEYS.session(token), 7 * 24 * 60 * 60, JSON.stringify(session));
  return token;
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (!token) return null;

    const redis = getRedis();
    const raw = await redis.get(KEYS.session(token));
    if (!raw) return null;

    const session = typeof raw === "string" ? JSON.parse(raw) : raw as Session;
    if (new Date(session.expiresAt) < new Date()) {
      await redis.del(KEYS.session(token));
      return null;
    }
    return session as Session;
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (token) {
      const redis = getRedis();
      await redis.del(KEYS.session(token));
    }
  } catch {
    // ignore
  }
}

export function hasPermission(
  session: Session | null,
  permission: StaffPermission
): boolean {
  if (!session) return false;
  if (session.role === "main_admin") return true;
  if (session.role === "admin") return true;
  return session.permissions.includes(permission);
}
