import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";
import { isMainAdmin, createSession } from "@/lib/auth";
import type { User } from "@/lib/types";
import { generateId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP required" }, { status: 400 });
    }

    const redis = getRedis();
    const otpKey = KEYS.otp(email);
    const storedRaw = await redis.get(otpKey);

    console.log(`Verify OTP for ${email}: provided=${otp}, stored=${storedRaw}, key=${otpKey}`);

    // Normalize both to string for comparison
    const storedOtp = storedRaw !== null ? String(storedRaw) : null;
    const providedOtp = String(otp).trim();

    if (!storedOtp) {
      return NextResponse.json({ error: "OTP expired. Please request a new code." }, { status: 401 });
    }

    if (storedOtp !== providedOtp) {
      return NextResponse.json({ error: `Invalid OTP. Please check your email and try again.` }, { status: 401 });
    }

    // Delete OTP after successful verification
    await redis.del(otpKey);

    let user: User;
    const mainAdmin = isMainAdmin(email);

    if (mainAdmin) {
      const rawUser = await redis.get(KEYS.user(email));
      if (rawUser) {
        user = typeof rawUser === "string" ? JSON.parse(rawUser) : (rawUser as User);
        user.role = "main_admin";
        user.permissions = [];
      } else {
        user = {
          id: generateId(),
          email,
          name: email.split("@")[0],
          role: "main_admin",
          permissions: [],
          createdAt: new Date().toISOString(),
          isActive: true,
        };
        await redis.set(KEYS.user(email), JSON.stringify(user));
        const users = (await redis.get(KEYS.users) as string[]) || [];
        if (!users.includes(email)) {
          await redis.set(KEYS.users, [...users, email]);
        }
      }
    } else {
      const rawUser = await redis.get(KEYS.user(email));
      if (!rawUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      user = typeof rawUser === "string" ? JSON.parse(rawUser) : (rawUser as User);
      if (!user.isActive) {
        return NextResponse.json({ error: "Account is disabled" }, { status: 403 });
      }
    }

    user.lastLogin = new Date().toISOString();
    await redis.set(KEYS.user(email), JSON.stringify(user));

    const token = await createSession(email, user.role, user.permissions);

    const response = NextResponse.json({
      success: true,
      user: { email: user.email, name: user.name, role: user.role, permissions: user.permissions },
    });

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
