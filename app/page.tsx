import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    if (["main_admin", "admin", "staff"].includes(session.role)) redirect("/admin");
    else redirect("/menu");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f7", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── NAV ── */}
      <nav style={{ background: "#fff", borderBottom: "2px solid #1a1a1a", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo — single line, no emoji wrapping issue */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, background: "#ff6b6b", border: "2px solid #1a1a1a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
            </div>
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 15, color: "#1a1a1a", whiteSpace: "nowrap" }}>Zunayed Restaurant</div>
              <div style={{ fontWeight: 700, fontSize: 10, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2, whiteSpace: "nowrap" }}>Fine Dining · Dhaka</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/menu" style={{ display: "flex", alignItems: "center", gap: 7, background: "#ff6b6b", color: "#fff", border: "2px solid #1a1a1a", padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap" }}>
              Order Now
            </Link>
            <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", color: "#1a1a1a", border: "2px solid #1a1a1a", padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
              Staff Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px 52px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>

          {/* Left */}
          <div>
            {/* Status pill — no emoji, just a clean dot */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff8ec", border: "2px solid #1a1a1a", borderRadius: 99, padding: "7px 16px", marginBottom: 24 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#52c4a0", border: "1.5px solid #1a1a1a" }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#6b6560", textTransform: "uppercase", letterSpacing: "0.06em" }}>Open Now · Dhaka</span>
            </div>

            <h1 style={{ fontSize: 54, fontWeight: 900, color: "#1a1a1a", lineHeight: 1.05, marginBottom: 18, letterSpacing: "-0.025em" }}>
              Taste the<br /><span style={{ color: "#ff6b6b" }}>Difference</span>
            </h1>
            <p style={{ fontSize: 15, color: "#6b6560", lineHeight: 1.7, marginBottom: 32, fontWeight: 500, maxWidth: 420 }}>
              Experience fine dining at Zunayed Restaurant. Fresh ingredients, expert chefs, and unforgettable flavors — all in one place.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
              <Link href="/menu" style={{ display: "flex", alignItems: "center", gap: 8, background: "#1a1a1a", color: "#fff", border: "2px solid #1a1a1a", padding: "14px 28px", borderRadius: 12, fontSize: 14, fontWeight: 800, textDecoration: "none" }}>
                Browse Menu
              </Link>
              <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", color: "#1a1a1a", border: "2px solid #1a1a1a", padding: "14px 22px", borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                Staff Portal →
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 32, paddingTop: 20, borderTop: "2px solid #e2ddd7" }}>
              {[["500+", "Happy Guests"], ["50+", "Menu Items"], ["15 min", "Avg. Prep"]].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 11, color: "#a8a29e", fontWeight: 600, marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — image card */}
          <div style={{ position: "relative", height: 400 }}>
            <div style={{ position: "absolute", top: 16, right: 16, left: 16, height: 368, background: "#fff3d4", border: "2px solid #1a1a1a", borderRadius: 24, transform: "rotate(2.5deg)" }} />
            <div style={{ position: "absolute", inset: 0, background: "#fff", border: "2px solid #1a1a1a", borderRadius: 20, overflow: "hidden" }}>
              <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&h=450&fit=crop&auto=format" alt="Fine dining at Zunayed Restaurant" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", bottom: 16, left: 16, background: "#ff6b6b", border: "2px solid #1a1a1a", borderRadius: 12, padding: "10px 16px" }}>
                <div style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>Chef's Special</div>
                <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 600, marginTop: 2 }}>Available today</div>
              </div>
            </div>
            <div style={{ position: "absolute", top: -12, right: -12, background: "#edfaf5", border: "2px solid #1a1a1a", borderRadius: 99, padding: "8px 16px", fontSize: 12, fontWeight: 800, color: "#1a7a5e", whiteSpace: "nowrap" }}>
              ★ 4.9 Rating
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 52px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { bg: "#fff0f0", iconBg: "#ff6b6b", icon: "★", title: "Premium Ingredients", desc: "Locally sourced, daily fresh produce from trusted suppliers" },
            { bg: "#edfaf5", iconBg: "#52c4a0", icon: "⚡", title: "Fast Service", desc: "Average 15 minute preparation. Hot food delivered to your table" },
            { bg: "#fff8ec", iconBg: "#ffb347", icon: "♟", title: "Expert Chefs", desc: "Experienced culinary team crafting every dish with passion" },
          ].map((f) => (
            <div key={f.title} style={{ background: f.bg, border: "2px solid #1a1a1a", borderRadius: 20, padding: "24px 22px" }}>
              <div style={{ width: 44, height: 44, background: f.iconBg, border: "2px solid #1a1a1a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", fontWeight: 900, marginBottom: 16 }}>
                {f.icon}
              </div>
              <div style={{ fontWeight: 900, fontSize: 15, color: "#1a1a1a", marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "#6b6560", lineHeight: 1.65, fontWeight: 500 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── POPULAR DISHES ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 52px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.02em", marginBottom: 4 }}>Popular Dishes</h2>
            <p style={{ fontSize: 13, color: "#a8a29e", fontWeight: 600 }}>Our most loved menu items</p>
          </div>
          <Link href="/menu" style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 700, color: "#1a1a1a", textDecoration: "none", whiteSpace: "nowrap" }}>
            View Full Menu →
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { name: "Ribeye Steak", price: "৳1,200", img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop&auto=format", tag: "Best Seller", tagBg: "#ff6b6b" },
            { name: "Grilled Salmon", price: "৳750", img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=200&fit=crop&auto=format", tag: "Healthy", tagBg: "#52c4a0" },
            { name: "Margherita Pizza", price: "৳550", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop&auto=format", tag: "Popular", tagBg: "#a29bfe" },
            { name: "Lava Cake", price: "৳280", img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&h=200&fit=crop&auto=format", tag: "Dessert", tagBg: "#ffb347" },
          ].map((item) => (
            <Link href="/menu" key={item.name} style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 16, overflow: "hidden", textDecoration: "none", display: "block" }}>
              <div style={{ height: 148, overflow: "hidden", background: "#f5f0e8", position: "relative" }}>
                <img src={item.img} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", top: 10, left: 10, background: item.tagBg, border: "1.5px solid #1a1a1a", borderRadius: 99, padding: "3px 10px", fontSize: 10, fontWeight: 800, color: "#fff" }}>{item.tag}</div>
              </div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#1a1a1a", marginBottom: 6 }}>{item.name}</div>
                <div style={{ fontWeight: 900, fontSize: 16, color: "#ff6b6b" }}>{item.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── INFO STRIP ── */}
      <section style={{ background: "#1a1a1a", borderTop: "2px solid #1a1a1a" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          {[
            { icon: "📍", label: "Location", val: "Dhaka, Bangladesh" },
            { icon: "📞", label: "Phone", val: "+880 1234-567890" },
            { icon: "🕐", label: "Hours", val: "9 AM – 11 PM Daily" },
          ].map((i) => (
            <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, background: "#ff6b6b", border: "2px solid rgba(255,255,255,0.3)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{i.icon}</div>
              <div>
                <div style={{ fontSize: 10, color: "#a8a29e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{i.label}</div>
                <div style={{ fontSize: 14, color: "#fff", fontWeight: 700, marginTop: 2 }}>{i.val}</div>
              </div>
            </div>
          ))}
          <Link href="/menu" style={{ background: "#ff6b6b", color: "#fff", border: "2px solid rgba(255,255,255,0.3)", padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap" }}>
            Order Now →
          </Link>
        </div>
      </section>

    </div>
  );
}

