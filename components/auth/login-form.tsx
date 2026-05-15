"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, KeyRound, ChefHat, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        return;
      }

      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid OTP");
        return;
      }

      const role = data.user?.role;
      if (role === "main_admin" || role === "admin" || role === "staff") {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center">
            <ChefHat size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">Zunayed Restaurant</h1>
            <p className="text-xs text-stone-500 mt-0.5">Restaurant Management</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border-2 border-stone-200 rounded-2xl p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold mb-0.5">
              {step === "email" ? "Sign in" : "Enter OTP"}
            </h2>
            <p className="text-sm text-stone-500">
              {step === "email"
                ? "Enter your email to receive a login code"
                : `We sent a code to ${email}`}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl px-3 py-2.5 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={<Mail size={15} />}
                required
                autoFocus
              />
              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                Send code
                <ArrowRight size={16} />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <Input
                label="6-digit code"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                icon={<KeyRound size={15} />}
                required
                maxLength={6}
                autoFocus
              />
              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                Verify & sign in
                <ArrowRight size={16} />
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError("");
                }}
                className="text-sm text-stone-500 hover:text-black transition-colors w-full text-center"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-stone-400 mt-4">
          Customer ordering?{" "}
          <a href="/menu" className="underline hover:text-black transition-colors">
            View menu
          </a>
        </p>
      </motion.div>
    </div>
  );
}
