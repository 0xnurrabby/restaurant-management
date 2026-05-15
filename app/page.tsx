import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChefHat, ShoppingCart, LayoutDashboard, Star, Clock, Leaf } from "lucide-react";

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    if (["main_admin", "admin", "staff"].includes(session.role)) redirect("/admin");
    else redirect("/menu");
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Dot background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25"
        style={{ backgroundImage: "radial-gradient(circle, #d4cdc3 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      {/* Header */}
      <header className="bg-white border-b-2 border-[#1a1a1a] relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff6b6b] border-2 border-[#1a1a1a] rounded-2xl flex items-center justify-center">
              <ChefHat size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-base text-[#1a1a1a] leading-none">Zunayed Restaurant</h1>
              <p className="text-[10px] text-[#a8a29e] font-semibold uppercase tracking-wide">Fine Dining</p>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#333] transition-colors"
          >
            <LayoutDashboard size={13} />
            Staff Login
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 py-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-[#fff3d4] border-2 border-[#1a1a1a] px-4 py-1.5 rounded-full mb-6">
          <span className="text-xs font-bold text-[#8a6200] uppercase tracking-wide">Now Open</span>
          <div className="w-1.5 h-1.5 bg-[#52c4a0] border border-[#1a1a1a] rounded-full" />
        </div>
        <h2 className="text-5xl font-black text-[#1a1a1a] leading-none mb-4 tracking-tight">
          Zunayed<br />
          <span className="text-[#ff6b6b]">Restaurant</span>
        </h2>
        <p className="text-base text-[#a8a29e] mb-10 font-medium">Fine Dining & Fresh Flavors</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/menu"
            className="flex items-center gap-2 bg-[#ff6b6b] text-white border-2 border-[#1a1a1a] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#ff5252] transition-colors"
          >
            <ShoppingCart size={15} />
            View Menu & Order
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 bg-white text-[#1a1a1a] border-2 border-[#1a1a1a] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#f5f0e8] transition-colors"
          >
            <LayoutDashboard size={15} />
            Staff Portal
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-20 relative z-10">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: <Star size={18} />, label: "Premium Ingredients", desc: "Locally sourced, carefully selected", bg: "bg-[#ffe4e4]", accent: "bg-[#ff6b6b]" },
            { icon: <Clock size={18} />, label: "Fast Service", desc: "Average 15 minute preparation time", bg: "bg-[#d4f5ec]", accent: "bg-[#52c4a0]" },
            { icon: <Leaf size={18} />, label: "Fresh Daily", desc: "New dishes and specials every day", bg: "bg-[#fff3d4]", accent: "bg-[#ffb347]" },
          ].map((f, i) => (
            <div key={i} className={`${f.bg} border-2 border-[#1a1a1a] rounded-2xl p-5`}>
              <div className={`w-9 h-9 ${f.accent} border-2 border-[#1a1a1a] rounded-xl flex items-center justify-center mb-3 text-white`}>
                {f.icon}
              </div>
              <h3 className="font-black text-sm text-[#1a1a1a] mb-1">{f.label}</h3>
              <p className="text-xs text-[#6b6560] font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
