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

    const otp = generateOTP(); // always a 6-digit string

    // Store as string explicitly, 10 minutes TTL
    const otpKey = KEYS.otp(email);
    await redis.set(otpKey, otp, { ex: 600 });

    // Verify it stored correctly
    const stored = await redis.get(otpKey);
    console.log(`OTP stored for ${email}: key=${otpKey}, otp=${otp}, stored=${stored}`);

    // Get restaurant name
    let restaurantName = "Zunayed Restaurant";
    try {
      const settings = await redis.get(KEYS.settings);
      if (settings) {
        const parsed = typeof settings === "string" ? JSON.parse(settings) : (settings as { name?: string });
        if (parsed?.name) restaurantName = parsed.name;
      }
    } catch { /* use default */ }

    const resend = getResend();
    await resend.emails.send({
      from: "Zunayed Restaurant <onboarding@resend.dev>",
      to: email,
      subject: `Your Login Code: ${otp}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:32px 24px;background:#fff;border:2px solid #1a1a1a;border-radius:16px;">
          <div style="width:48px;height:48px;background:#ff6b6b;border:2px solid #1a1a1a;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <span style="color:white;font-size:22px;">🍽️</span>
          </div>
          <h2 style="margin:0 0 6px;font-size:20px;font-weight:900;color:#1a1a1a;">${restaurantName}</h2>
          <p style="color:#a8a29e;margin:0 0 24px;font-size:13px;font-weight:600;">Staff & Admin Portal</p>
          <p style="color:#1a1a1a;margin:0 0 12px;font-size:14px;">Your one-time login code:</p>
          <div style="background:#faf9f7;border:2px solid #1a1a1a;border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;">
            <span style="font-size:44px;font-weight:900;letter-spacing:12px;color:#1a1a1a;font-family:monospace;">${otp}</span>
          </div>
          <p style="color:#a8a29e;font-size:12px;margin:0;">Expires in <strong style="color:#ff6b6b;">10 minutes</strong>. Do not share this code with anyone.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
