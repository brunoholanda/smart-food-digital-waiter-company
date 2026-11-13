export type Role = 'RESTAURANT_OWNER' | 'ADMIN';

export type RestaurantStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export type CuisineType =
  | 'BRAZILIAN'
  | 'ITALIAN'
  | 'JAPANESE'
  | 'CHINESE'
  | 'MEXICAN'
  | 'ARABIC'
  | 'FAST_FOOD'
  | 'PIZZA'
  | 'BURGER'
  | 'SEAFOOD'
  | 'VEGETARIAN'
  | 'VEGAN'
  | 'STEAKHOUSE'
  | 'CAFE'
  | 'BAKERY'
  | 'HEALTHY'
  | 'OTHER';

export type PriceType = 'FIXED' | 'FROM' | 'VARIABLE';

export type OrderStatus = 'AWAITING_PAYMENT' | 'PAID' | 'CANCELLED' | 'REFUNDED';

export type KitchenStatus =
  | 'QUEUED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'PIX' | 'CARD' | 'CASH';

export type ActiveKitchenStatus = 'QUEUED' | 'PREPARING' | 'READY';

export interface KitchenStats {
  queued: number;
  preparing: number;
  ready: number;
}

export interface KitchenOrderItem {
  id?: string;
  name: string;
  quantity: number;
  notes?: string | null;
  variationName?: string | null;
  addonsJson?: string[] | null;
  lineTotal: number | string;
}

export interface KitchenOrder {
  id: string;
  code: string;
  tableNumber?: number | null;
  customerName?: string | null;
  notes?: string | null;
  kitchenStatus: KitchenStatus | null;
  paymentMethod?: PaymentMethod | null;
  total: number | string;
  queuedAt?: string | null;
  preparingAt?: string | null;
  readyAt?: string | null;
  deliveredAt?: string | null;
  updatedAt?: string;
  createdAt?: string;
  items: KitchenOrderItem[];
  table?: {
    id: string;
    number: number;
    label?: string | null;
    code: string;
  } | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  restaurant?: Restaurant | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OpeningHour {
  id?: string;
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  basePrice: number | string;
  priceType: PriceType;
  promotionalPrice?: number | string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  prepTimeMin?: number | null;
  calories?: number | null;
  servesPeople?: number | null;
  spicyLevel: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  allergens: string[];
  tags: string[];
  variations?: ItemVariation[];
  addonGroups?: ItemAddonGroup[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemVariation {
  id: string;
  itemId: string;
  name: string;
  price: number | string;
  isDefault: boolean;
  sortOrder: number;
}

export interface ItemAddon {
  id: string;
  groupId: string;
  name: string;
  price: number | string;
  isAvailable: boolean;
  sortOrder: number;
}

export interface ItemAddonGroup {
  id: string;
  itemId: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  sortOrder: number;
  addons: ItemAddon[];
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  items?: MenuItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Restaurant {
  id: string;
  slug: string;
  tradeName: string;
  legalName?: string | null;
  document?: string | null;
  email: string;
  phone: string;
  whatsapp?: string | null;
  description?: string | null;
  cuisineType: CuisineType;
  status: RestaurantStatus;
  rejectionReason?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  coverColor?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  instagram?: string | null;
  website?: string | null;
  minOrderValue?: number | string | null;
  deliveryFee?: number | string | null;
  estimatedTime?: string | null;
  acceptsDelivery: boolean;
  acceptsPickup: boolean;
  acceptsDineIn: boolean;
  isPublished: boolean;
  tableOrderingEnabled?: boolean;
  ownerId: string;
  openingHours?: OpeningHour[];
  categories?: MenuCategory[];
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string | null;
}

export interface PublicRestaurantListItem {
  id: string;
  slug: string;
  tradeName: string;
  description?: string | null;
  cuisineType: CuisineType;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  city?: string | null;
  state?: string | null;
  estimatedTime?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterPayload {
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  tradeName: string;
  legalName?: string;
  document?: string;
  whatsapp?: string;
  description?: string;
  cuisineType?: CuisineType;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateItemPayload {
  categoryId: string;
  name: string;
  description?: string;
  basePrice: number;
  priceType?: PriceType;
  promotionalPrice?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  prepTimeMin?: number;
  calories?: number;
  servesPeople?: number;
  spicyLevel?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  allergens?: string[];
  tags?: string[];
}

export type UpdateItemPayload = Partial<CreateItemPayload>;

export interface UpdateRestaurantPayload {
  tradeName?: string;
  legalName?: string;
  document?: string;
  phone?: string;
  whatsapp?: string;
  description?: string;
  cuisineType?: CuisineType;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  instagram?: string;
  website?: string;
  coverColor?: string;
  estimatedTime?: string;
  minOrderValue?: number;
  deliveryFee?: number;
  acceptsDelivery?: boolean;
  acceptsPickup?: boolean;
  acceptsDineIn?: boolean;
  isPublished?: boolean;
}

export interface UpdateOpeningHoursPayload {
  hours: Array<{
    dayOfWeek: number;
    opensAt: string;
    closesAt: string;
    isClosed: boolean;
  }>;
}

export interface Table {
  id: string;
  number: number;
  label?: string | null;
  code: string;
  isActive: boolean;
  menuUrl: string;
  qrPayload: string;
  restaurantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TablesListResponse {
  restaurantId: string;
  slug: string;
  tradeName: string;
  tableOrderingEnabled: boolean;
  menuUrl: string;
  tables: Table[];
}

export interface PublicTableContext {
  restaurantId: string;
  slug: string;
  tradeName: string;
  tableOrderingEnabled: boolean;
  table: {
    id: string;
    number: number;
    label?: string | null;
    code: string;
  };
}

export interface CreateTablePayload {
  number: number;
  label?: string;
}

export interface BulkCreateTablesPayload {
  from: number;
  to: number;
}

export interface UpdateTablePayload {
  number?: number;
  label?: string;
  isActive?: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId?: string | null;
  name: string;
  description?: string | null;
  unitPrice: number | string;
  quantity: number;
  notes?: string | null;
  variationName?: string | null;
  addonsJson?: string[] | null;
  lineTotal: number | string;
}

export interface Order {
  id: string;
  code: string;
  restaurantId: string;
  tableId?: string | null;
  tableNumber?: number | null;
  customerName?: string | null;
  customerPhone?: string | null;
  notes?: string | null;
  status: OrderStatus;
  kitchenStatus?: KitchenStatus | null;
  paymentMethod?: PaymentMethod | null;
  paymentRef?: string | null;
  subtotal: number | string;
  total: number | string;
  paidAt?: string | null;
  queuedAt?: string | null;
  preparingAt?: string | null;
  readyAt?: string | null;
  deliveredAt?: string | null;
  items?: OrderItem[];
  table?: {
    id: string;
    number: number;
    label?: string | null;
    code: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderItemPayload {
  menuItemId: string;
  quantity: number;
  notes?: string;
  variationName?: string;
  addonNames?: string[];
}

export interface CreateOrderPayload {
  restaurantSlug: string;
  tableCode: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  items: CreateOrderItemPayload[];
}

export interface PayOrderPayload {
  method: PaymentMethod;
  paymentRef?: string;
}
