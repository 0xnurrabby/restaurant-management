import type {
  Category,
  MenuItem,
  Table,
  Floor,
  InventoryItem,
  RestaurantSettings,
} from "./types";
import { generateId } from "./utils";

export const seedCategories: Category[] = [
  {
    id: generateId(),
    name: "Starters",
    description: "Begin your meal with our delicious starters",
    order: 1,
    isActive: true,
    itemCount: 0,
  },
  {
    id: generateId(),
    name: "Main Course",
    description: "Hearty and satisfying main dishes",
    order: 2,
    isActive: true,
    itemCount: 0,
  },
  {
    id: generateId(),
    name: "Pizza",
    description: "Hand-crafted pizzas with fresh ingredients",
    order: 3,
    isActive: true,
    itemCount: 0,
  },
  {
    id: generateId(),
    name: "Burgers",
    description: "Juicy burgers made to order",
    order: 4,
    isActive: true,
    itemCount: 0,
  },
  {
    id: generateId(),
    name: "Salads",
    description: "Fresh and healthy salad options",
    order: 5,
    isActive: true,
    itemCount: 0,
  },
  {
    id: generateId(),
    name: "Beverages",
    description: "Refreshing drinks and beverages",
    order: 6,
    isActive: true,
    itemCount: 0,
  },
  {
    id: generateId(),
    name: "Desserts",
    description: "Sweet endings to your meal",
    order: 7,
    isActive: true,
    itemCount: 0,
  },
];

export function createSeedMenuItems(categories: Category[]): MenuItem[] {
  const catMap = Object.fromEntries(categories.map((c) => [c.name, c.id]));
  const now = new Date().toISOString();

  return [
    { id: generateId(), categoryId: catMap["Starters"], name: "Garlic Bread", description: "Crispy bread with garlic butter and herbs", price: 150, status: "available", isFeatured: false, isPopular: true, tags: ["vegetarian"], addons: [], preparationTime: 8, createdAt: now, updatedAt: now },
    { id: generateId(), categoryId: catMap["Starters"], name: "Chicken Wings", description: "Crispy wings tossed in your choice of sauce", price: 380, status: "available", isFeatured: true, isPopular: true, tags: ["chicken", "spicy"], addons: [{ name: "Extra Sauce", price: 30 }, { name: "Dip", price: 50 }], preparationTime: 15, createdAt: now, updatedAt: now },
    { id: generateId(), categoryId: catMap["Starters"], name: "Soup of the Day", description: "Chef's freshly prepared daily soup", price: 220, status: "available", isFeatured: false, isPopular: false, tags: ["healthy"], addons: [], preparationTime: 10, createdAt: now, updatedAt: now },
    { id: generateId(), categoryId: catMap["Main Course"], name: "Grilled Chicken", description: "Tender grilled chicken with seasonal vegetables", price: 650, status: "available", isFeatured: true, isPopular: true, tags: ["chicken", "healthy"], addons: [{ name: "Extra Sauce", price: 50 }], preparationTime: 20, createdAt: now, updatedAt: now },
    { id: generateId(), categoryId: catMap["Main Course"], name: "Beef Steak", description: "Prime beef steak with mashed potatoes and gravy", price: 1200, status: "available", isFeatured: true, isPopular: true, tags: ["beef", "premium"], addons: [{ name: "Extra Sauce", price: 50 }, { name: "Side Salad", price: 120 }], preparationTime: 25, createdAt: now, updatedAt: now },
    { id: generateId(), categoryId: catMap["Main Course"], name: "Grilled Salmon", description: "Fresh salmon with lemon butter and vegetables", price: 850, status: "available", isFeatured: false, isPopular: false, tags: ["seafood", "healthy"], addons: [], preparationTime: 20, createdAt: now, updatedAt: now },
    { id: generateId(), categoryId: catMap["Pizza"], name: "Margherita Pizza", description: "Classic tomato base with mozzarella and basil", price: 550, status: "available", isFeatured: false, isPopular: true, tags: ["vegetarian"], addons: [{ name: "Extra Cheese", price: 80 }], preparationTime: 18, createdAt: now, updatedAt: now },
    { id: generateId(), categoryId: catMap["Pizza"], name: "BBQ Chicken Pizza", description: "BBQ sauce, grilled chicken, red onion, cheddar", price: 650, status: "available", isFeatured: false, isPopular: false, tags: ["chicken", "bbq"], addons: [{ name: "Extra Toppings", price: 60 }], preparationTime: 20, createdAt: now, updatedAt: now },
    { id: generateId(), categoryId: catMap["Burgers"], name: "Classic Cheeseburger", description: "Beef patty, cheddar, lettuce, tomato, pickles", price: 420, status: "available", isFeatured: false, isPopular: true, tags: ["beef"], addons: [{ name: "Extra Patty", price: 120 }, { name: "Bacon", price: 80 }], preparationTime: 12, createdAt: now, updatedAt: now },
    { id: generateId(), categoryId: catMap["Burgers"], name: "Chicken Burger", description: "Crispy chicken fillet with fresh vegetables", price: 380, status: "available", isFeatured: false, isPopular: false, tags: ["chicken"], addons: [], preparationTime: 12, createdAt: now, updatedAt: now },
    { id: generateId(), categoryId: catMap["Salads"], name: "Caesar Salad", description: "Romaine, parmesan, croutons, caesar dressing", price: 320, status: "available", isFeatured: false, isPopular: true, tags: ["vegetarian", "healthy"], addons: [{ name: "Grilled Chicken", price: 120 }], preparationTime: 8, createdAt: now, updatedAt: now },
    { id: generateId(), categoryId: catMap["Beverages"], name: "Fresh Lemonade", description: "Freshly squeezed lemonade with mint", price: 120, status: "available", isFeatured: false, isPopular: true, tags: ["cold"], addons: [], preparationTime: 3, createdAt: now, updatedAt: now },
    { id: generateId(), categoryId: catMap["Beverages"], name: "Iced Coffee", description: "Cold brew coffee with milk and ice", price: 180, status: "available", isFeatured: false, isPopular: false, tags: ["coffee", "cold"], addons: [{ name: "Extra Shot", price: 40 }], preparationTime: 3, createdAt: now, updatedAt: now },
    { id: generateId(), categoryId: catMap["Beverages"], name: "Mango Juice", description: "Fresh mango blended to perfection", price: 150, status: "available", isFeatured: false, isPopular: true, tags: ["cold", "fresh"], addons: [], preparationTime: 3, createdAt: now, updatedAt: now },
    { id: generateId(), categoryId: catMap["Desserts"], name: "Chocolate Lava Cake", description: "Warm chocolate cake with molten center", price: 280, status: "available", isFeatured: true, isPopular: true, tags: ["chocolate", "dessert"], addons: [{ name: "Ice Cream", price: 60 }], preparationTime: 12, createdAt: now, updatedAt: now },
    { id: generateId(), categoryId: catMap["Desserts"], name: "Cheesecake", description: "Creamy cheesecake with berry compote", price: 250, status: "available", isFeatured: false, isPopular: false, tags: ["dessert"], addons: [], preparationTime: 5, createdAt: now, updatedAt: now },
  ];
}

