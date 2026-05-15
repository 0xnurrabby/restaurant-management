"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MenuItem, Category, Table, Floor, CartItem } from "@/lib/types";
import { formatCurrency, generateId } from "@/lib/utils";
import { Search, Plus, Minus, Trash2, X } from "lucide-react";

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

  const handlePay = async () => {
    setPayStep("processing");
    await new Promise(r => setTimeout(r, 1800));
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId: table?.id, tableNumber: table?.number, type: table ? "dine_in" : "takeaway", items: cart, subtotal, tax, discount: discountAmt, total, notes, isPaid: true, paymentMethod: payMethod }),
      });
      if (res.ok) { const d = await res.json(); setOrderNum(d.order?.orderNumber); }
    } catch {}
    setPayStep("done");
  };

  const newOrder = () => { setCart([]); setTable(null); setDiscount(0); setNotes(""); setPayStep("idle"); setOrderNum(null); };

  return (
    <div style={{ display: "flex", gap: 16, height: "calc(100vh - 80px)", minHeight: 500 }}>

      {/* ── LEFT: Menu panel ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
        {/* Search + Table */}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#a8a29e", pointerEvents: "none" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="আইটেম খুঁজুন..." style={{ width: "100%", padding: "10px 12px 10px 34px", border: "2px solid #1a1a1a", borderRadius: 10, fontSize: 13, outline: "none", fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }} />
          </div>
          <button onClick={() => setTableModal(true)} style={{ flexShrink: 0, padding: "10px 16px", border: "2px solid #1a1a1a", borderRadius: 10, fontSize: 13, fontWeight: 700, background: table ? "#1a1a1a" : "#fff", color: table ? "#fff" : "#1a1a1a", cursor: "pointer", whiteSpace: "nowrap" }}>
            {table ? `টেবিল ${table.number}` : "+ টেবিল"}
          </button>
        </div>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", flexShrink: 0 }}>
          {[{ id: "all", name: "সব আইটেম" }, ...categories].map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "2px solid", borderColor: cat === c.id ? "#1a1a1a" : "#e2ddd7", background: cat === c.id ? "#1a1a1a" : "#fff", color: cat === c.id ? "#fff" : "#6b6560", cursor: "pointer" }}>
              {c.name}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, alignContent: "start" }}>
          {filtered.map(item => (
            <motion.button key={item.id} whileTap={{ scale: 0.96 }} onClick={() => addItem(item)}
              style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 12, padding: "14px 12px", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 6 }}>
              {/* No image placeholder */}
              <div style={{ width: 36, height: 36, background: "#f5f0e8", border: "1.5px solid #e2ddd7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🍽️</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a", lineHeight: 1.3 }}>{item.name}</div>
              <div style={{ fontWeight: 900, fontSize: 14, color: "#ff6b6b" }}>{formatCurrency(item.price)}</div>
              {item.isPopular && <span style={{ fontSize: 10, background: "#fff3d4", border: "1px solid #1a1a1a", borderRadius: 99, padding: "2px 8px", fontWeight: 700, color: "#8a6200", alignSelf: "flex-start" }}>জনপ্রিয়</span>}
            </motion.button>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "#a8a29e", fontSize: 13, fontWeight: 600 }}>কোনো আইটেম পাওয়া যায়নি</div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Cart panel ── */}
      <div style={{ width: 320, flexShrink: 0, background: "#fff", border: "2px solid #1a1a1a", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Cart header */}
        <div style={{ padding: "14px 16px", borderBottom: "2px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 15, color: "#1a1a1a" }}>বর্তমান অর্ডার</div>
            {table && <div style={{ fontSize: 11, color: "#a8a29e", fontWeight: 600, marginTop: 2 }}>টেবিল {table.number} · {table.capacity} জন</div>}
          </div>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} style={{ fontSize: 11, color: "#cc2b2b", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>সব মুছুন</button>
          )}
        </div>

        {/* Cart items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
          {cart.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
              <div style={{ fontSize: 32 }}>🛒</div>
              <div style={{ fontSize: 13, color: "#a8a29e", fontWeight: 600 }}>মেনু থেকে আইটেম যোগ করুন</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "#faf9f7", border: "1.5px solid #e2ddd7", borderRadius: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#a8a29e", fontWeight: 600, marginTop: 2 }}>{formatCurrency(item.price)} প্রতিটি</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, background: "#f5f0e8", border: "1.5px solid #1a1a1a", borderRadius: 6, cursor: "pointer", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                    <span style={{ fontWeight: 800, fontSize: 13, width: 20, textAlign: "center" }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{ width: 24, height: 24, background: "#1a1a1a", border: "1.5px solid #1a1a1a", borderRadius: 6, cursor: "pointer", color: "#fff", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 13, color: "#1a1a1a", minWidth: 52, textAlign: "right" }}>{formatCurrency(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discount + notes */}
        {cart.length > 0 && (
          <div style={{ padding: "10px 14px", borderTop: "1.5px solid #e2ddd7", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="number" value={discount || ""} onChange={e => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))} placeholder="ছাড় %" min={0} max={100} style={{ flex: 1, padding: "8px 10px", border: "1.5px solid #1a1a1a", borderRadius: 8, fontSize: 12, outline: "none", fontFamily: "inherit" }} />
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="রান্নাঘরের নোট..." style={{ flex: 2, padding: "8px 10px", border: "1.5px solid #1a1a1a", borderRadius: 8, fontSize: 12, outline: "none", fontFamily: "inherit" }} />
            </div>
          </div>
        )}

        {/* Summary + Pay */}
        {cart.length > 0 && (
          <div style={{ padding: "12px 16px", borderTop: "2px solid #1a1a1a" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b6560", fontWeight: 600 }}><span>সাবটোটাল</span><span>{formatCurrency(subtotal)}</span></div>
              {discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#52c4a0", fontWeight: 700 }}><span>ছাড় ({discount}%)</span><span>−{formatCurrency(discountAmt)}</span></div>}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b6560", fontWeight: 600 }}><span>ভ্যাট (5%)</span><span>{formatCurrency(tax)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, color: "#1a1a1a", fontWeight: 900, paddingTop: 8, borderTop: "1.5px solid #e2ddd7", marginTop: 3 }}><span>মোট</span><span style={{ color: "#ff6b6b" }}>{formatCurrency(total)}</span></div>
            </div>
            <button onClick={() => setPayStep("method")} style={{ width: "100%", padding: "13px", background: "#ff6b6b", color: "#fff", border: "2px solid #1a1a1a", borderRadius: 11, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
              💳 পেমেন্ট করুন · {formatCurrency(total)}
            </button>
          </div>
        )}
      </div>

      {/* Table selection modal */}
      <AnimatePresence>
        {tableModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.45)", zIndex: 50 }} onClick={() => setTableModal(false)} />
            <div style={{ position: "fixed", inset: 0, zIndex: 51, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 30 }}
                style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 18, width: "100%", maxWidth: 500, maxHeight: "80vh", overflow: "auto" }}>
                <div style={{ padding: "16px 20px", borderBottom: "2px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 900, fontSize: 15 }}>টেবিল বেছে নিন</div>
                  <button onClick={() => setTableModal(false)} style={{ width: 28, height: 28, border: "2px solid #1a1a1a", borderRadius: 7, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
                </div>
                <div style={{ padding: 16 }}>
                  {floors.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#a8a29e", padding: "24px 0", fontSize: 13 }}>কোনো ফ্লোর কনফিগার করা নেই</p>
                  ) : floors.map(floor => (
                    <div key={floor.id} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{floor.name}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                        {tables.filter(t => t.floorId === floor.id).map(t => (
                          <button key={t.id} disabled={t.status === "occupied"} onClick={() => { setTable(t); setTableModal(false); }}
                            style={{ padding: "10px 8px", border: "2px solid", borderColor: t.status === "occupied" ? "#ffb347" : table?.id === t.id ? "#1a1a1a" : "#e2ddd7", borderRadius: 10, background: t.status === "occupied" ? "#fff8ec" : table?.id === t.id ? "#1a1a1a" : "#fff", color: t.status === "occupied" ? "#8a6200" : table?.id === t.id ? "#fff" : "#1a1a1a", cursor: t.status === "occupied" ? "not-allowed" : "pointer", fontWeight: 800, fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                            <span>{t.number}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>{t.capacity}জন</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => { setTable(null); setTableModal(false); }} style={{ width: "100%", padding: "11px", border: "2px solid #e2ddd7", borderRadius: 10, background: "#faf9f7", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", marginTop: 4 }}>
                    টেবিল ছাড়া (টেকওয়ে)
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
            <div style={{ position: "fixed", inset: 0, zIndex: 51, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 30 }}
                style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 18, width: "100%", maxWidth: 360, padding: 28 }}>

                {payStep === "method" && (
                  <>
                    <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>পেমেন্ট করুন</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#ff6b6b", marginBottom: 20 }}>{formatCurrency(total)}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                      {[["cash", "💵 নগদ"], ["card", "💳 কার্ড"], ["mobile", "📱 মোবাইল ব্যাংকিং"]].map(([val, label]) => (
                        <button key={val} onClick={() => setPayMethod(val)} style={{ padding: "12px 16px", border: "2px solid", borderColor: payMethod === val ? "#1a1a1a" : "#e2ddd7", borderRadius: 11, background: payMethod === val ? "#1a1a1a" : "#fff", color: payMethod === val ? "#fff" : "#1a1a1a", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <button onClick={handlePay} style={{ width: "100%", padding: "13px", background: "#ff6b6b", color: "#fff", border: "2px solid #1a1a1a", borderRadius: 11, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                      পেমেন্ট নিশ্চিত করুন
                    </button>
                  </>
                )}

                {payStep === "processing" && (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div style={{ width: 48, height: 48, border: "3px solid #e2ddd7", borderTopColor: "#ff6b6b", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>প্রক্রিয়াকরণ হচ্ছে...</div>
                    <div style={{ fontSize: 13, color: "#a8a29e" }}>একটু অপেক্ষা করুন</div>
                  </div>
                )}

                {payStep === "done" && (
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 350, damping: 20 }}
                      style={{ width: 64, height: 64, background: "#edfaf5", border: "2px solid #1a1a1a", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>✓</motion.div>
                    <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 6 }}>পেমেন্ট সফল!</div>
                    {orderNum && <div style={{ fontSize: 13, color: "#a8a29e", marginBottom: 20 }}>অর্ডার নং #{orderNum}</div>}
                    <button onClick={newOrder} style={{ width: "100%", padding: "13px", background: "#1a1a1a", color: "#fff", border: "2px solid #1a1a1a", borderRadius: 11, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                      নতুন অর্ডার
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
