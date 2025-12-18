
import React, { useState } from 'react';
import { X, Sparkles, ChefHat, ArrowRight, Search, Loader2 } from 'lucide-react';
import { smartShopAssist, suggestRecipes } from '../services/geminiService';
import { Product, CartItem } from '../types';

interface SmartAssistantProps {
  onClose: () => void;
  products: Product[];
  cart: CartItem[];
  onAddFromAssistant: (product: Product) => void;
}

export const SmartAssistant: React.FC<SmartAssistantProps> = ({ onClose, products, cart, onAddFromAssistant }) => {
  const [mode, setMode] = useState<'menu' | 'chef' | 'shop'>('menu');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [shopResults, setShopResults] = useState<{ ingredient: string, matches: Product[] }[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);

  // Feature 1: "I want to cook X" -> Finds ingredients
  const handleSmartShop = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setShopResults([]);
    
    try {
      const ingredients = await smartShopAssist(query);
      
      // Basic client-side matching logic
      const results = ingredients.map(ing => {
        // Simple robust matching: check if product name or tags contain the ingredient keyword
        const matches = products.filter(p => 
          p.name.toLowerCase().includes(ing.toLowerCase()) || 
          p.tags.some(t => ing.toLowerCase().includes(t.toLowerCase()))
        );
        return { ingredient: ing, matches };
      });

      setShopResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Feature 2: "What can I cook with my cart?"
  const handleChefAssist = async () => {
    setLoading(true);
    try {
        const ingredients = cart.map(c => c.name);
        if(ingredients.length === 0) {
            // Fallback if empty
            ingredients.push('potato', 'onion', 'bread'); 
        }
        const suggestions = await suggestRecipes(ingredients);
        setRecipes(suggestions);
    } catch(e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-pink-600 to-purple-700 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Sparkles className="text-yellow-300" />
                <h2 className="font-bold text-lg">AI Genius</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
                <X size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            
            {mode === 'menu' && (
                <div className="flex flex-col gap-4 mt-8">
                    <button 
                        onClick={() => setMode('shop')}
                        className="p-6 bg-white rounded-2xl shadow-sm border border-pink-100 hover:border-pink-300 transition-all flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                                <Search size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-gray-800">Smart Shop</h3>
                                <p className="text-sm text-gray-500">"I want to make Pasta..."</p>
                            </div>
                        </div>
                        <ArrowRight className="text-gray-300 group-hover:text-pink-500" />
                    </button>

                    <button 
                         onClick={() => {
                             setMode('chef');
                             handleChefAssist();
                         }}
                        className="p-6 bg-white rounded-2xl shadow-sm border border-purple-100 hover:border-purple-300 transition-all flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <ChefHat size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-gray-800">Chef Assist</h3>
                                <p className="text-sm text-gray-500">Recipes from your cart</p>
                            </div>
                        </div>
                        <ArrowRight className="text-gray-300 group-hover:text-purple-500" />
                    </button>
                </div>
            )}

            {mode === 'shop' && (
                <div className="flex flex-col h-full">
                    <button onClick={() => setMode('menu')} className="text-xs text-gray-500 mb-4 hover:underline">&larr; Back</button>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">What's on your mind?</h3>
                    <div className="flex gap-2 mb-6">
                        <input 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g. Spicy Tacos for 2"
                            className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleSmartShop()}
                        />
                        <button 
                            onClick={handleSmartShop}
                            disabled={loading}
                            className="bg-pink-600 text-white px-4 rounded-xl font-medium disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Go'}
                        </button>
                    </div>

                    <div className="space-y-6">
                        {shopResults.map((item, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-gray-700 capitalize mb-3 flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-pink-500"></span>
                                    {item.ingredient}
                                </h4>
                                {item.matches.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {item.matches.map(p => (
                                            <div key={p.id} onClick={() => onAddFromAssistant(p)} className="flex items-center gap-2 border p-2 rounded-lg cursor-pointer hover:bg-gray-50 active:scale-95 transition-transform">
                                                <img src={p.image} className="h-8 w-8 object-contain" alt="" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium truncate">{p.name}</p>
                                                    <p className="text-xs text-green-600 font-bold">₹{p.price}</p>
                                                </div>
                                                <div className="bg-green-100 text-green-700 p-1 rounded">
                                                    <PlusSmallIcon />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No direct match found in store.</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {mode === 'chef' && (
                <div>
                     <button onClick={() => setMode('menu')} className="text-xs text-gray-500 mb-4 hover:underline">&larr; Back</button>
                     <h3 className="text-xl font-bold text-gray-800 mb-2">Chef Suggestions</h3>
                     <p className="text-sm text-gray-500 mb-6">Based on items in your cart</p>

                     {loading ? (
                         <div className="flex flex-col items-center justify-center py-10 text-purple-600">
                             <Loader2 className="animate-spin mb-2" size={32} />
                             <p className="text-sm font-medium">Cooking up ideas...</p>
                         </div>
                     ) : (
                         <div className="space-y-4">
                             {recipes.map((recipe, idx) => (
                                 <div key={idx} className="bg-white p-5 rounded-xl border shadow-sm">
                                     <h4 className="font-bold text-lg text-purple-900 mb-2">{recipe.title}</h4>
                                     <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
                                     <div className="mb-3">
                                         <p className="text-xs font-bold text-gray-500 uppercase mb-1">You need:</p>
                                         <div className="flex flex-wrap gap-1">
                                             {recipe.missingIngredients?.map((ing: string, i: number) => (
                                                 <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-md border border-red-100">{ing}</span>
                                             ))}
                                             {recipe.missingIngredients?.length === 0 && <span className="text-xs text-green-600">You have everything!</span>}
                                         </div>
                                     </div>
                                     <div className="bg-gray-50 p-3 rounded-lg">
                                         <p className="text-xs font-bold text-gray-500 uppercase mb-2">Instructions:</p>
                                         <span className="text-sm text-gray-700">See instructions in your favorite cooking app.</span>
                                     </div>
                                 </div>
                             ))}
                             {recipes.length === 0 && !loading && (
                                 <div className="text-center py-8 text-gray-500">
                                     <p>Your cart is empty! Add items to get suggestions.</p>
                                 </div>
                             )}
                         </div>
                     )}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

const PlusSmallIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);
