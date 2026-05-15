"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { User, UserRole, StaffPermission } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Plus, Pencil, Trash2, X, Shield, Clock, CheckCircle, XCircle } from "lucide-react";

const PERMISSIONS: { key: StaffPermission; label: string; desc: string }[] = [
  { key: "pos", label: "POS System", desc: "Create orders & process payments" },
  { key: "kitchen", label: "Kitchen", desc: "View kitchen orders" },
  { key: "kds", label: "KDS Display", desc: "Kitchen Display System" },
  { key: "tables", label: "Table Management", desc: "Change table status" },
  { key: "menu", label: "Menu", desc: "Manage menu items" },
  { key: "inventory", label: "Inventory", desc: "Update stock levels" },
  { key: "reports", label: "Reports", desc: "View sales reports" },
  { key: "billing", label: "Billing", desc: "Create & process bills" },
  { key: "staff", label: "Staff", desc: "View & manage staff" },
  { key: "settings", label: "Settings", desc: "Restaurant settings" },
  { key: "notifications", label: "Notifications", desc: "View all notifications" },
];

const ROLE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  main_admin: { bg: "#f0eeff", color: "#5b4cd4", border: "#a29bfe" },
  admin:      { bg: "#edf5ff", color: "#1a5fa8", border: "#74b9ff" },
  staff:      { bg: "#faf9f7", color: "#6b6560", border: "#e2ddd7" },
};

