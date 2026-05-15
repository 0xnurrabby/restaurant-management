"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, KeyRound, ArrowRight, ChefHat, Sparkles } from "lucide-react";
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
      if (!res.ok) { setError(data.error || "Failed to send OTP"); return; }
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
      if (!res.ok) { setError(data.error || "Invalid OTP"); return; }
      const role = data.user?.role;
      if (role === "main_admin" || role === "admin" || role === "staff") {
        router.push("/admin");
      } else {
        router.push("/menu");
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
      {/* Background dots pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, #d4cdc3 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-12 h-12 bg-[#ff6b6b] border-2 border-[#1a1a1a] rounded-2xl flex items-center justify-center">
            <ChefHat size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[#1a1a1a] leading-none">
              Zunayed Restaurant
            </h1>
            <p className="text-xs text-[#a8a29e] mt-0.5 font-medium">Staff & Admin Portal</p>
          </div>
        </motion.div>

        {/* Card */}
        <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl overflow-hidden">
          {/* Card top accent bar */}
          <div className="h-1.5 bg-[#ff6b6b]" />

          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === "email" ? (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-5">
                    <h2 className="text-lg font-black text-[#1a1a1a] mb-1">Welcome back</h2>
                    <p className="text-sm text-[#a8a29e]">Enter your email to receive a login code</p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#ffe4e4] border-2 border-[#ff6b6b] rounded-xl px-3 py-2.5 mb-4"
                    >
                      <p className="text-[#cc2b2b] text-sm font-medium">{error}</p>
                    </motion.div>
                  )}

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
                    <Button type="submit" loading={loading} className="w-full" size="lg">
                      Send login code
                      <ArrowRight size={15} />
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-5">
                    <div className="w-10 h-10 bg-[#d4f5ec] border-2 border-[#1a1a1a] rounded-xl flex items-center justify-center mb-3">
                      <Sparkles size={18} className="text-[#1a7a5e]" />
                    </div>
                    <h2 className="text-lg font-black text-[#1a1a1a] mb-1">Check your email</h2>
                    <p className="text-sm text-[#a8a29e]">
                      We sent a 6-digit code to{" "}
                      <span className="text-[#1a1a1a] font-semibold">{email}</span>
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#ffe4e4] border-2 border-[#ff6b6b] rounded-xl px-3 py-2.5 mb-4"
                    >
                      <p className="text-[#cc2b2b] text-sm font-medium">{error}</p>
                    </motion.div>
                  )}

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
                    <Button type="submit" loading={loading} className="w-full" size="lg" variant="mint">
                      Verify & sign in
                      <ArrowRight size={15} />
                    </Button>
                    <button
                      type="button"
                      onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                      className="text-xs text-[#a8a29e] hover:text-[#1a1a1a] transition-colors w-full text-center font-medium"
                    >
                      Use a different email
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-xs text-[#a8a29e] mt-4">
          Customer ordering?{" "}
          <a href="/menu" className="text-[#1a1a1a] font-semibold underline underline-offset-2 hover:text-[#ff6b6b] transition-colors">
            View menu
          </a>
        </p>
      </motion.div>
    </div>
  );
}
