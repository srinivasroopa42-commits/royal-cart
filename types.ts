
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  weight: string;
  description: string;
  tags: string[]; // For AI matching
  rating: number; // 0 to 5
  salesCount: number; // For popularity sorting
  stockCount: number; // Inventory tracking
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'out-for-delivery' | 'delivered';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: CartItem[];
  total: number;
  timestamp: number;
  status: OrderStatus;
  paymentMethod?: 'UPI' | 'COD';
  upiTransactionId?: string;
}

export interface StoreSettings {
  upiId?: string;
  upiQrCode?: string; // base64 image
  storeName: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  matchScore?: number; // How many ingredients match current stock
}

export interface UserProfile {
  name: string;
  phone: string;
  address: string;
  role: 'user' | 'admin';
}

export type ViewState = 'home' | 'search' | 'smart-assistant';
export type SortOption = 'relevance' | 'price-low' | 'price-high' | 'popularity' | 'rating' | 'discount';
