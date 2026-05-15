"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MenuItem, Category, Table, Floor, CartItem } from "@/lib/types";
import { formatCurrency, generateId } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface POSClientProps {
  items: MenuItem[];
  categories: Category[];
  tables: Table[];
  floors: Floor[];
}

export function POSClient({ items, categories, tables, floors }: POSClientProps) {
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [table, setTable] = useState<Table | null>(null);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [tableModal, setTableModal] = useState(false);
  const [payStep, setPayStep] = useState<"idle" | "method" | "processing" | "done">("idle");
  const [payMethod, setPayMethod] = useState("cash");
  const [orderNum, setOrderNum] = useState<number | null>(null);
  const [showCart, setShowCart] = useState(false); // mobile: toggle cart view

  const filtered = items.filter(i => {
    const matchCat = cat === "all" || i.categoryId === cat;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addItem = (item: MenuItem) => {
    setCart(prev => {
      const ex = prev.find(c => c.menuItemId === item.id);
      if (ex) return prev.map(c => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { id: generateId(), menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: c.quantity + delta } : c).filter(c => c.quantity > 0));
  };

  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const discountAmt = subtotal * discount / 100;
  const tax = (subtotal - discountAmt) * 0.05;
  const total = subtotal - discountAmt + tax;
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const handlePay = async () => {
    setPayStep("processing");
    await new Promise(r => setTimeout(r, 1500));
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId: table?.id, tableNumber: table?.number, type: table ? "dine_in" : "takeaway", items: cart, subtotal, tax, discount: discountAmt, total, notes, isPaid: true, paymentMethod: payMethod }),
      });
      if (res.ok) { const d = await res.json(); setOrderNum(d.order?.orderNumber); }
    } catch {}
    setPayStep("done");
  };

  const newOrder = () => { setCart([]); setTable(null); setDiscount(0); setNotes(""); setPayStep("idle"); setOrderNum(null); setShowCart(false); };

  const S: React.CSSProperties = { borderRadius: 0 };

  return (
    <div>
      {/* Mobile: toggle between Menu and Cart */}
      <div className="pos-mobile-tabs" style={{ display: "none", gap: 0, marginBottom: 12, border: "2px solid #1a1a1a" }}>
        <button onClick={() => setShowCart(false)} style={{ flex: 1, padding: "10px", background: !showCart ? "#1a1a1a" : "#fff", color: !showCart ? "#fff" : "#1a1a1a", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          Menu
        </button>
        <button onClick={() => setShowCart(true)} style={{ flex: 1, padding: "10px", background: showCart ? "#1a1a1a" : "#fff", color: showCart ? "#fff" : "#1a1a1a", border: "none", borderLeft: "2px solid #1a1a1a", fontWeight: 700, fontSize: 13, cursor: "pointer", position: "relative" }}>
          Cart {cartCount > 0 && <span style={{ background: "#ff6b6b", color: "#fff", padding: "1px 7px", fontSize: 10, fontWeight: 900, marginLeft: 6 }}>{cartCount}</span>}
        </button>
      </div>

      <div style={{ display: "flex", gap: 16, height: "calc(100vh - 120px)", minHeight: 400 }}>

        {/* LEFT: Menu */}
        <div className={`pos-menu-panel${showCart ? " pos-hidden-mobile" : ""}`} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#a8a29e", pointerEvents: "none" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." style={{ width: "100%", padding: "9px 10px 9px 32px", border: "2px solid #1a1a1a", fontSize: 13, outline: "none", fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }} />
            </div>
            <button onClick={() => setTableModal(true)} style={{ flexShrink: 0, padding: "9px 14px", border: "2px solid #1a1a1a", fontSize: 12, fontWeight: 700, background: table ? "#1a1a1a" : "#fff", color: table ? "#fff" : "#1a1a1a", cursor: "pointer", whiteSpace: "nowrap" }}>
              {table ? `Table ${table.number}` : "+ Table"}
            </button>
          </div>

          {/* Category tabs */}
          <div style={{ display: "flex", gap: 0, overflowX: "auto", scrollbarWidth: "none", flexShrink: 0, border: "2px solid #1a1a1a" }}>
            {[{ id: "all", name: "All" }, ...categories].map((c, i) => (
              <button key={c.id} onClick={() => setCat(c.id)}
                style={{ flexShrink: 0, padding: "7px 14px", fontSize: 12, fontWeight: 700, border: "none", borderRight: i < categories.length ? "1px solid #e2ddd7" : "none", background: cat === c.id ? "#1a1a1a" : "#fff", color: cat === c.id ? "#fff" : "#6b6560", cursor: "pointer" }}>
                {c.name}
              </button>
            ))}
          </div>

          {/* Items grid */}
          <div style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8, alignContent: "start" }}>
            {filtered.map(item => (
              <motion.button key={item.id} whileTap={{ scale: 0.97 }} onClick={() => addItem(item)}
                style={{ background: "#fff", border: "2px solid #1a1a1a", padding: "12px 10px", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 6 }}>
                {item.image
                  ? <div style={{ width: "100%", height: 72, overflow: "hidden", background: "#f5f0e8" }}><img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" /></div>
                  : <div style={{ width: 32, height: 32, background: "#f5f0e8", border: "1.5px solid #e2ddd7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🍽️</div>
                }
                <div style={{ fontWeight: 700, fontSize: 12, color: "#1a1a1a", lineHeight: 1.3 }}>{item.name}</div>
                <div style={{ fontWeight: 900, fontSize: 13, color: "#ff6b6b" }}>{formatCurrency(item.price)}</div>
                {item.isPopular && <span style={{ fontSize: 10, background: "#fff3d4", border: "1px solid #1a1a1a", padding: "1px 6px", fontWeight: 700, color: "#8a6200", alignSelf: "flex-start" }}>Popular</span>}
              </motion.button>
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "#a8a29e", fontSize: 13 }}>No items found</div>
            )}
          </div>
        </div>

        {/* RIGHT: Cart */}
        <div className={`pos-cart-panel${!showCart ? " pos-hidden-mobile" : ""}`} style={{ width: 280, flexShrink: 0, background: "#fff", border: "2px solid #1a1a1a", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "12px 14px", borderBottom: "2px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 14, color: "#1a1a1a" }}>Current Order</div>
              {table && <div style={{ fontSize: 11, color: "#a8a29e", fontWeight: 600, marginTop: 2 }}>Table {table.number}</div>}
            </div>
            {cart.length > 0 && <button onClick={() => setCart([])} style={{ fontSize: 11, color: "#cc2b2b", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Clear</button>}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
            {cart.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
                <div style={{ fontSize: 28 }}>🛒</div>
                <div style={{ fontSize: 12, color: "#a8a29e", fontWeight: 600, textAlign: "center" }}>Add items from the menu</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#faf9f7", border: "1.5px solid #e2ddd7" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: "#a8a29e", fontWeight: 600, marginTop: 2 }}>{formatCurrency(item.price)} each</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <button onClick={() => updateQty(item.id, -1)} style={{ width: 22, height: 22, background: "#f5f0e8", border: "1.5px solid #1a1a1a", cursor: "pointer", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <span style={{ fontWeight: 800, fontSize: 12, width: 18, textAlign: "center" }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} style={{ width: 22, height: 22, background: "#1a1a1a", border: "1.5px solid #1a1a1a", cursor: "pointer", color: "#fff", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#1a1a1a", minWidth: 44, textAlign: "right" }}>{formatCurrency(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div style={{ padding: "8px 12px", borderTop: "1.5px solid #e2ddd7", display: "flex", gap: 6 }}>
              <input type="number" value={discount || ""} onChange={e => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))} placeholder="Disc %" min={0} max={100} style={{ flex: 1, padding: "7px 8px", border: "1.5px solid #1a1a1a", fontSize: 11, outline: "none", fontFamily: "inherit" }} />
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Kitchen note..." style={{ flex: 2, padding: "7px 8px", border: "1.5px solid #1a1a1a", fontSize: 11, outline: "none", fontFamily: "inherit" }} />
            </div>
          )}

          {cart.length > 0 && (
            <div style={{ padding: "10px 14px", borderTop: "2px solid #1a1a1a" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b6560", fontWeight: 600 }}><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                {discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#52c4a0", fontWeight: 700 }}><span>Discount ({discount}%)</span><span>−{formatCurrency(discountAmt)}</span></div>}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b6560", fontWeight: 600 }}><span>VAT (5%)</span><span>{formatCurrency(tax)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: "#1a1a1a", fontWeight: 900, paddingTop: 6, borderTop: "1.5px solid #e2ddd7", marginTop: 2 }}><span>Total</span><span style={{ color: "#ff6b6b" }}>{formatCurrency(total)}</span></div>
              </div>
              <button onClick={() => setPayStep("method")} style={{ width: "100%", padding: "11px", background: "#ff6b6b", color: "#fff", border: "2px solid #1a1a1a", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                Charge {formatCurrency(total)}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table modal */}
      <AnimatePresence>
        {tableModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.45)", zIndex: 50 }} onClick={() => setTableModal(false)} />
            <div style={{ position: "fixed", inset: 0, zIndex: 51, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
              <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
                style={{ background: "#fff", border: "2px solid #1a1a1a", width: "100%", maxWidth: 460, maxHeight: "80vh", overflow: "auto" }}>
                <div style={{ padding: "14px 18px", borderBottom: "2px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 900, fontSize: 14 }}>Select Table</div>
                  <button onClick={() => setTableModal(false)} style={{ width: 26, height: 26, border: "2px solid #1a1a1a", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={12} /></button>
                </div>
                <div style={{ padding: 14 }}>
                  {floors.length === 0 ? <p style={{ textAlign: "center", color: "#a8a29e", padding: "20px 0", fontSize: 13 }}>No floors configured</p>
                    : floors.map(floor => (
                      <div key={floor.id} style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{floor.name}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                          {tables.filter(t => t.floorId === floor.id).map(t => (
                            <button key={t.id} disabled={t.status === "occupied"} onClick={() => { setTable(t); setTableModal(false); }}
                              style={{ padding: "9px 6px", border: "2px solid", borderColor: t.status === "occupied" ? "#ffb347" : table?.id === t.id ? "#1a1a1a" : "#e2ddd7", background: t.status === "occupied" ? "#fff8ec" : table?.id === t.id ? "#1a1a1a" : "#fff", color: t.status === "occupied" ? "#8a6200" : table?.id === t.id ? "#fff" : "#1a1a1a", cursor: t.status === "occupied" ? "not-allowed" : "pointer", fontWeight: 800, fontSize: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                              <span>{t.number}</span>
                              <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>{t.capacity}p</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  <button onClick={() => { setTable(null); setTableModal(false); }} style={{ width: "100%", padding: "10px", border: "2px solid #e2ddd7", background: "#faf9f7", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", marginTop: 4 }}>
                    No Table (Takeaway)
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Payment modal */}
      <AnimatePresence>
        {payStep !== "idle" && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.45)", zIndex: 50 }} onClick={() => payStep === "method" && setPayStep("idle")} />
            <div style={{ position: "fixed", inset: 0, zIndex: 51, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
              <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
                style={{ background: "#fff", border: "2px solid #1a1a1a", width: "100%", maxWidth: 320, padding: 24 }}>
                {payStep === "method" && (
                  <>
                    <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 6 }}>Payment</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: "#ff6b6b", marginBottom: 18 }}>{formatCurrency(total)}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                      {[["cash", "Cash"], ["card", "Card"], ["mobile", "Mobile Banking"]].map(([val, label]) => (
                        <button key={val} onClick={() => setPayMethod(val)} style={{ padding: "11px 14px", border: "2px solid", borderColor: payMethod === val ? "#1a1a1a" : "#e2ddd7", background: payMethod === val ? "#1a1a1a" : "#fff", color: payMethod === val ? "#fff" : "#1a1a1a", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <button onClick={handlePay} style={{ width: "100%", padding: "12px", background: "#ff6b6b", color: "#fff", border: "2px solid #1a1a1a", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                      Confirm Payment
                    </button>
                  </>
                )}
                {payStep === "processing" && (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ width: 44, height: 44, border: "3px solid #e2ddd7", borderTopColor: "#ff6b6b", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Processing...</div>
                    <div style={{ fontSize: 12, color: "#a8a29e" }}>Please wait</div>
                  </div>
                )}
                {payStep === "done" && (
                  <div style={{ textAlign: "center", padding: "12px 0" }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 350, damping: 20 }}
                      style={{ width: 56, height: 56, background: "#edfaf5", border: "2px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 14px" }}>✓</motion.div>
                    <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>Payment Done!</div>
                    {orderNum && <div style={{ fontSize: 12, color: "#a8a29e", marginBottom: 18 }}>Order #{orderNum}</div>}
                    <button onClick={newOrder} style={{ width: "100%", padding: "12px", background: "#1a1a1a", color: "#fff", border: "2px solid #1a1a1a", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                      New Order
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 1023px) {
          .pos-mobile-tabs { display: flex !important; }
          .pos-cart-panel { width: 100% !important; }
          .pos-hidden-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
