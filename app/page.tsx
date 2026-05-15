import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChefHat, ShoppingCart, LayoutDashboard, Star, Clock, Users } from "lucide-react";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    if (["main_admin", "admin", "staff"].includes(session.role)) {
      redirect("/admin");
    } else {
      redirect("/menu");
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="bg-white border-b-2 border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ChefHat size={28} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Savoria</h1>
          <p className="text-lg text-stone-500 mb-8">Fine Dining & Fresh Flavors</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/menu"
              className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-stone-800 transition-colors"
            >
              <ShoppingCart size={16} />
              View Menu & Order
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 bg-white text-black border-2 border-black px-6 py-3 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors"
            >
              <LayoutDashboard size={16} />
              Staff Login
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: <Star size={20} />,
              title: "Fresh Ingredients",
              desc: "Locally sourced, carefully selected",
            },
            {
              icon: <Clock size={20} />,
              title: "Fast Service",
              desc: "Average 15 minute preparation",
            },
            {
              icon: <Users size={20} />,
              title: "Expert Chefs",
              desc: "Experienced culinary team",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white border-2 border-stone-200 rounded-2xl p-6 text-center"
            >
              <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                {f.icon}
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-stone-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