export function createSeedFloors(): { floors: Floor[]; tables: Table[] } {
  const floor1Id = generateId();
  const floor2Id = generateId();
  const tables: Table[] = [];

  // Ground Floor tables
  for (let i = 1; i <= 8; i++) {
    tables.push({
      id: generateId(),
      number: `G${i}`,
      floorId: floor1Id,
      capacity: i <= 4 ? 2 : i <= 6 ? 4 : 6,
      status: "available",
      x: ((i - 1) % 4) * 200 + 50,
      y: Math.floor((i - 1) / 4) * 200 + 50,
      shape: i <= 4 ? "round" : "square",
    });
  }

  // First Floor tables
  for (let i = 1; i <= 6; i++) {
    tables.push({
      id: generateId(),
      number: `F${i}`,
      floorId: floor2Id,
      capacity: i <= 2 ? 4 : i <= 4 ? 6 : 8,
      status: "available",
      x: ((i - 1) % 3) * 250 + 50,
      y: Math.floor((i - 1) / 3) * 250 + 50,
      shape: i <= 2 ? "square" : "rectangle",
    });
  }

  const floors: Floor[] = [
    {
      id: floor1Id,
      name: "Ground Floor",
      order: 1,
      tables: tables
        .filter((t) => t.floorId === floor1Id)
        .map((t) => t.id),
    },
    {
      id: floor2Id,
      name: "First Floor",
      order: 2,
      tables: tables
        .filter((t) => t.floorId === floor2Id)
        .map((t) => t.id),
    },
  ];

  return { floors, tables };
}

export const seedInventory: InventoryItem[] = [
  {
    id: generateId(),
    name: "Rice",
    unit: "kg",
    quantity: 50,
    minQuantity: 10,
    cost: 1.5,
    category: "Grains",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "Chicken",
    unit: "kg",
    quantity: 25,
    minQuantity: 5,
    cost: 8.0,
    category: "Meat",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "Beef",
    unit: "kg",
    quantity: 20,
    minQuantity: 5,
    cost: 12.0,
    category: "Meat",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "Olive Oil",
    unit: "litre",
    quantity: 8,
    minQuantity: 2,
    cost: 6.0,
    category: "Oil",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "Tomatoes",
    unit: "kg",
    quantity: 15,
    minQuantity: 5,
    cost: 2.0,
    category: "Vegetables",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "Flour",
    unit: "kg",
    quantity: 30,
    minQuantity: 10,
    cost: 0.8,
    category: "Grains",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "Mozzarella",
    unit: "kg",
    quantity: 10,
    minQuantity: 3,
    cost: 9.0,
    category: "Dairy",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "Salmon",
    unit: "kg",
    quantity: 8,
    minQuantity: 2,
    cost: 18.0,
    category: "Seafood",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "Coffee Beans",
    unit: "kg",
    quantity: 3,
    minQuantity: 1,
    cost: 15.0,
    category: "Beverages",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "Lemons",
    unit: "kg",
    quantity: 5,
    minQuantity: 2,
    cost: 1.5,
    category: "Fruits",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const defaultSettings: RestaurantSettings = {
  name: "Zunayed Restaurant",
  tagline: "Fine Dining & Fresh Flavors",
  address: "123 Main Street, Dhaka, Bangladesh",
  phone: "+880 1234-567890",
  email: "hello@zunayedrestaurant.com",
  currency: "BDT",
  taxRate: 5,
  openingHours: [
    { day: "Monday", open: "09:00", close: "22:00", isOpen: true },
    { day: "Tuesday", open: "09:00", close: "22:00", isOpen: true },
    { day: "Wednesday", open: "09:00", close: "22:00", isOpen: true },
    { day: "Thursday", open: "09:00", close: "22:00", isOpen: true },
    { day: "Friday", open: "09:00", close: "23:00", isOpen: true },
    { day: "Saturday", open: "10:00", close: "23:00", isOpen: true },
    { day: "Sunday", open: "10:00", close: "21:00", isOpen: true },
  ],
  theme: "light",
  posSettings: {
    defaultDiscount: 0,
    requireTableForDineIn: true,
    printReceiptByDefault: false,
  },
  notificationSettings: {
    emailNotifications: true,
    soundAlerts: true,
    lowStockThreshold: 5,
  },
};
