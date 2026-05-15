"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MenuItem, Category, CartItem, RestaurantSettings } from "@/lib/types";
import { formatCurrency, generateId } from "@/lib/utils";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Star,
  TrendingUp,
  ChefHat,
  X,
  Clock,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

interface CustomerMenuClientProps {
  categories: Category[];
  items: MenuItem[];
  settings: RestaurantSettings;
}

export function CustomerMenuClient({
  categories,
  items,
  settings,
}: CustomerMenuClientProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemQty, setItemQty] = useState(1);
  const [itemNotes, setItemNotes] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");

  const featured = items.filter((i) => i.isFeatured);
  const popular = items.filter((i) => i.isPopular);

  const filtered = items.filter((item) => {
    const matchCat = selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const addToCart = (item: MenuItem, qty: number, notes?: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id && c.notes === notes);
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id ? { ...c, quantity: c.quantity + qty } : c
        );
      }
      return [
        ...prev,
        {
          id: generateId(),
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: qty,
          image: item.image,
          notes,
        },
      ];
    });
    setSelectedItem(null);
    setItemQty(1);
    setItemNotes("");
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);
  const tax = cartTotal * (settings.taxRate / 100);
  const total = cartTotal + tax;

  const handlePlaceOrder = async () => {
    setOrderLoading(true);
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "dine_in",
          items: cart,
          subtotal: cartTotal,
          tax,
          discount: 0,
          total,
          customerName: customerName || "Guest",
          isPaid: false,
        }),
      });
      setOrderSuccess(true);
      setCart([]);
      setCartOpen(false);
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-stone-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
                <ChefHat size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-none">{settings.name}</h1>
                <p className="text-xs text-stone-500">{settings.tagline}</p>
              </div>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              <ShoppingCart size={16} />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes..."
            icon={<Search size={15} />}
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Featured */}
        {!search && selectedCategory === "all" && featured.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-bold mb-3 flex items-center gap-1.5">
              <Star size={16} />
              Chef's Picks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featured.slice(0, 4).map((item) => (
                <FeaturedCard
                  key={item.id}
                  item={item}
                  onAdd={() => {
                    setSelectedItem(item);
                    setItemQty(1);
                    setItemNotes("");
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
              selectedCategory === "all"
                ? "bg-black text-white border-black"
                : "bg-white border-stone-200 text-stone-600"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                selectedCategory === cat.id
                  ? "bg-black text-white border-black"
                  : "bg-white border-stone-200 text-stone-600"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Items */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-400 text-sm">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => {
                  setSelectedItem(item);
                  setItemQty(1);
                  setItemNotes("");
                }}
                className="bg-white border-2 border-stone-200 rounded-2xl overflow-hidden cursor-pointer hover:border-stone-400 transition-all"
              >
                {item.image ? (
                  <div className="h-44 overflow-hidden bg-stone-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="h-44 bg-stone-100 flex items-center justify-center">
                    <ChefHat size={32} className="text-stone-300" />
                  </div>
                )}
                <div className="p-3">
                  <div className="flex gap-1 mb-1.5 flex-wrap">
                    {item.isPopular && (
                      <Badge variant="warning">
                        <TrendingUp size={9} className="mr-0.5" />
                        Popular
                      </Badge>
                    )}
                    {item.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="default">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="text-sm font-semibold mb-0.5">{item.name}</h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mb-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold">{formatCurrency(item.price)}</span>
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                      <Clock size={11} />
                      {item.preparationTime}m
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        size="md"
      >
        {selectedItem && (
          <div>
            {selectedItem.image && (
              <div className="h-52 overflow-hidden bg-stone-100">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-lg font-bold">{selectedItem.name}</h2>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {selectedItem.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                </div>
                <span className="text-xl font-bold shrink-0">
                  {formatCurrency(selectedItem.price)}
                </span>
              </div>
              <p className="text-sm text-stone-600 mb-4">{selectedItem.description}</p>

              <div className="flex gap-4 text-xs text-stone-500 mb-4">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  {selectedItem.preparationTime} min
                </div>
                {selectedItem.calories && (
                  <div className="flex items-center gap-1">
                    <Flame size={12} />
                    {selectedItem.calories} cal
                  </div>
                )}
              </div>

              <Input
                label="Special instructions"
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                placeholder="e.g. No onions, extra sauce..."
                className="mb-4"
              />

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 border-2 border-stone-200 rounded-xl px-3 py-2">
                  <button
                    onClick={() => setItemQty((q) => Math.max(1, q - 1))}
                    className="text-stone-600 hover:text-black"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-bold w-5 text-center">{itemQty}</span>
                  <button
                    onClick={() => setItemQty((q) => q + 1)}
                    className="text-stone-600 hover:text-black"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <Button
                  className="flex-1"
                  onClick={() => addToCart(selectedItem, itemQty, itemNotes || undefined)}
                >
                  Add to cart · {formatCurrency(selectedItem.price * itemQty)}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 flex flex-col border-l-2 border-stone-200"
            >
              <div className="flex items-center justify-between p-4 border-b-2 border-stone-100">
                <h2 className="font-bold">Your Order</h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2 hover:bg-stone-100 rounded-xl"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-stone-400">
                    <ShoppingCart size={32} className="mb-2" />
                    <p className="text-sm">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        {item.notes && (
                          <p className="text-xs text-stone-400 truncate">{item.notes}</p>
                        )}
                        <p className="text-xs text-stone-500">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 bg-stone-200 rounded-lg flex items-center justify-center"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-sm font-semibold w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-6 h-6 bg-black text-white rounded-lg flex items-center justify-center"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-t-2 border-stone-100">
                  <Input
                    label="Your name (optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. John"
                    className="mb-3"
                  />
                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-xs text-stone-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-stone-600">
                      <span>Tax ({settings.taxRate}%)</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-stone-100">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    loading={orderLoading}
                    onClick={handlePlaceOrder}
                  >
                    Place Order · {formatCurrency(total)}
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Order Success */}
      <Modal isOpen={orderSuccess} onClose={() => setOrderSuccess(false)} size="sm">
        <div className="p-6 flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl"
          >
            ✓
          </motion.div>
          <h2 className="text-lg font-bold">Order Placed!</h2>
          <p className="text-sm text-stone-500 text-center">
            Your order is being prepared. We'll have it ready soon!
          </p>
          <Button onClick={() => setOrderSuccess(false)} className="w-full">
            Continue Ordering
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function FeaturedCard({
  item,
  onAdd,
}: {
  item: MenuItem;
  onAdd: () => void;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onAdd}
      className="flex gap-3 bg-white border-2 border-stone-200 rounded-2xl overflow-hidden cursor-pointer hover:border-stone-400 transition-all"
    >
      {item.image && (
        <div className="w-28 h-28 overflow-hidden bg-stone-100 shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex-1 py-3 pr-3">
        <Badge variant="warning" className="mb-1">
          <Star size={9} className="mr-0.5" />
          Featured
        </Badge>
        <h3 className="text-sm font-semibold leading-tight">{item.name}</h3>
        <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{item.description}</p>
        <p className="text-sm font-bold mt-1.5">{formatCurrency(item.price)}</p>
      </div>
    </motion.div>
  );
}