export function StaffClient({ initialStaff, currentRole }: { initialStaff: User[]; currentRole: UserRole }) {
  const [staff, setStaff] = useState(initialStaff);
  const [modal, setModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [delUser, setDelUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "staff" as UserRole, permissions: [] as StaffPermission[] });

  const openAdd = () => { setEditUser(null); setForm({ name: "", email: "", role: "staff", permissions: [] }); setModal(true); };
  const openEdit = (u: User) => { setEditUser(u); setForm({ name: u.name, email: u.email, role: u.role, permissions: u.permissions }); setModal(true); };

  const togglePerm = (p: StaffPermission) => {
    setForm(f => ({ ...f, permissions: f.permissions.includes(p) ? f.permissions.filter(x => x !== p) : [...f.permissions, p] }));
  };

  const selectAllPerms = () => setForm(f => ({ ...f, permissions: PERMISSIONS.map(p => p.key) }));
  const clearAllPerms = () => setForm(f => ({ ...f, permissions: [] }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editUser) {
        const res = await fetch(`/api/staff/${encodeURIComponent(editUser.email)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (res.ok) { const d = await res.json(); setStaff(prev => prev.map(s => s.email === editUser.email ? d.user : s)); }
      } else {
        const res = await fetch("/api/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (res.ok) { const d = await res.json(); setStaff(prev => [...prev, d.user]); }
      }
      setModal(false);
    } finally { setLoading(false); }
  };

  const deleteUser = async (u: User) => {
    const res = await fetch(`/api/staff/${encodeURIComponent(u.email)}`, { method: "DELETE" });
    if (res.ok) setStaff(prev => prev.filter(s => s.email !== u.email));
    setDelUser(null);
  };

  const toggleActive = async (u: User) => {
    const res = await fetch(`/api/staff/${encodeURIComponent(u.email)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !u.isActive }) });
    if (res.ok) setStaff(prev => prev.map(s => s.email === u.email ? { ...s, isActive: !u.isActive } : s));
  };

  const isEditable = (u: User) => currentRole === "main_admin" && u.role !== "main_admin";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.02em" }}>Staff Management</h1>
          <p style={{ fontSize: 13, color: "#a8a29e", fontWeight: 600, marginTop: 4 }}>Manage team members and permissions</p>
        </div>
        {currentRole === "main_admin" && (
          <button onClick={openAdd} style={{ padding: "10px 18px", background: "#1a1a1a", color: "#fff", border: "2px solid #1a1a1a", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            + New Staff
          </button>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Staff", value: staff.length, bg: "#faf9f7" },
          { label: "Active", value: staff.filter(s => s.isActive).length, bg: "#edfaf5" },
          { label: "Inactive", value: staff.filter(s => !s.isActive).length, bg: staff.filter(s => !s.isActive).length > 0 ? "#fff0f0" : "#faf9f7" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: "2px solid #1a1a1a", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#1a1a1a" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {staff.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#a8a29e" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#1a1a1a" }}>No staff members yet</div>
          {currentRole === "main_admin" && <button onClick={openAdd} style={{ padding: "10px 20px", background: "#1a1a1a", color: "#fff", border: "2px solid #1a1a1a", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>+ Add First Staff Member</button>}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {staff.map((u, i) => {
            const rc = ROLE_COLORS[u.role] || ROLE_COLORS.staff;
            return (
              <motion.div key={u.email} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 14, opacity: u.isActive ? 1 : 0.6 }}>
                {/* Avatar */}
                <div style={{ width: 44, height: 44, background: "#ff6b6b", border: "2px solid #1a1a1a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: "#fff", flexShrink: 0 }}>
                  {u.name[0]?.toUpperCase() || u.email[0].toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: "#1a1a1a" }}>{u.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 99, border: `1.5px solid ${rc.border}`, background: rc.bg, color: rc.color }}>
                      {u.role === "main_admin" ? "Main Admin" : u.role === "admin" ? "Admin" : "Staff"}
                    </span>
                    {!u.isActive && <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 99, border: "1.5px solid #ff6b6b", background: "#fff0f0", color: "#cc2b2b" }}>Inactive</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#a8a29e", fontWeight: 600, marginBottom: 8 }}>{u.email}</div>

                  {/* Permissions */}
                  {u.role === "staff" && u.permissions.length > 0 && (
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {u.permissions.map(p => {
                        const pInfo = PERMISSIONS.find(x => x.key === p);
                        return <span key={p} style={{ fontSize: 10, fontWeight: 700, background: "#f0eeff", border: "1px solid #a29bfe", borderRadius: 99, padding: "2px 8px", color: "#5b4cd4" }}>{pInfo?.label || p}</span>;
                      })}
                    </div>
                  )}
                  {u.role === "staff" && u.permissions.length === 0 && (
                    <span style={{ fontSize: 11, color: "#a8a29e", fontStyle: "italic" }}>No permissions assigned</span>
                  )}

                  {u.lastLogin && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#a8a29e", marginTop: 6 }}>
                      <Clock size={11} /> Last login: {formatDate(u.lastLogin)}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {isEditable(u) && (
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => toggleActive(u)} title={u.isActive ? "Disable" : "Enable"}
                      style={{ padding: "7px 10px", border: "1.5px solid #e2ddd7", borderRadius: 8, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700 }}>
                      {u.isActive ? <XCircle size={14} color="#cc2b2b" /> : <CheckCircle size={14} color="#52c4a0" />}
                      {u.isActive ? "Disable" : "Enable"}
                    </button>
                    <button onClick={() => openEdit(u)} style={{ padding: "7px 10px", border: "1.5px solid #1a1a1a", borderRadius: 8, background: "#fff", cursor: "pointer" }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setDelUser(u)} style={{ padding: "7px 10px", border: "1.5px solid #ff6b6b", borderRadius: 8, background: "#fff0f0", cursor: "pointer" }}>
                      <Trash2 size={13} color="#cc2b2b" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(26,26,26,0.45)" }} onClick={() => setModal(false)} />
          <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 18, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", position: "relative", zIndex: 1 }}>
            <div style={{ padding: "16px 20px", borderBottom: "2px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 900, fontSize: 15 }}>{editUser ? "Edit Staff Member" : "Add New Staff Member"}</div>
              <button onClick={() => setModal(false)} style={{ width: 28, height: 28, border: "2px solid #1a1a1a", borderRadius: 7, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
            </div>
            <form onSubmit={save} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={labelStyle}>Full Name</div>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inpStyle} />
                </div>
                <div>
                  <div style={labelStyle}>Email</div>
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} disabled={!!editUser} style={{ ...inpStyle, opacity: editUser ? 0.6 : 1 }} />
                </div>
              </div>
              <div>
                <div style={labelStyle}>Role</div>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))} style={inpStyle}>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Permissions — only for staff */}
              {form.role === "staff" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ ...labelStyle, marginBottom: 0, display: "flex", alignItems: "center", gap: 6 }}><Shield size={13} /> Permissions</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" onClick={selectAllPerms} style={{ fontSize: 11, fontWeight: 700, color: "#1a7a5e", background: "#edfaf5", border: "1px solid #52c4a0", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>Select All</button>
                      <button type="button" onClick={clearAllPerms} style={{ fontSize: 11, fontWeight: 700, color: "#cc2b2b", background: "#fff0f0", border: "1px solid #ff6b6b", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>Clear All</button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {PERMISSIONS.map(p => (
                      <label key={p.key} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", border: "1.5px solid", borderColor: form.permissions.includes(p.key) ? "#1a1a1a" : "#e2ddd7", borderRadius: 10, cursor: "pointer", background: form.permissions.includes(p.key) ? "#f5f0e8" : "#fff" }}>
                        <input type="checkbox" checked={form.permissions.includes(p.key)} onChange={() => togglePerm(p.key)} style={{ width: 15, height: 15, marginTop: 1, flexShrink: 0, cursor: "pointer" }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12, color: "#1a1a1a" }}>{p.label}</div>
                          <div style={{ fontSize: 10, color: "#a8a29e", marginTop: 1 }}>{p.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={() => setModal(false)} style={{ flex: 1, padding: "11px", border: "2px solid #1a1a1a", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: "11px", background: "#1a1a1a", color: "#fff", border: "2px solid #1a1a1a", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 800, fontFamily: "inherit" }}>
                  {loading ? "Saving..." : editUser ? "Save Changes" : "Add Staff Member"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete confirm */}
      {delUser && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(26,26,26,0.45)" }} onClick={() => setDelUser(null)} />
          <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 16, padding: 24, maxWidth: 360, width: "100%", position: "relative", zIndex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>Remove Staff Member</div>
            <div style={{ fontSize: 14, color: "#6b6560", marginBottom: 20 }}>Remove <strong>{delUser.name}</strong> from the team? This cannot be undone.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDelUser(null)} style={{ flex: 1, padding: "11px", border: "2px solid #1a1a1a", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>Cancel</button>
              <button onClick={() => deleteUser(delUser)} style={{ flex: 1, padding: "11px", background: "#ff6b6b", color: "#fff", border: "2px solid #ff6b6b", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 800, fontFamily: "inherit" }}>Remove</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 800, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 };
const inpStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "2px solid #1a1a1a", borderRadius: 10, fontSize: 13, outline: "none", fontFamily: "inherit", background: "#faf9f7", boxSizing: "border-box" };
