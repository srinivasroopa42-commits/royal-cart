
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Star, TrendingUp, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: (product: Product) => void;
  onRemove: (productId: string) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  isAdmin?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  quantity, 
  onAdd, 
  onRemove, 
  onEdit, 
  onDelete,
  isAdmin 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const isBestSeller = product.salesCount > 100;
  const isOutOfStock = product.stockCount <= 0;

  // Trigger animation when quantity changes (specifically increases)
  useEffect(() => {
    if (quantity > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [quantity]);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    
    // Only show the special success animation when moving from 0 to 1
    if (quantity === 0) {
      setIsAdding(true);
      onAdd(product);
      
      // Delay the switch to quantity selector so user sees the "Success" state
      setTimeout(() => {
        setIsAdding(false);
      }, 450);
    } else {
      onAdd(product);
    }
  };

  return (
    <div className={`flex flex-col bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700 shadow-sm relative group transition-all duration-300 hover:shadow-md ${isOutOfStock ? 'opacity-80' : ''}`}>
       {/* Badges */}
       <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {isOutOfStock ? (
            <div className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 animate-pulse">
              <AlertCircle size={8} /> SOLD OUT
            </div>
          ) : (
            <>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </div>
              )}
              {isBestSeller && (
                <div className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                  <TrendingUp size={8} /> BEST SELLER
                </div>
              )}
            </>
          )}
       </div>

       {/* Admin Actions */}
       {isAdmin && (
         <div className="absolute top-2 right-2 z-10 flex gap-1.5">
            {onEdit && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(product);
                }}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-md p-1.5 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white transition-colors border border-indigo-100 dark:border-slate-600"
                title="Edit Product"
              >
                <Edit2 size={12} />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product.id);
                }}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-md p-1.5 rounded-full text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-colors border border-red-100 dark:border-slate-600"
                title="Delete Product"
              >
                <Trash2 size={12} />
              </button>
            )}
         </div>
       )}

      <div className={`relative h-32 w-full bg-gray-50 dark:bg-slate-700/50 p-2 flex items-center justify-center transition-all ${isOutOfStock ? 'grayscale opacity-60' : ''}`}>
        <img
          src={product.image}
          alt={product.name}
          className="h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {isOutOfStock && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-white/90 dark:bg-slate-900/90 text-[10px] font-black tracking-widest px-3 py-1 rounded-full border border-gray-200 dark:border-slate-700 shadow-xl text-gray-500 dark:text-slate-400">OUT OF STOCK</span>
           </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <div className="text-[10px] text-gray-400 dark:text-slate-400 font-medium bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
            {product.weight}
          </div>
          <div className="flex items-center gap-0.5 text-amber-500">
             <Star size={10} fill="currentColor" />
             <span className="text-[10px] font-bold">{product.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100 leading-tight mb-1 line-clamp-2 min-h-[2.5rem] flex items-start gap-1.5 transition-colors">
          <span className="flex-1">{product.name}</span>
          {quantity > 0 && !isAdding && (
            <span className={`shrink-0 flex items-center justify-center bg-green-600 dark:bg-green-500 text-white text-[10px] font-black h-5 min-w-[20px] px-1 rounded-full shadow-md ring-2 ring-white dark:ring-slate-800 transform transition-transform ${isAnimating ? 'animate-pop' : ''}`}>
              {quantity}
            </span>
          )}
        </h3>
        
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex flex-col">
             <span className="text-sm font-bold text-gray-900 dark:text-slate-50 transition-colors">₹{product.price.toFixed(2)}</span>
             {product.originalPrice && product.originalPrice > product.price && (
               <span className="text-xs text-gray-400 dark:text-slate-500 line-through">₹{product.originalPrice.toFixed(2)}</span>
             )}
          </div>

          <div className="flex items-center justify-end min-w-[70px]">
            {isOutOfStock ? (
              <button
                disabled
                className="px-2 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 text-[10px] font-black rounded-lg uppercase border border-gray-200 dark:border-slate-600 w-full opacity-50 cursor-not-allowed"
              >
                Stock Out
              </button>
            ) : quantity === 0 || isAdding ? (
              <button
                onClick={handleAddClick}
                disabled={isAdding}
                className={`px-4 py-1.5 border text-xs font-bold rounded-lg uppercase shadow-sm transition-all flex items-center justify-center gap-1.5 min-w-[64px] active:scale-90
                  ${isAdding 
                    ? 'bg-green-600 border-green-600 text-white animate-pop' 
                    : 'bg-white dark:bg-slate-800 border-green-600 dark:border-green-500 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-slate-700'
                  }`}
              >
                {isAdding ? <Check size={14} strokeWidth={4} /> : 'Add'}
              </button>
            ) : (
              <div className={`flex items-center bg-green-600 dark:bg-green-600 rounded-lg shadow-md overflow-hidden transition-all ${isAnimating ? 'animate-pop ring-2 ring-green-300 dark:ring-green-900/50' : ''}`}>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(product.id); }}
                  className="px-2 py-1.5 text-white hover:bg-green-700 dark:hover:bg-green-500 active:bg-green-800 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-white text-xs font-bold px-1 w-5 text-center transition-all">
                  {quantity}
                </span>
                <button
                  onClick={handleAddClick}
                  className="px-2 py-1.5 text-white hover:bg-green-700 dark:hover:bg-green-500 active:bg-green-800 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
