
import { Category, Product, Recipe } from './types';

export const CATEGORIES: Category[] = [
  { id: 'fruits-veg', name: 'Fruits & Veg', icon: '🥦', color: 'bg-green-100' },
  { id: 'dairy', name: 'Dairy, Bread & Eggs', icon: '🥛', color: 'bg-blue-100' },
  { id: 'staples', name: 'Rice, Atta, Oil & Dals', icon: '🌾', color: 'bg-yellow-100' },
  { id: 'spices', name: 'Masala & Dry Fruits', icon: '🌶️', color: 'bg-red-100' },
  { id: 'snacks', name: 'Snacks', icon: '🍿', color: 'bg-orange-100' },
  { id: 'packaged', name: 'Packed Food', icon: '🥫', color: 'bg-amber-100' },
  { id: 'beverages', name: 'Beverages', icon: '🥤', color: 'bg-purple-100' },
  { id: 'tea-coffee', name: 'Tea & Coffee', icon: '☕', color: 'bg-stone-100' },
  { id: 'household', name: 'Household Essentials', icon: '🧺', color: 'bg-cyan-100' },
  { id: 'personal-care', name: 'Bath & Body', icon: '🧴', color: 'bg-rose-100' },
  { id: 'kitchen', name: 'Kitchen & Dining', icon: '🍳', color: 'bg-gray-200' },
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Fresh Cavendish Bananas',
    price: 45,
    originalPrice: 60,
    image: 'https://images.unsplash.com/photo-1571771894821-ad99026107b8?auto=format&fit=crop&q=80&w=200',
    category: 'fruits-veg',
    weight: '500g',
    description: 'Fresh and ripe yellow bananas.',
    tags: ['banana', 'fruit', 'fresh'],
    rating: 4.8,
    salesCount: 1200,
    stockCount: 50
  },
  {
    id: '2',
    name: 'Amul Taaza Toned Milk',
    price: 27,
    originalPrice: 28,
    image: 'https://images.unsplash.com/photo-1550583724-125581cc255b?auto=format&fit=crop&q=80&w=200',
    category: 'dairy',
    weight: '500ml',
    description: 'Fresh toned milk from Amul.',
    tags: ['milk', 'dairy', 'amul'],
    rating: 4.9,
    salesCount: 5000,
    stockCount: 0 // Out of stock example
  },
  {
    id: '3',
    name: 'Lays Magic Masala Chips',
    price: 20,
    originalPrice: 20,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=200',
    category: 'snacks',
    weight: '40g',
    description: 'India\'s favorite spicy potato chips.',
    tags: ['chips', 'snacks', 'lays', 'potato'],
    rating: 4.5,
    salesCount: 3200,
    stockCount: 100
  },
  {
    id: '4',
    name: 'Red Onions',
    price: 35,
    originalPrice: 50,
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=200',
    category: 'fruits-veg',
    weight: '1kg',
    description: 'Fresh quality red onions.',
    tags: ['onion', 'vegetable', 'staple'],
    rating: 4.7,
    salesCount: 2500,
    stockCount: 75
  }
];

export const MOCK_RECIPES: Recipe[] = [
  {
    title: "Quick Fruit Salad",
    ingredients: ["Fresh Banana", "Red Apple", "Orange Juice"],
    instructions: ["Chop fruits", "Mix in bowl", "Pour juice", "Serve chilled"]
  }
];
