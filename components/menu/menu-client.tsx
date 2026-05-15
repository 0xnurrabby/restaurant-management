"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { MenuItem, Category } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight, Search } from "lucide-react";

interface Props { initialCategories: Category[]; initialItems: MenuItem[]; }

const EMPTY_ITEM = { name: "", description: "", price: "", categoryId: "", image: "", status: "available" as MenuItem["status"], isFeatured: false, isPopular: false, preparationTime: "15", tags: "" };
const EMPTY_CAT = { name: "", description: "" };

export function MenuClient({ initialCategories, initialItems }: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [tab, setTab] = useState<"items" | "categories">("items");
  const [selCat, setSelCat] = useState("all");
  const [search, setSearch] = useState("");

  // Item modal
  const [itemModal, setItemModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [iForm, setIForm] = useState(EMPTY_ITEM);
  const [iLoading, setILoading] = useState(false);

  // Category modal
  const [catModal, setCatModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [cForm, setCForm] = useState(EMPTY_CAT);
  const [cLoading, setCLoading] = useState(false);

  // Delete confirm
  const [delItem, setDelItem] = useState<MenuItem | null>(null);
  const [delCat, setDelCat] = useState<Category | null>(null);

  const filtered = items.filter(i => {
    const matchCat = selCat === "all" || i.categoryId === selCat;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  /* ── Item CRUD ── */
  const openAdd = () => { setEditItem(null); setIForm({ ...EMPTY_ITEM, categoryId: categories[0]?.id || "" }); setItemModal(true); };
  const openEdit = (item: MenuItem) => { setEditItem(item); setIForm({ name: item.name, description: item.description, price: String(item.price), categoryId: item.categoryId, image: item.image || "", status: item.status, isFeatured: item.isFeatured, isPopular: item.isPopular, preparationTime: String(item.preparationTime), tags: item.tags.join(", ") }); setItemModal(true); };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault(); setILoading(true);
    const payload = { ...iForm, price: parseFloat(iForm.price), preparationTime: parseInt(iForm.preparationTime), tags: iForm.tags.split(",").map(t => t.trim()).filter(Boolean), image: iForm.image || undefined };
    try {
      if (editItem) {
        const res = await fetch(`/api/menu/items/${editItem.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (res.ok) { const d = await res.json(); setItems(prev => prev.map(i => i.id === editItem.id ? d.item : i)); }
      } else {
        const res = await fetch("/api/menu/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (res.ok) { const d = await res.json(); setItems(prev => [...prev, d.item]); }
      }
      setItemModal(false);
    } finally { setILoading(false); }
  };

  const deleteItem = async (item: MenuItem) => {
    const res = await fetch(`/api/menu/items/${item.id}`, { method: "DELETE" });
    if (res.ok) setItems(prev => prev.filter(i => i.id !== item.id));
    setDelItem(null);
  };

  const toggleStatus = async (item: MenuItem) => {
    const newStatus = item.status === "available" ? "unavailable" : "available";
    const res = await fetch(`/api/menu/items/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
    if (res.ok) setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
  };

  /* ── Category CRUD ── */
  const openAddCat = () => { setEditCat(null); setCForm(EMPTY_CAT); setCatModal(true); };
  const openEditCat = (c: Category) => { setEditCat(c); setCForm({ name: c.name, description: c.description || "" }); setCatModal(true); };

  const saveCat = async (e: React.FormEvent) => {
    e.preventDefault(); setCLoading(true);
    try {
      if (editCat) {
        const res = await fetch(`/api/menu/categories/${editCat.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cForm) });
        if (res.ok) { const d = await res.json(); setCategories(prev => prev.map(c => c.id === editCat.id ? d.category : c)); }
      } else {
        const res = await fetch("/api/menu/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cForm) });
        if (res.ok) { const d = await res.json(); setCategories(prev => [...prev, d.category]); }
      }
      setCatModal(false);
    } finally { setCLoading(false); }
  };

  const deleteCat = async (cat: Category) => {
    const res = await fetch(`/api/menu/categories/${cat.id}`, { method: "DELETE" });
    if (res.ok) setCategories(prev => prev.filter(c => c.id !== cat.id));
    setDelCat(null);
  };

  const statusBadge = (s: string) => ({ background: s === "available" ? "#edfaf5" : "#fff0f0", color: s === "available" ? "#1a7a5e" : "#cc2b2b", border: `1.5px solid ${s === "available" ? "#52c4a0" : "#ff6b6b"}`, borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 800 });

  return (
    <div>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.02em" }}>Menu Management</h1>
          <p style={{ fontSize: 13, color: "#a8a29e", fontWeight: 600, marginTop: 4 }}>Manage categories and menu items</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {tab === "categories"
            ? <button onClick={openAddCat} style={addBtn}>+ Add Category</button>
            : <button onClick={openAdd} style={addBtn}>+ Add Item</button>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["items", "categories"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "2px solid", borderColor: tab === t ? "#1a1a1a" : "#e2ddd7", background: tab === t ? "#1a1a1a" : "#fff", color: tab === t ? "#fff" : "#6b6560", cursor: "pointer" }}>
            {t === "items" ? "Items" : "Categories"}
          </button>
        ))}
      </div>

      {tab === "items" && (
        <>
          {/* Filters */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ position: "relative", maxWidth: 260 }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#a8a29e" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." style={{ padding: "9px 12px 9px 32px", border: "2px solid #1a1a1a", borderRadius: 10, fontSize: 13, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[{ id: "all", name: "All" }, ...categories].map(c => (
                <button key={c.id} onClick={() => setSelCat(c.id)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "2px solid", borderColor: selCat === c.id ? "#1a1a1a" : "#e2ddd7", background: selCat === c.id ? "#1a1a1a" : "#fff", color: selCat === c.id ? "#fff" : "#6b6560", cursor: "pointer" }}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#a8a29e" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No items found</div>
              <div style={{ fontSize: 13, marginBottom: 16 }}>Add your first menu item</div>
              <button onClick={openAdd} style={addBtn}>+ Add Item</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {filtered.map((item, idx) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                  style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 14, padding: "16px 16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Image placeholder or image */}
                  {item.image ? (
                    <div style={{ height: 120, borderRadius: 10, overflow: "hidden", background: "#f5f0e8", border: "1.5px solid #e2ddd7" }}>
                      <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
                    </div>
                  ) : (
                    <div style={{ height: 80, borderRadius: 10, background: "#f5f0e8", border: "1.5px dashed #d4cdc3", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 24 }}>🍽️</span>
                       <span style={{ fontSize: 10, color: "#a8a29e", fontWeight: 600 }}>No image</span>
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#1a1a1a", lineHeight: 1.3 }}>{item.name}</div>
                      <span style={statusBadge(item.status)}>{item.status === "available" ? "Available" : "Unavailable"}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#a8a29e", lineHeight: 1.5, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.description}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      {item.isFeatured && <span style={{ ...tagStyle, background: "#fff3d4", color: "#8a6200", borderColor: "#ffb347" }}>Featured</span>}
                      {item.isPopular && <span style={{ ...tagStyle, background: "#fff0f0", color: "#cc2b2b", borderColor: "#ff6b6b" }}>Popular</span>}
                      <span style={{ fontWeight: 900, fontSize: 15, color: "#ff6b6b", marginLeft: "auto" }}>{formatCurrency(item.price)}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6, borderTop: "1.5px solid #f5f0e8", paddingTop: 10 }}>
                    <button onClick={() => toggleStatus(item)} style={{ flex: 1, padding: "7px", border: "1.5px solid #e2ddd7", borderRadius: 8, background: "#faf9f7", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      {item.status === "available" ? <ToggleRight size={14} color="#52c4a0" /> : <ToggleLeft size={14} color="#a8a29e" />}
                      {item.status === "available" ? "On" : "Off"}
                    </button>
                    <button onClick={() => openEdit(item)} style={{ padding: "7px 12px", border: "1.5px solid #1a1a1a", borderRadius: 8, background: "#fff", cursor: "pointer" }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setDelItem(item)} style={{ padding: "7px 12px", border: "1.5px solid #ff6b6b", borderRadius: 8, background: "#fff0f0", cursor: "pointer" }}>
                      <Trash2 size={13} color="#cc2b2b" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "categories" && (
        <>
          {categories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#a8a29e" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>No categories yet</div>
              <button onClick={openAddCat} style={addBtn}>+ Add Category</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {categories.map((cat, idx) => (
                <motion.div key={cat.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                  style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 14, padding: "18px 18px 14px" }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#1a1a1a", marginBottom: 4 }}>{cat.name}</div>
                  <div style={{ fontSize: 13, color: "#a8a29e", marginBottom: 10 }}>{cat.description || "No description"}</div>
                  <div style={{ fontSize: 12, color: "#6b6560", fontWeight: 600, marginBottom: 12 }}>
                    {items.filter(i => i.categoryId === cat.id).length} items
                  </div>
                  <div style={{ display: "flex", gap: 8, borderTop: "1.5px solid #f5f0e8", paddingTop: 12 }}>
                    <button onClick={() => openEditCat(cat)} style={{ flex: 1, padding: "8px", border: "1.5px solid #1a1a1a", borderRadius: 8, background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => setDelCat(cat)} style={{ padding: "8px 12px", border: "1.5px solid #ff6b6b", borderRadius: 8, background: "#fff0f0", cursor: "pointer" }}>
                      <Trash2 size={12} color="#cc2b2b" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Item Modal ── */}
      {itemModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(26,26,26,0.45)" }} onClick={() => setItemModal(false)} />
          <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 18, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", position: "relative", zIndex: 1 }}>
            <div style={{ padding: "16px 20px", borderBottom: "2px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 900, fontSize: 15 }}>{editItem ? "Edit Item" : "Add New Item"}</div>
              <button onClick={() => setItemModal(false)} style={{ width: 28, height: 28, border: "2px solid #1a1a1a", borderRadius: 7, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
            </div>
            <form onSubmit={saveItem} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>{label("Name")} <input required value={iForm.name} onChange={e => setIForm(f => ({ ...f, name: e.target.value }))} style={inp} /></div>
                <div>{label("Price (\u09F3)")} <input required type="number" min={0} value={iForm.price} onChange={e => setIForm(f => ({ ...f, price: e.target.value }))} style={inp} /></div>
              </div>
              <div>{label("Description")} <textarea value={iForm.description} onChange={e => setIForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inp, resize: "vertical" }} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>{label("Category")}
                  <select required value={iForm.categoryId} onChange={e => setIForm(f => ({ ...f, categoryId: e.target.value }))} style={inp}>
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>{label("Status")}
                  <select value={iForm.status} onChange={e => setIForm(f => ({ ...f, status: e.target.value as MenuItem["status"] }))} style={inp}>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="sold_out">Sold Out</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>{label("Prep Time (min)")} <input type="number" min={1} value={iForm.preparationTime} onChange={e => setIForm(f => ({ ...f, preparationTime: e.target.value }))} style={inp} /></div>
                <div>{label("Tags (comma separated)")} <input value={iForm.tags} onChange={e => setIForm(f => ({ ...f, tags: e.target.value }))} placeholder="chicken, spicy" style={inp} /></div>
              </div>
              <div>{label("Image URL (optional)")} <input type="url" value={iForm.image} onChange={e => setIForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." style={inp} /></div>
              <div style={{ display: "flex", gap: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  <input type="checkbox" checked={iForm.isFeatured} onChange={e => setIForm(f => ({ ...f, isFeatured: e.target.checked }))} style={{ width: 16, height: 16 }} /> Featured
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  <input type="checkbox" checked={iForm.isPopular} onChange={e => setIForm(f => ({ ...f, isPopular: e.target.checked }))} style={{ width: 16, height: 16 }} /> Popular
                </label>
              </div>
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={() => setItemModal(false)} style={secBtn}>Cancel</button>
                <button type="submit" disabled={iLoading} style={priBtn}>{iLoading ? "Saving..." : editItem ? "Save Changes" : "Add Item"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── Category Modal ── */}
      {catModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(26,26,26,0.45)" }} onClick={() => setCatModal(false)} />
          <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 18, width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }}>
            <div style={{ padding: "16px 20px", borderBottom: "2px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 900, fontSize: 15 }}>{editCat ? "Edit Category" : "New Category"}</div>
              <button onClick={() => setCatModal(false)} style={{ width: 28, height: 28, border: "2px solid #1a1a1a", borderRadius: 7, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
            </div>
            <form onSubmit={saveCat} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>{label("Category Name")} <input required value={cForm.name} onChange={e => setCForm(f => ({ ...f, name: e.target.value }))} autoFocus style={inp} /></div>
              <div>{label("Description (optional)")} <input value={cForm.description} onChange={e => setCForm(f => ({ ...f, description: e.target.value }))} style={inp} /></div>
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={() => setCatModal(false)} style={secBtn}>Cancel</button>
                <button type="submit" disabled={cLoading} style={priBtn}>{cLoading ? "Saving..." : editCat ? "Save" : "Add"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Item confirm */}
      {delItem && <DeleteModal title="Delete Item" msg={`Delete "${delItem.name}"?`} onCancel={() => setDelItem(null)} onConfirm={() => deleteItem(delItem)} />}
      {delCat && <DeleteModal title="Delete Category" msg={`Delete category "${delCat.name}"?`} onCancel={() => setDelCat(null)} onConfirm={() => deleteCat(delCat)} />}
    </div>
  );
}

function DeleteModal({ title, msg, onCancel, onConfirm }: { title: string; msg: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(26,26,26,0.45)" }} onClick={onCancel} />
      <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 16, padding: 24, maxWidth: 360, width: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>{title}</div>
        <div style={{ fontSize: 14, color: "#6b6560", marginBottom: 20 }}>{msg} This action cannot be undone.</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={secBtn}>Cancel</button>
          <button onClick={onConfirm} style={{ ...priBtn, background: "#ff6b6b", borderColor: "#ff6b6b" }}>Delete</button>
        </div>
      </motion.div>
    </div>
  );
}

// Shared styles
const addBtn: React.CSSProperties = { padding: "10px 18px", background: "#1a1a1a", color: "#fff", border: "2px solid #1a1a1a", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer" };
const secBtn: React.CSSProperties = { flex: 1, padding: "11px", border: "2px solid #1a1a1a", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" };
const priBtn: React.CSSProperties = { flex: 1, padding: "11px", background: "#1a1a1a", color: "#fff", border: "2px solid #1a1a1a", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 800, fontFamily: "inherit" };
const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "2px solid #1a1a1a", borderRadius: 10, fontSize: 13, outline: "none", fontFamily: "inherit", background: "#faf9f7", boxSizing: "border-box" };
const tagStyle: React.CSSProperties = { fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 8px", border: "1px solid" };
const label = (text: string) => <div style={{ fontSize: 11, fontWeight: 800, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{text}</div>;

