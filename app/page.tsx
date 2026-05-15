import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ChefHat, ShoppingCart, LayoutDashboard,
  Star, Clock, Users, MapPin, Phone, Flame,
} from "lucide-react";

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    if (["main_admin", "admin", "staff"].includes(session.role)) redirect("/admin");
    else redirect("/menu");
  }

  return (
    <div className="min-h-screen" style={{ background: "#faf9f7" }}>

      {/* ── NAV ── */}
      <nav style={{ background: "#fff", borderBottom: "2px solid #1a1a1a" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, background: "#ff6b6b", border: "2px solid #1a1a1a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 18 }}>🍽️</span>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, color: "#1a1a1a", lineHeight: 1 }}>Zunayed Restaurant</div>
              <div style={{ fontSize: 10, color: "#a8a29e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>Fine Dining</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/menu" style={{ display: "flex", alignItems: "center", gap: 6, background: "#ff6b6b", color: "#fff", border: "2px solid #1a1a1a", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              <span>🛒</span> Order Now
            </Link>
            <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#1a1a1a", border: "2px solid #1a1a1a", padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Staff Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 24px 56px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          {/* Left */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff3d4", border: "2px solid #1a1a1a", borderRadius: 99, padding: "6px 14px", marginBottom: 20 }}>
              <div style={{ width: 8, height: 8, background: "#52c4a0", border: "1.5px solid #1a1a1a", borderRadius: "50%" }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: "#8a6200", textTransform: "uppercase", letterSpacing: "0.06em" }}>Open Now · Dhaka</span>
            </div>
            <h1 style={{ fontSize: 56, fontWeight: 900, color: "#1a1a1a", lineHeight: 1.05, marginBottom: 16, letterSpacing: "-0.02em" }}>
              Taste the<br />
              <span style={{ color: "#ff6b6b" }}>Difference</span>
            </h1>
            <p style={{ fontSize: 15, color: "#6b6560", lineHeight: 1.7, marginBottom: 28, fontWeight: 500, maxWidth: 400 }}>
              Experience fine dining at Zunayed Restaurant. Fresh ingredients, expert chefs, and unforgettable flavors — all in one place.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/menu" style={{ display: "flex", alignItems: "center", gap: 8, background: "#1a1a1a", color: "#fff", border: "2px solid #1a1a1a", padding: "14px 28px", borderRadius: 12, fontSize: 14, fontWeight: 800, textDecoration: "none" }}>
                🛒 Browse Menu
              </Link>
              <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", color: "#1a1a1a", border: "2px solid #1a1a1a", padding: "14px 22px", borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                Staff Portal →
              </Link>
            </div>
            {/* Quick stats */}
            <div style={{ display: "flex", gap: 24, marginTop: 36 }}>
              {[["500+", "Happy Guests"], ["50+", "Menu Items"], ["15 min", "Avg. Prep"]].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a" }}>{n}</div>
                  <div style={{ fontSize: 11, color: "#a8a29e", fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual card stack */}
          <div style={{ position: "relative", height: 380 }}>
            {/* Background card */}
            <div style={{ position: "absolute", top: 20, right: 20, left: 20, height: 340, background: "#fff3d4", border: "2px solid #1a1a1a", borderRadius: 24, transform: "rotate(3deg)" }} />
            {/* Main image card */}
            <div style={{ position: "absolute", inset: 0, background: "#fff", border: "2px solid #1a1a1a", borderRadius: 20, overflow: "hidden" }}>
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop"
                alt="Fine dining"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Overlay badge */}
              <div style={{ position: "absolute", bottom: 16, left: 16, background: "#ff6b6b", border: "2px solid #1a1a1a", borderRadius: 12, padding: "10px 16px" }}>
                <div style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>Chef's Special</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 600 }}>Available today</div>
              </div>
            </div>
            {/* Floating pill */}
            <div style={{ position: "absolute", top: -10, right: -10, background: "#d4f5ec", border: "2px solid #1a1a1a", borderRadius: 99, padding: "8px 14px", fontSize: 12, fontWeight: 800, color: "#1a7a5e", whiteSpace: "nowrap" }}>
              ⭐ 4.9 Rating
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 56px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { bg: "#fff0f0", icon: "⭐", iconBg: "#ff6b6b", title: "Premium Ingredients", desc: "Locally sourced, daily fresh produce from trusted suppliers" },
            { bg: "#edfaf5", icon: "⚡", iconBg: "#52c4a0", title: "Fast Service", desc: "Average 15 minute preparation. Hot food delivered to your table" },
            { bg: "#fff8ec", icon: "👨‍🍳", iconBg: "#ffb347", title: "Expert Chefs", desc: "Experienced culinary team crafting every dish with passion" },
          ].map((f) => (
            <div key={f.title} style={{ background: f.bg, border: "2px solid #1a1a1a", borderRadius: 20, padding: 24 }}>
              <div style={{ width: 44, height: 44, background: f.iconBg, border: "2px solid #1a1a1a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>
                {f.icon}
              </div>
              <div style={{ fontWeight: 900, fontSize: 15, color: "#1a1a1a", marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "#6b6560", lineHeight: 1.6, fontWeight: 500 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── POPULAR ITEMS ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 56px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.02em" }}>Popular Dishes</h2>
            <p style={{ fontSize: 13, color: "#a8a29e", fontWeight: 600, marginTop: 4 }}>Our most loved menu items</p>
          </div>
          <Link href="/menu" style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: "#1a1a1a", textDecoration: "none" }}>
            View Full Menu →
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {[
            { name: "Ribeye Steak", price: "$34.99", img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop", tag: "🔥 Best Seller" },
            { name: "Grilled Salmon", price: "$22.99", img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=200&fit=crop", tag: "🌿 Healthy" },
            { name: "Margherita Pizza", price: "$14.99", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop", tag: "⭐ Popular" },
            { name: "Lava Cake", price: "$8.99", img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&h=200&fit=crop", tag: "🍫 Dessert" },
          ].map((item) => (
            <Link href="/menu" key={item.name} style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 16, overflow: "hidden", textDecoration: "none", display: "block" }}>
              <div style={{ height: 140, overflow: "hidden", background: "#f5f0e8" }}>
                <img src={item.img} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#ff6b6b", marginBottom: 4 }}>{item.tag}</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#1a1a1a", marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontWeight: 900, fontSize: 15, color: "#ff6b6b" }}>{item.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── INFO STRIP ── */}
      <section style={{ background: "#1a1a1a", borderTop: "2px solid #1a1a1a", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          {[
            { icon: "📍", label: "Location", val: "Dhaka, Bangladesh" },
            { icon: "📞", label: "Phone", val: "+880 1234-567890" },
            { icon: "🕐", label: "Hours", val: "9 AM – 11 PM Daily" },
          ].map((i) => (
            <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, background: "#ff6b6b", border: "2px solid #fff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {i.icon}
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#a8a29e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{i.label}</div>
                <div style={{ fontSize: 14, color: "#fff", fontWeight: 700, marginTop: 2 }}>{i.val}</div>
              </div>
            </div>
          ))}
          <Link href="/menu" style={{ background: "#ff6b6b", color: "#fff", border: "2px solid #fff", padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 800, textDecoration: "none" }}>
            Order Now →
          </Link>
        </div>
      </section>

    </div>
  );
}
