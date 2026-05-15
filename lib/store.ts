"use client";

import { create } from "zustand";
import type {
  CartItem,
  Notification,
  Order,
  MenuItem,
  Category,
  Table,
  InventoryItem,
  User,
  ActivityLog,
} from "./types";

interface CartStore {
  items: CartItem[];
  tableId?: string;
  tableNumber?: string;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setTable: (tableId: string, tableNumber: string) => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  tableId: undefined,
  tableNumber: undefined,
  addItem: (item) => {
    const { items } = get();
    const existing = items.find(
      (i) => i.menuItemId === item.menuItemId && i.notes === item.notes
    );
    if (existing) {
      set({
        items: items.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
      });
    } else {
      set({ items: [...items, item] });
    }
  },
  removeItem: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set({
      items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    });
  },
  clearCart: () => set({ items: [], tableId: undefined, tableNumber: undefined }),
  setTable: (tableId, tableNumber) => set({ tableId, tableNumber }),
  total: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setNotifications: (notifications: Notification[]) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (n) => {
    const updated = [n, ...get().notifications];
    set({
      notifications: updated,
      unreadCount: updated.filter((x) => !x.isRead).length,
    });
  },
  markAsRead: (id) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    set({ notifications: updated, unreadCount: updated.filter((x) => !x.isRead).length });
  },
  markAllAsRead: () => {
    set({
      notifications: get().notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    });
  },
  setNotifications: (notifications) => {
    set({
      notifications,
      unreadCount: notifications.filter((x) => !x.isRead).length,
    });
  },
}));

interface DashboardStore {
  orders: Order[];
  menuItems: MenuItem[];
  categories: Category[];
  tables: Table[];
  inventoryItems: InventoryItem[];
  staff: User[];
  activityLogs: ActivityLog[];
  setOrders: (orders: Order[]) => void;
  setMenuItems: (items: MenuItem[]) => void;
  setCategories: (categories: Category[]) => void;
  setTables: (tables: Table[]) => void;
  setInventoryItems: (items: InventoryItem[]) => void;
  setStaff: (staff: User[]) => void;
  setActivityLogs: (logs: ActivityLog[]) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  orders: [],
  menuItems: [],
  categories: [],
  tables: [],
  inventoryItems: [],
  staff: [],
  activityLogs: [],
  setOrders: (orders) => set({ orders }),
  setMenuItems: (menuItems) => set({ menuItems }),
  setCategories: (categories) => set({ categories }),
  setTables: (tables) => set({ tables }),
  setInventoryItems: (inventoryItems) => set({ inventoryItems }),
  setStaff: (staff) => set({ staff }),
  setActivityLogs: (activityLogs) => set({ activityLogs }),
}));
