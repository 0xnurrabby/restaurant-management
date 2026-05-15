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
    // Store OTP — expires in 10 minutes
    await redis.setex(KEYS.otp(email), 600, otp);

    // Get restaurant name from settings (fallback gracefully)
    let restaurantName = "Zunayed Restaurant";
    try {
      const settings = await redis.get(KEYS.settings);
      if (settings) {
        const parsed = typeof settings === "string" ? JSON.parse(settings) : settings as { name?: string };
        if (parsed?.name) restaurantName = parsed.name;
      }
    } catch {
      // use default name
    }

    const resend = getResend();
    await resend.emails.send({
      from: `${restaurantName} <onboarding@resend.dev>`,
      to: email,
      subject: `Your Login OTP — ${otp}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 420px; margin: 0 auto; padding: 32px 24px; background: #fff; border: 2px solid #000; border-radius: 16px;">
          <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #000;">${restaurantName}</h2>
          <p style="color: #666; margin: 0 0 28px; font-size: 14px;">Staff & Admin Portal</p>
          <p style="color: #333; margin: 0 0 16px; font-size: 15px;">Your one-time login code:</p>
          <div style="background: #f5f5f4; border: 2px solid #000; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 40px; font-weight: 900; letter-spacing: 10px; color: #000; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 13px; margin: 0;">Expires in <strong>10 minutes</strong>. Do not share this code.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "OTP sent to " + email });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
