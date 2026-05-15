"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { MenuItem, Category } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Layers, Search, Star, TrendingUp, ToggleLeft, ToggleRight } from "lucide-react";

interface MenuClientProps {
  initialCategories: Category[];
  initialItems: MenuItem[];
}

export function MenuClient({ initialCategories, initialItems }: MenuClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [activeTab, setActiveTab] = useState<"items" | "categories">("items");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [itemModal, setItemModal] = useState(false);
  const [catModal, setCatModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Item form state
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    image: "",
    status: "available" as MenuItem["status"],
    isFeatured: false,
    isPopular: false,
    preparationTime: "15",
    calories: "",
    tags: "",
  });

  const [catForm, setCatForm] = useState({ name: "", description: "" });

  const filteredItems = items.filter((item) => {
    const matchCat = selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openItemModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        categoryId: item.categoryId,
        image: item.image || "",
        status: item.status,
        isFeatured: item.isFeatured,
        isPopular: item.isPopular,
        preparationTime: item.preparationTime.toString(),
        calories: item.calories?.toString() || "",
        tags: item.tags.join(", "),
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: "",
        description: "",
        price: "",
        categoryId: categories[0]?.id || "",
        image: "",
        status: "available",
        isFeatured: false,
        isPopular: false,
        preparationTime: "15",
        calories: "",
        tags: "",
      });
    }
    setItemModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...itemForm,
      price: parseFloat(itemForm.price),
      preparationTime: parseInt(itemForm.preparationTime),
      calories: itemForm.calories ? parseInt(itemForm.calories) : undefined,
      tags: itemForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      if (editingItem) {
        const res = await fetch(`/api/menu/items/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setItems((prev) => prev.map((i) => (i.id === editingItem.id ? data.item : i)));
        }
      } else {
        const res = await fetch("/api/menu/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setItems((prev) => [...prev, data.item]);
        }
      }
      setItemModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const res = await fetch(`/api/menu/items/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
    setDeleteConfirm(null);
  };

  const handleToggleStatus = async (item: MenuItem) => {
    const newStatus = item.status === "available" ? "unavailable" : "available";
    const res = await fetch(`/api/menu/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)));
    }
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCat) {
        const res = await fetch(`/api/menu/categories/${editingCat.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(catForm),
        });
        if (res.ok) {
          const data = await res.json();
          setCategories((prev) => prev.map((c) => (c.id === editingCat.id ? data.category : c)));
        }
      } else {
        const res = await fetch("/api/menu/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(catForm),
        });
        if (res.ok) {
          const data = await res.json();
          setCategories((prev) => [...prev, data.category]);
        }
      }
      setCatModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Menu Management"
        description="Manage categories and menu items"
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditingCat(null);
                setCatForm({ name: "", description: "" });
                setCatModal(true);
              }}
            >
              <Plus size={14} />
              Category
            </Button>
            <Button size="sm" onClick={() => openItemModal()}>
              <Plus size={14} />
              Item
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(["items", "categories"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border-2 capitalize transition-all ${
              activeTab === tab
                ? "bg-black text-white border-black"
                : "bg-white border-stone-200 text-stone-600 hover:border-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "items" && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              icon={<Search size={15} />}
              className="sm:max-w-xs"
            />
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
                  selectedCategory === "all"
                    ? "bg-black text-white border-black"
                    : "bg-white border-stone-200 hover:border-stone-400"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
                    selectedCategory === cat.id
                      ? "bg-black text-white border-black"
                      : "bg-white border-stone-200 hover:border-stone-400"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <EmptyState
              icon={<Layers size={24} />}
              title="No items found"
              description="Add your first menu item"
              action={<Button onClick={() => openItemModal()}>Add Item</Button>}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="overflow-hidden p-0">
                    {item.image && (
                      <div className="h-32 bg-stone-100 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                          <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        {item.isFeatured && (
                          <Badge variant="warning">
                            <Star size={9} className="mr-0.5" />
                            Featured
                          </Badge>
                        )}
                        {item.isPopular && (
                          <Badge variant="info">
                            <TrendingUp size={9} className="mr-0.5" />
                            Popular
                          </Badge>
                        )}
                        <Badge
                          variant={item.status === "available" ? "success" : "danger"}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-bold">
                          {formatCurrency(item.price)}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Toggle availability"
                          >
                            {item.status === "available" ? (
                              <ToggleRight size={16} className="text-green-600" />
                            ) : (
                              <ToggleLeft size={16} className="text-stone-400" />
                            )}
                          </button>
                          <button
                            onClick={() => openItemModal(item)}
                            className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "categories" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{cat.name}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{cat.description}</p>
                    <p className="text-xs text-stone-400 mt-1">
                      {items.filter((i) => i.categoryId === cat.id).length} items
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingCat(cat);
                        setCatForm({ name: cat.name, description: cat.description || "" });
                        setCatModal(true);
                      }}
                      className="p-1.5 hover:bg-stone-100 rounded-lg"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          {categories.length === 0 && (
            <EmptyState
              icon={<Layers size={24} />}
              title="No categories"
              description="Create your first category"
            />
          )}
        </div>
      )}

      {/* Item Modal */}
      <Modal
        isOpen={itemModal}
        onClose={() => setItemModal(false)}
        title={editingItem ? "Edit Item" : "Add Menu Item"}
        size="lg"
      >
        <form onSubmit={handleSaveItem} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Name"
              value={itemForm.name}
              onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              value={itemForm.price}
              onChange={(e) => setItemForm((f) => ({ ...f, price: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
            <textarea
              value={itemForm.description}
              onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border-2 border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black resize-none"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
              <select
                value={itemForm.categoryId}
                onChange={(e) => setItemForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="w-full border-2 border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Status</label>
              <select
                value={itemForm.status}
                onChange={(e) => setItemForm((f) => ({ ...f, status: e.target.value as MenuItem["status"] }))}
                className="w-full border-2 border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="sold_out">Sold Out</option>
              </select>
            </div>
          </div>
          <Input
            label="Image URL"
            value={itemForm.image}
            onChange={(e) => setItemForm((f) => ({ ...f, image: e.target.value }))}
            placeholder="https://..."
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Prep Time (min)"
              type="number"
              value={itemForm.preparationTime}
              onChange={(e) => setItemForm((f) => ({ ...f, preparationTime: e.target.value }))}
            />
            <Input
              label="Calories"
              type="number"
              value={itemForm.calories}
              onChange={(e) => setItemForm((f) => ({ ...f, calories: e.target.value }))}
              placeholder="Optional"
            />
          </div>
          <Input
            label="Tags (comma separated)"
            value={itemForm.tags}
            onChange={(e) => setItemForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="vegetarian, spicy, popular"
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={itemForm.isFeatured}
                onChange={(e) => setItemForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={itemForm.isPopular}
                onChange={(e) => setItemForm((f) => ({ ...f, isPopular: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Popular</span>
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setItemModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={loading}>
              {editingItem ? "Save Changes" : "Add Item"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={catModal}
        onClose={() => setCatModal(false)}
        title={editingCat ? "Edit Category" : "Add Category"}
        size="sm"
      >
        <form onSubmit={handleSaveCat} className="p-4 space-y-3">
          <Input
            label="Category Name"
            value={catForm.name}
            onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))}
            required
            autoFocus
          />
          <Input
            label="Description"
            value={catForm.description}
            onChange={(e) => setCatForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional"
          />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setCatModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={loading}>
              {editingCat ? "Save" : "Add"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Item"
        size="sm"
      >
        <div className="p-4">
          <p className="text-sm text-stone-600 mb-4">
            Are you sure you want to delete this item? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={() => deleteConfirm && handleDeleteItem(deleteConfirm)}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
