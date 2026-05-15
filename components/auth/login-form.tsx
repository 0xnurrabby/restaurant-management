"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send OTP"); return; }
      setStep("otp");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid OTP"); return; }
      const role = data.user?.role;
      if (role === "main_admin" || role === "admin" || role === "staff") router.push("/admin");
      else router.push("/menu");
      router.refresh();
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f7", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>

      {/* Dot background */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle, #d4cdc3 1.2px, transparent 1.2px)", backgroundSize: "24px 24px", opacity: 0.35, pointerEvents: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}
      >

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: "#ff6b6b", border: "2px solid #1a1a1a", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
            🍽️
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20, color: "#1a1a1a", lineHeight: 1.1 }}>Zunayed Restaurant</div>
            <div style={{ fontSize: 12, color: "#a8a29e", fontWeight: 600, marginTop: 3 }}>Staff &amp; Admin Portal</div>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 20, overflow: "hidden" }}>
          {/* Top accent */}
          <div style={{ height: 4, background: "#ff6b6b" }} />

          <div style={{ padding: 32 }}>
            <AnimatePresence mode="wait">
              {step === "email" ? (
                <motion.div key="email" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 900, color: "#1a1a1a", marginBottom: 6, letterSpacing: "-0.02em" }}>Welcome back</h2>
                  <p style={{ fontSize: 14, color: "#a8a29e", fontWeight: 500, marginBottom: 28 }}>Enter your email to receive a one-time login code</p>

                  {error && (
                    <div style={{ background: "#fff0f0", border: "2px solid #ff6b6b", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
                      <p style={{ color: "#cc2b2b", fontSize: 13, fontWeight: 600 }}>{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSendOtp}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoFocus
                        style={{ width: "100%", padding: "13px 16px", border: "2px solid #1a1a1a", borderRadius: 12, fontSize: 14, outline: "none", background: "#faf9f7", color: "#1a1a1a", fontFamily: "inherit", boxSizing: "border-box" }}
                        onFocus={e => (e.target.style.borderColor = "#ff6b6b")}
                        onBlur={e => (e.target.style.borderColor = "#1a1a1a")}
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileTap={{ scale: 0.97 }}
                      style={{ width: "100%", padding: "14px 20px", background: loading ? "#555" : "#1a1a1a", color: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}
                    >
                      {loading ? "Sending..." : (<>Send login code <ArrowRight size={16} /></>)}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="otp" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
                  <div style={{ width: 48, height: 48, background: "#edfaf5", border: "2px solid #1a1a1a", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>✉️</div>
                  <h2 style={{ fontSize: 24, fontWeight: 900, color: "#1a1a1a", marginBottom: 6, letterSpacing: "-0.02em" }}>Check your email</h2>
                  <p style={{ fontSize: 14, color: "#a8a29e", fontWeight: 500, marginBottom: 6 }}>We sent a 6-digit code to</p>
                  <p style={{ fontSize: 14, color: "#1a1a1a", fontWeight: 700, marginBottom: 28, background: "#f5f0e8", border: "1.5px solid #e2ddd7", borderRadius: 8, padding: "6px 12px", display: "inline-block" }}>{email}</p>

                  {error && (
                    <div style={{ background: "#fff0f0", border: "2px solid #ff6b6b", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
                      <p style={{ color: "#cc2b2b", fontSize: 13, fontWeight: 600 }}>{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>6-Digit Code</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        required
                        maxLength={6}
                        autoFocus
                        style={{ width: "100%", padding: "13px 16px", border: "2px solid #1a1a1a", borderRadius: 12, fontSize: 28, fontWeight: 900, outline: "none", background: "#faf9f7", color: "#1a1a1a", fontFamily: "monospace", letterSpacing: "0.25em", textAlign: "center", boxSizing: "border-box" }}
                        onFocus={e => (e.target.style.borderColor = "#52c4a0")}
                        onBlur={e => (e.target.style.borderColor = "#1a1a1a")}
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={loading || otp.length < 6}
                      whileTap={{ scale: 0.97 }}
                      style={{ width: "100%", padding: "14px 20px", background: loading ? "#555" : "#52c4a0", color: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: (loading || otp.length < 6) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", marginBottom: 12, opacity: otp.length < 6 && !loading ? 0.6 : 1 }}
                    >
                      {loading ? "Verifying..." : (<>Verify &amp; Sign in <ArrowRight size={16} /></>)}
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                      style={{ width: "100%", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#a8a29e", fontWeight: 600, fontFamily: "inherit", padding: "6px 0" }}
                    >
                      ← Use a different email
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#a8a29e", marginTop: 16, fontWeight: 500 }}>
          Customer ordering?{" "}
          <a href="/menu" style={{ color: "#1a1a1a", fontWeight: 700, textDecoration: "underline" }}>View Menu</a>
        </p>

      </motion.div>
    </div>
  );
}
