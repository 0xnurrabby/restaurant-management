"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { User, UserRole, StaffPermission } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Users, Plus, Pencil, Trash2, Shield, Clock } from "lucide-react";

interface StaffClientProps {
  initialStaff: User[];
  currentRole: UserRole;
}

const allPermissions: { key: StaffPermission; label: string }[] = [
  { key: "pos", label: "POS" },
  { key: "kitchen", label: "Kitchen" },
  { key: "kds", label: "KDS" },
  { key: "inventory", label: "Inventory" },
  { key: "tables", label: "Tables" },
  { key: "reports", label: "Reports" },
  { key: "billing", label: "Billing" },
  { key: "menu", label: "Menu" },
  { key: "staff", label: "Staff" },
  { key: "settings", label: "Settings" },
  { key: "notifications", label: "Notifications" },
];

const roleColors: Record<string, string> = {
  main_admin: "bg-purple-50 text-purple-700 border-purple-200",
  admin: "bg-blue-50 text-blue-700 border-blue-200",
  staff: "bg-stone-50 text-stone-700 border-stone-200",
};

export function StaffClient({ initialStaff, currentRole }: StaffClientProps) {
  const [staff, setStaff] = useState(initialStaff);
  const [modal, setModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "staff" as UserRole,
    permissions: [] as StaffPermission[],
  });

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setForm({
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      });
    } else {
      setEditingUser(null);
      setForm({ name: "", email: "", role: "staff", permissions: [] });
    }
    setModal(true);
  };

  const togglePermission = (perm: StaffPermission) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter((p) => p !== perm)
        : [...f.permissions, perm],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingUser) {
        const res = await fetch(`/api/staff/${encodeURIComponent(editingUser.email)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const data = await res.json();
          setStaff((prev) => prev.map((s) => (s.email === editingUser.email ? data.user : s)));
        }
      } else {
        const res = await fetch("/api/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const data = await res.json();
          setStaff((prev) => [...prev, data.user]);
        }
      }
      setModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    const res = await fetch(`/api/staff/${encodeURIComponent(user.email)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setStaff((prev) => prev.filter((s) => s.email !== user.email));
    }
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (user: User) => {
    const res = await fetch(`/api/staff/${encodeURIComponent(user.email)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    if (res.ok) {
      setStaff((prev) =>
        prev.map((s) => (s.email === user.email ? { ...s, isActive: !user.isActive } : s))
      );
    }
  };

  return (
    <div>
      <PageHeader
        title="Staff Management"
        description="Manage team members and permissions"
        action={
          currentRole === "main_admin" && (
            <Button size="sm" onClick={() => openModal()}>
              <Plus size={14} />
              Add Staff
            </Button>
          )
        }
      />

      {staff.length === 0 ? (
        <EmptyState
          icon={<Users size={24} />}
          title="No staff members"
          description="Add your first team member"
          action={
            currentRole === "main_admin" && (
              <Button onClick={() => openModal()}>Add Staff Member</Button>
            )
          }
        />
      ) : (
        <div className="space-y-2">
          {staff.map((member, i) => (
            <motion.div
              key={member.email}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className={`${!member.isActive ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-200 rounded-xl flex items-center justify-center text-base font-bold shrink-0">
                    {member.name[0]?.toUpperCase() || member.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{member.name}</span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-lg border capitalize ${
                          roleColors[member.role] || roleColors.staff
                        }`}
                      >
                        {member.role.replace("_", " ")}
                      </span>
                      {!member.isActive && (
                        <Badge variant="danger">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{member.email}</p>
                    {member.permissions.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {member.permissions.slice(0, 4).map((p) => (
                          <Badge key={p} variant="info" className="text-[10px]">
                            {p}
                          </Badge>
                        ))}
                        {member.permissions.length > 4 && (
                          <span className="text-[10px] text-stone-400">
                            +{member.permissions.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="text-right text-xs text-stone-400 mr-2">
                      {member.lastLogin && (
                        <>
                          <Clock size={10} className="inline mr-0.5" />
                          {formatDate(member.lastLogin)}
                        </>
                      )}
                    </div>
                    {currentRole === "main_admin" && member.role !== "main_admin" && (
                      <>
                        <button
                          onClick={() => handleToggleActive(member)}
                          className={`px-2 py-1 rounded-lg text-xs font-medium border-2 transition-all ${
                            member.isActive
                              ? "border-stone-200 hover:border-stone-400 text-stone-600"
                              : "border-green-200 bg-green-50 text-green-700 hover:border-green-400"
                          }`}
                        >
                          {member.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => openModal(member)}
                          className="p-1.5 hover:bg-stone-100 rounded-lg"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(member)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editingUser ? "Edit Staff Member" : "Add Staff Member"}
        size="md"
      >
        <form onSubmit={handleSave} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              disabled={!!editingUser}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
              className="w-full border-2 border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {form.role === "staff" && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2 flex items-center gap-1.5">
                <Shield size={14} />
                Permissions
              </label>
              <div className="grid grid-cols-3 gap-2">
                {allPermissions.map((perm) => (
                  <label
                    key={perm.key}
                    className="flex items-center gap-2 cursor-pointer p-2 border-2 border-stone-200 rounded-xl hover:border-stone-400 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(perm.key)}
                      onChange={() => togglePermission(perm.key)}
                      className="rounded"
                    />
                    <span className="text-xs font-medium">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={loading}>
              {editingUser ? "Save Changes" : "Add Member"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Remove Staff" size="sm">
        <div className="p-4">
          <p className="text-sm text-stone-600 mb-4">
            Remove <strong>{deleteConfirm?.name}</strong> from the team?
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
