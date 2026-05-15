"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MenuItem, Category, CartItem, RestaurantSettings } from "@/lib/types";
import { formatCurrency, generateId } from "@/lib/utils";
import { X, Plus, Minus, ShoppingCart, Search, Clock, Zap } from "lucide-react";

interface Props {
  categories: Category[];
  items: MenuItem[];
  settings: RestaurantSettings;
}

export function CustomerMenuClient({ categories, items, settings }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemQty, setItemQty] = useState(1);
  const [itemNotes, setItemNotes] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  const featured = items.filter(i => i.isFeatured).slice(0, 4);
  const filtered = items.filter(item => {
    const matchCat = selectedCat === "all" || item.categoryId === selectedCat;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item: MenuItem, qty: number, notes?: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === item.id && c.notes === notes);
      if (existing) return prev.map(c => c.id === existing.id ? { ...c, quantity: c.quantity + qty } : c);
      return [...prev, { id: generateId(), menuItemId: item.id, name: item.name, price: item.price, quantity: qty, image: item.image, notes }];
    });
    setSelectedItem(null); setItemQty(1); setItemNotes("");
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: c.quantity + delta } : c).filter(c => c.quantity > 0));
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);
  const tax = cartTotal * (settings.taxRate / 100);
  const total = cartTotal + tax;

  const handleOrder = async () => {
    setOrderLoading(true);
    try {
      await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "dine_in", items: cart, subtotal: cartTotal, tax, discount: 0, total, customerName: customerName || "Guest", isPaid: false }),
      });
      setOrderSuccess(true); setCart([]); setCartOpen(false);
    } finally { setOrderLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f7", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── STICKY HEADER ── */}
      <header style={{ background: "#fff", borderBottom: "2px solid #1a1a1a", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ width: 36, height: 36, background: "#ff6b6b", border: "2px solid #1a1a1a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 14, color: "#1a1a1a", lineHeight: 1 }}>{settings.name}</div>
                <div style={{ fontSize: 10, color: "#a8a29e", fontWeight: 600, marginTop: 2 }}>{settings.tagline}</div>
              </div>
            </div>

            {/* Cart button */}
            <button onClick={() => setCartOpen(true)} style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, background: "#1a1a1a", color: "#fff", border: "2px solid #1a1a1a", padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
              <ShoppingCart size={15} />
              Cart
              {cartCount > 0 && (
                <div style={{ position: "absolute", top: -8, right: -8, width: 20, height: 20, background: "#ff6b6b", border: "2px solid #fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#fff" }}>
                  {cartCount}
                </div>
              )}
            </button>
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#a8a29e" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search dishes..."
              style={{ width: "100%", padding: "11px 12px 11px 36px", border: "2px solid #1a1a1a", borderRadius: 10, fontSize: 13, outline: "none", background: "#faf9f7", color: "#1a1a1a", fontFamily: "inherit", boxSizing: "border-box" }}
              onFocus={e => (e.target.style.borderColor = "#ff6b6b")}
              onBlur={e => (e.target.style.borderColor = "#1a1a1a")}
            />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── FEATURED ── */}
        {!search && selectedCat === "all" && featured.length > 0 && (
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1a1a1a", marginBottom: 14, letterSpacing: "-0.01em" }}>Chef's Picks</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {featured.map(item => (
                <motion.div key={item.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedItem(item); setItemQty(1); setItemNotes(""); }}
                  style={{ display: "flex", gap: 0, background: "#fff", border: "2px solid #1a1a1a", borderRadius: 16, overflow: "hidden", cursor: "pointer" }}>
                  <div style={{ width: 120, height: 110, overflow: "hidden", background: "#f5f0e8", flexShrink: 0 }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🍽️</div>}
                  </div>
                  <div style={{ padding: "14px 16px", flex: 1 }}>
                    <div style={{ background: "#fff3d4", border: "1.5px solid #1a1a1a", borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 800, color: "#8a6200", display: "inline-block", marginBottom: 6 }}>Featured</div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#1a1a1a", marginBottom: 4, lineHeight: 1.3 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#6b6560", lineHeight: 1.5, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.description}</div>
                    <div style={{ fontWeight: 900, fontSize: 16, color: "#ff6b6b" }}>{formatCurrency(item.price)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── CATEGORY TABS ── */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 24, scrollbarWidth: "none" }}>
          {[{ id: "all", name: "All Items" }, ...categories].map(cat => (
            <button key={cat.id} onClick={() => setSelectedCat(cat.id)}
              style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "2px solid", borderColor: selectedCat === cat.id ? "#1a1a1a" : "#e2ddd7", background: selectedCat === cat.id ? "#1a1a1a" : "#fff", color: selectedCat === cat.id ? "#fff" : "#6b6560", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.12s ease" }}>
              {cat.name}
            </button>
          ))}
        </div>

        {/* ── ITEMS GRID ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#1a1a1a", marginBottom: 6 }}>No items found</div>
            <div style={{ fontSize: 13, color: "#a8a29e" }}>Try a different search or category</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {filtered.map((item, i) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedItem(item); setItemQty(1); setItemNotes(""); }}
                style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 16, overflow: "hidden", cursor: "pointer" }}>
                <div style={{ height: 160, overflow: "hidden", background: "#f5f0e8", position: "relative" }}>
                  {item.image
                    ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🍽️</div>}
                  {item.isPopular && (
                    <div style={{ position: "absolute", top: 10, left: 10, background: "#ff6b6b", border: "1.5px solid #1a1a1a", borderRadius: 99, padding: "3px 9px", fontSize: 10, fontWeight: 800, color: "#fff" }}>Popular</div>
                  )}
                </div>
                <div style={{ padding: "14px 14px 16px" }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#1a1a1a", marginBottom: 5, lineHeight: 1.3 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: "#a8a29e", lineHeight: 1.5, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.description}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 900, fontSize: 16, color: "#ff6b6b" }}>{formatCurrency(item.price)}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#a8a29e", fontWeight: 600 }}>
                      <Clock size={11} />{item.preparationTime}m
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── ITEM DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.5)", zIndex: 50 }}
              onClick={() => setSelectedItem(null)} />
            <div style={{ position: "fixed", inset: 0, zIndex: 51, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 0 0", pointerEvents: "none" }}>
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 32 }}
                style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", pointerEvents: "auto" }}>
                {selectedItem.image && (
                  <div style={{ height: 220, overflow: "hidden", background: "#f5f0e8" }}>
                    <img src={selectedItem.image} alt={selectedItem.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                )}
                <div style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                    <h2 style={{ fontWeight: 900, fontSize: 22, color: "#1a1a1a", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{selectedItem.name}</h2>
                    <button onClick={() => setSelectedItem(null)} style={{ width: 32, height: 32, border: "2px solid #1a1a1a", borderRadius: 8, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <X size={14} />
                    </button>
                  </div>
                  <p style={{ fontSize: 14, color: "#6b6560", lineHeight: 1.65, marginBottom: 16 }}>{selectedItem.description}</p>

                  <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#a8a29e", fontWeight: 600 }}>
                      <Clock size={13} />{selectedItem.preparationTime} মিনিট
                    </div>
                    {selectedItem.calories && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#a8a29e", fontWeight: 600 }}>
                        <Zap size={13} />{selectedItem.calories} ক্যালরি
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Special Instructions</label>
                    <input
                      value={itemNotes}
                      onChange={e => setItemNotes(e.target.value)}
                      placeholder="e.g. No onions, extra sauce..."
                      style={{ width: "100%", padding: "11px 14px", border: "2px solid #1a1a1a", borderRadius: 10, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 0, border: "2px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
                      <button onClick={() => setItemQty(q => Math.max(1, q - 1))} style={{ width: 38, height: 44, border: "none", background: "#f5f0e8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>−</button>
                      <div style={{ width: 40, textAlign: "center", fontWeight: 900, fontSize: 16, color: "#1a1a1a" }}>{itemQty}</div>
                      <button onClick={() => setItemQty(q => q + 1)} style={{ width: 38, height: 44, border: "none", background: "#1a1a1a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 700 }}>+</button>
                    </div>
                    <button onClick={() => addToCart(selectedItem, itemQty, itemNotes || undefined)}
                      style={{ flex: 1, padding: "13px 20px", background: "#ff6b6b", color: "#fff", border: "2px solid #1a1a1a", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                      Add to Cart · {formatCurrency(selectedItem.price * itemQty)}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ── CART DRAWER ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.45)", zIndex: 50 }}
              onClick={() => setCartOpen(false)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: "100%", maxWidth: 400, background: "#fff", border: "2px solid #1a1a1a", zIndex: 51, display: "flex", flexDirection: "column" }}>

              <div style={{ padding: "18px 20px", borderBottom: "2px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 900, fontSize: 16, color: "#1a1a1a" }}>Your Order</div>
                <button onClick={() => setCartOpen(false)} style={{ width: 32, height: 32, border: "2px solid #1a1a1a", borderRadius: 8, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={14} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                {cart.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
                    <div style={{ width: 56, height: 56, background: "#f5f0e8", border: "2px solid #1a1a1a", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🛒</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#a8a29e" }}>Your cart is empty</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {cart.map(item => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#faf9f7", border: "2px solid #e2ddd7", borderRadius: 12 }}>
                        {item.image && <img src={item.image} alt={item.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", border: "1.5px solid #1a1a1a", flexShrink: 0 }} />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                          {item.notes && <div style={{ fontSize: 11, color: "#a8a29e", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.notes}</div>}
                          <div style={{ fontSize: 12, color: "#6b6560", marginTop: 3, fontWeight: 600 }}>{formatCurrency(item.price)}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1.5px solid #1a1a1a", borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                          <button onClick={() => updateQty(item.id, -1)} style={{ width: 28, height: 28, border: "none", background: "#f5f0e8", cursor: "pointer", fontWeight: 800, fontSize: 15 }}>−</button>
                          <span style={{ width: 26, textAlign: "center", fontWeight: 800, fontSize: 13 }}>{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, 1)} style={{ width: 28, height: 28, border: "none", background: "#1a1a1a", cursor: "pointer", color: "#fff", fontWeight: 800, fontSize: 15 }}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div style={{ padding: "16px 20px", borderTop: "2px solid #1a1a1a" }}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Your Name (Optional)</label>
                    <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. Nurrabby" style={{ width: "100%", padding: "10px 14px", border: "2px solid #1a1a1a", borderRadius: 10, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b6560", marginBottom: 6, fontWeight: 600 }}><span>Subtotal</span><span>{formatCurrency(cartTotal)}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b6560", marginBottom: 8, fontWeight: 600 }}><span>VAT ({settings.taxRate}%)</span><span>{formatCurrency(tax)}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, color: "#1a1a1a", fontWeight: 900, paddingTop: 10, borderTop: "2px solid #e2ddd7" }}><span>Total</span><span style={{ color: "#ff6b6b" }}>{formatCurrency(total)}</span></div>
                  </div>
                  <button onClick={handleOrder} disabled={orderLoading}
                    style={{ width: "100%", padding: "14px 20px", background: orderLoading ? "#555" : "#ff6b6b", color: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: orderLoading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    {orderLoading ? "Placing Order..." : `Place Order · ${formatCurrency(total)}`}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── ORDER SUCCESS ── */}
      <AnimatePresence>
        {orderSuccess && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.5)", zIndex: 60 }} />
            <div style={{ position: "fixed", inset: 0, zIndex: 61, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ type: "spring", stiffness: 350, damping: 28 }}
                style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 20, padding: 40, maxWidth: 380, width: "100%", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, background: "#edfaf5", border: "2px solid #1a1a1a", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px" }}>✓</div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", marginBottom: 8 }}>Order Placed!</h2>
                <p style={{ fontSize: 14, color: "#6b6560", marginBottom: 24, fontWeight: 500 }}>আপনার অর্ডার রান্নাঘরে পাঠানো হয়েছে। অল্প কিছুক্ষণের মধ্যে প্রস্তুত হবে!</p>
                <button onClick={() => setOrderSuccess(false)} style={{ width: "100%", padding: "13px 20px", background: "#ff6b6b", color: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                  Continue Ordering
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
