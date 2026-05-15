import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getRedis, KEYS } from "@/lib/redis";
import { generateOTP } from "@/lib/utils";
import { isMainAdmin } from "@/lib/auth";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const redis = getRedis();

    // Check if user exists or is main admin
    const mainAdmin = isMainAdmin(email);
    if (!mainAdmin) {
      const rawUser = await redis.get(KEYS.user(email));
      if (!rawUser) {
        return NextResponse.json(
          { error: "No account found with this email" },
          { status: 404 }
        );
      }
    }

    const otp = generateOTP();
    await redis.setex(KEYS.otp(email), 10 * 60, otp); // 10 min expiry

    // Send OTP via Resend
    const settings = await redis.get(KEYS.settings);
    const restaurantName =
      (settings as { name?: string })?.name || "Restaurant";

    const resend = getResend();
    await resend.emails.send({
      from: `${restaurantName} <noreply@resend.dev>`,
      to: email,
      subject: `Your Login OTP - ${restaurantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 2px solid #000; border-radius: 12px;">
          <h2 style="margin: 0 0 16px; font-size: 24px;">${restaurantName}</h2>
          <p style="color: #555; margin: 0 0 24px;">Your one-time login code is:</p>
          <div style="background: #f5f5f5; border: 2px solid #000; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="color: #888; font-size: 14px; margin: 0;">This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
