export type UserRole = "main_admin" | "admin" | "staff" | "customer";

export type StaffPermission =
  | "pos"
  | "kitchen"
  | "inventory"
  | "tables"
  | "reports"
  | "billing"
  | "menu"
  | "staff"
  | "settings"
  | "kds"
  | "notifications";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: StaffPermission[];
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  avatar?: string;
}

export interface Session {
  id: string;
  userId: string;
  email: string;
  role: UserRole;
  permissions: StaffPermission[];
  createdAt: string;
  expiresAt: string;
}

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "cancelled";

export type OrderType = "dine_in" | "takeaway" | "delivery";

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  addons?: string[];
}

export interface Order {
  id: string;
  orderNumber: number;
  tableId?: string;
  tableNumber?: string;
  status: OrderStatus;
  type: OrderType;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  staffId?: string;
  staffName?: string;
  customerId?: string;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
  prepTime?: number;
  paymentMethod?: string;
  isPaid: boolean;
}

export type TableStatus = "available" | "reserved" | "occupied" | "cleaning";

export interface Table {
  id: string;
  number: string;
  floorId: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  reservedBy?: string;
  reservedAt?: string;
  x: number;
  y: number;
  shape: "round" | "square" | "rectangle";
}

export interface Floor {
  id: string;
  name: string;
  order: number;
  tables: string[];
}

export type MenuItemStatus = "available" | "unavailable" | "sold_out";

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  status: MenuItemStatus;
  isFeatured: boolean;
  isPopular: boolean;
  tags: string[];
  addons: { name: string; price: number }[];
  preparationTime: number;
  calories?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  order: number;
  isActive: boolean;
  itemCount: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  cost: number;
  category: string;
  supplier?: string;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityAction =
  | "login"
  | "logout"
  | "create_order"
  | "update_order"
  | "cancel_order"
  | "create_menu_item"
  | "update_menu_item"
  | "delete_menu_item"
  | "create_category"
  | "update_category"
  | "delete_category"
  | "create_staff"
  | "update_staff"
  | "delete_staff"
  | "update_inventory"
  | "update_table"
  | "update_settings"
  | "process_payment"
  | "update_order_status";

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: UserRole;
  action: ActivityAction;
  details: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  device?: string;
  createdAt: string;
  status: "success" | "failure";
}

export interface Notification {
  id: string;
  type:
    | "new_order"
    | "low_stock"
    | "kitchen_ready"
    | "billing"
    | "staff_activity"
    | "system";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  currency: string;
  taxRate: number;
  openingHours: {
    day: string;
    open: string;
    close: string;
    isOpen: boolean;
  }[];
  theme: "light" | "dark";
  posSettings: {
    defaultDiscount: number;
    requireTableForDineIn: boolean;
    printReceiptByDefault: boolean;
  };
  notificationSettings: {
    emailNotifications: boolean;
    soundAlerts: boolean;
    lowStockThreshold: number;
  };
}

export interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  activeTables: number;
  totalTables: number;
  pendingKitchenOrders: number;
  lowStockItems: number;
  activeStaff: number;
}

export interface CartItem extends OrderItem {
  image?: string;
}
