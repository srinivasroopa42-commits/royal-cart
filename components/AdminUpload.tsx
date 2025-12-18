
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Upload, Image as ImageIcon, Check, Star, TrendingUp, Percent, Save, Trash2, Search, Plus, ChevronRight, ChevronDown, Info, AlertCircle, Package } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Product } from '../types';

interface AdminUploadProps {
  onClose: () => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  productToEdit?: Product | null;
  allProducts: Product[];
  isDarkMode?: boolean;
}

interface FormErrors {
  name?: string;
  price?: string;
  discountPercent?: string;
  image?: string;
  weight?: string;
  rating?: string;
  salesCount?: string;
  stockCount?: string;
}

export const AdminUpload: React.FC<AdminUploadProps> = ({ 
  onClose, 
  onAddProduct, 
  onUpdateProduct,
  onDeleteProduct,
  productToEdit: initialProductToEdit,
  allProducts,
  isDarkMode
}) => {
  const [currentProductToEdit, setCurrentProductToEdit] = useState<Product | null>(initialProductToEdit || null);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [rating, setRating] = useState('4.5');
  const [salesCount, setSalesCount] = useState('0');
  const [stockCount, setStockCount] = useState('10');
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Live calculation of the Original Price (MSRP)
  const calculatedOriginalPrice = useMemo(() => {
    const sPrice = parseFloat(price) || 0;
    const disc = parseFloat(discountPercent) || 0;
    if (disc > 0 && disc < 100) {
      return sPrice / (1 - (disc / 100));
    }
    return sPrice;
  }, [price, discountPercent]);

  // Validation Logic
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) newErrors.name = "Product title is required";
    else if (name.length < 3) newErrors.name = "Title must be at least 3 characters";

    if (!price) newErrors.price = "Price is required";
    else if (parseFloat(price) <= 0) newErrors.price = "Price must be greater than 0";

    const disc = parseFloat(discountPercent);
    if (isNaN(disc) || disc < 0 || disc > 99) newErrors.discountPercent = "Discount must be between 0-99%";

    if (!image) newErrors.image = "Product image is required";

    if (!weight.trim()) newErrors.weight = "Quantity/Weight is required";

    const rat = parseFloat(rating);
    if (isNaN(rat) || rat < 0 || rat > 5) newErrors.rating = "Rating must be between 0 and 5";

    const sales = parseInt(salesCount);
    if (isNaN(sales) || sales < 0) newErrors.salesCount = "Sales count cannot be negative";

    const stock = parseInt(stockCount);
    if (isNaN(stock) || stock < 0) newErrors.stockCount = "Stock count cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate on change if already submitted once
  useEffect(() => {
    if (isSubmitted) {
      validate();
    }
  }, [name, price, discountPercent, image, weight, rating, salesCount, stockCount, isSubmitted]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const populateForm = (product: Product | null) => {
    setErrors({});
    setIsSubmitted(false);
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setCategory(product.category);
      setImage(product.image);
      setDescription(product.description || '');
      setWeight(product.weight || '');
      setRating(product.rating.toString());
      setSalesCount(product.salesCount.toString());
      setStockCount((product.stockCount || 0).toString());
      
      if (product.originalPrice && product.originalPrice > product.price) {
        const disc = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        setDiscountPercent(disc.toString());
      } else {
        setDiscountPercent('0');
      }
    } else {
      setName('');
      setPrice('');
      setCategory(CATEGORIES[0].id);
      setImage('');
      setDescription('');
      setWeight('');
      setRating('4.5');
      setSalesCount('0');
      setStockCount('10');
      setDiscountPercent('0');
    }
  };

  useEffect(() => {
    populateForm(currentProductToEdit);
  }, [currentProductToEdit]);

  const filteredAdminProducts = useMemo(() => {
    if (!adminSearchQuery.trim()) return [];
    const q = adminSearchQuery.toLowerCase();
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.id.toLowerCase().includes(q)
    ).slice(0, 5); 
  }, [adminSearchQuery, allProducts]);

  const handleSelectFromSearch = (product: Product) => {
    setCurrentProductToEdit(product);
    setAdminSearchQuery('');
    setShowResults(false);
  };

  const handleResetToAdd = () => {
    setCurrentProductToEdit(null);
    setAdminSearchQuery('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Please select an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    if (!validate()) {
      return;
    }

    const sellingPrice = parseFloat(price);

    const productData: Product = {
      id: currentProductToEdit ? currentProductToEdit.id : Date.now().toString(),
      name,
      price: sellingPrice,
      category,
      image,
      description: description || name,
      weight: weight || '1 unit',
      tags: [name, category, 'uploaded', ...(description.split(' '))],
      rating: parseFloat(rating) || 4.5,
      salesCount: parseInt(salesCount) || 0,
      stockCount: parseInt(stockCount) || 0,
      originalPrice: calculatedOriginalPrice
    };

    if (currentProductToEdit && onUpdateProduct) {
      onUpdateProduct(productData);
    } else {
      onAddProduct(productData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (currentProductToEdit && onDeleteProduct) {
      onDeleteProduct(currentProductToEdit.id);
    }
  };

  const inputClasses = (error?: string) => `
    w-full p-3 bg-gray-50 dark:bg-slate-800 dark:text-white border rounded-xl 
    focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all
    ${error ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200 dark:border-slate-700'}
  `;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh] transition-colors">
        {/* Modal Header */}
        <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800 shrink-0">
          <div className="flex flex-col">
            <h2 className="font-bold text-lg text-gray-800 dark:text-slate-100">
              {currentProductToEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            {currentProductToEdit && (
              <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 font-bold">MODE: EDITING CATALOG</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentProductToEdit && (
              <button 
                onClick={handleResetToAdd}
                className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 px-2 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1"
              >
                <Plus size={10} /> ADD NEW
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors dark:text-slate-400">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Catalog Search Feature */}
        <div className="px-6 pt-4 shrink-0 relative" ref={searchContainerRef}>
          <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1 block mb-1.5">Search to Edit Existing Product</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              value={adminSearchQuery}
              onChange={(e) => {
                setAdminSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Type product name or ID..."
              className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 pl-10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 dark:text-white outline-none transition-all shadow-inner"
            />
            
            {/* Search Dropdown Results */}
            {showResults && adminSearchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-2xl rounded-2xl z-[70] overflow-hidden animate-fade-in ring-1 ring-black/5 dark:ring-white/5">
                {filteredAdminProducts.length > 0 ? (
                  <div className="p-1.5">
                    <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Matching Products</p>
                    {filteredAdminProducts.map(p => (
                      <button 
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectFromSearch(p)}
                        className="w-full flex items-center gap-3 p-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl text-left transition-all group active:scale-[0.98]"
                      >
                        <div className="h-12 w-12 bg-white dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600 flex items-center justify-center p-1 group-hover:border-indigo-200 shadow-sm transition-colors overflow-hidden">
                            <img src={p.image} className="h-full w-full object-contain" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{p.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className="text-xs font-black text-indigo-500 dark:text-indigo-400">₹{p.price.toFixed(2)}</span>
                             <span className="text-[10px] text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md">{p.weight}</span>
                             <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${p.stockCount <= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                               Stock: {p.stockCount}
                             </span>
                          </div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-gray-300 dark:text-slate-500 group-hover:bg-white dark:group-hover:bg-indigo-500 group-hover:text-indigo-500 dark:group-hover:text-white transition-all">
                            <ChevronRight size={16} />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400 dark:text-slate-500">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search size={20} className="text-gray-300 dark:text-slate-600" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-tight">No products found</p>
                    <p className="text-[10px] mt-1">Try searching with a different keyword</p>
                  </div>
                )}
                <div className="p-2 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex justify-center">
                  <button 
                    type="button"
                    onClick={() => setShowResults(false)} 
                    className="text-[10px] font-black text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 uppercase tracking-widest p-2 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-5 overflow-y-auto no-scrollbar">
          {/* Image Upload Area */}
          <div className="flex flex-col gap-1">
            <label className={`text-xs font-bold uppercase ml-1 ${errors.image ? 'text-red-500' : 'text-gray-500 dark:text-slate-400'}`}>Product Media</label>
            <div 
              onClick={() => !image && fileInputRef.current?.click()}
              className={`group relative w-full h-44 rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center ${
                image 
                  ? 'border-indigo-200 dark:border-indigo-900 bg-gray-50 dark:bg-slate-800' 
                  : `border-gray-300 dark:border-slate-700 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 ${errors.image ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : ''}`
              }`}
            >
              {image ? (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <img src={image} alt="Preview" className="max-w-full max-h-full object-contain drop-shadow-md transition-transform group-hover:scale-105" />
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all"
                    >
                      <Upload size={14} /> Replace Photo
                    </button>
                    <button 
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400 p-6 text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${errors.image ? 'bg-red-100 text-red-500' : 'bg-gray-100 dark:bg-slate-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                    <ImageIcon size={24} />
                  </div>
                  <span className={`text-xs font-bold ${errors.image ? 'text-red-500' : 'text-gray-600 dark:text-slate-300'}`}>Click to upload product image</span>
                  <span className="text-[9px] mt-1 dark:text-slate-500">Supports JPG, PNG, WebP (Max 5MB)</span>
                </div>
              )}
            </div>
            {errors.image && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 ml-1"><AlertCircle size={10} /> {errors.image}</p>}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase ml-1 ${errors.name ? 'text-red-500' : 'text-gray-500 dark:text-slate-400'}`}>Product Title</label>
            <input 
              value={name}
              onChange={e => setName(e.target.value)}
              className={inputClasses(errors.name)}
              placeholder="e.g. Premium Basmati Rice"
            />
            {errors.name && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 ml-1"><AlertCircle size={10} /> {errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className={`text-xs font-bold uppercase ml-1 ${errors.price ? 'text-red-500' : 'text-gray-500 dark:text-slate-400'}`}>Selling Price (₹)</label>
                <input 
                type="number"
                step="0.01"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className={inputClasses(errors.price)}
                placeholder="0.00"
                />
                {errors.price && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 ml-1"><AlertCircle size={10} /> {errors.price}</p>}
            </div>
            <div className="space-y-1">
                <label className={`text-xs font-bold uppercase ml-1 flex items-center gap-1 ${errors.discountPercent ? 'text-red-500' : 'text-gray-500 dark:text-slate-400'}`}>
                  <Percent size={12} className="text-blue-600 dark:text-blue-400" /> Discount (%)
                </label>
                <input 
                type="number"
                min="0"
                max="99"
                value={discountPercent}
                onChange={e => setDiscountPercent(e.target.value)}
                className={inputClasses(errors.discountPercent)}
                placeholder="0"
                />
                {errors.discountPercent && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 ml-1"><AlertCircle size={10} /> {errors.discountPercent}</p>}
            </div>
          </div>

          {/* MSRP Calculation Info Box */}
          {parseFloat(discountPercent) > 0 && parseFloat(discountPercent) < 100 && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 p-3 rounded-xl flex items-start gap-3 animate-fade-in">
                  <Info size={16} className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                      <p className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-wider">MSRP Calculation</p>
                      <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                          Original Price: <span className="font-mono">₹{calculatedOriginalPrice.toFixed(2)}</span>
                      </p>
                      <p className="text-[10px] text-indigo-500 dark:text-indigo-400 leading-tight mt-1">
                          Customers will see a <span className="font-bold">₹{(calculatedOriginalPrice - (parseFloat(price) || 0)).toFixed(2)}</span> saving.
                      </p>
                  </div>
              </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className={`text-xs font-bold uppercase ml-1 ${errors.weight ? 'text-red-500' : 'text-gray-500 dark:text-slate-400'}`}>Quantity/Weight</label>
                <input 
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className={inputClasses(errors.weight)}
                placeholder="e.g. 500ml"
                />
                {errors.weight && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 ml-1"><AlertCircle size={10} /> {errors.weight}</p>}
            </div>
            <div className="space-y-1">
                <label className={`text-xs font-bold uppercase flex items-center gap-1 ml-1 ${errors.stockCount ? 'text-red-500' : 'text-gray-500 dark:text-slate-400'}`}>
                   <Package size={12} className="text-blue-500" /> Available Units
                </label>
                <input 
                type="number"
                value={stockCount}
                onChange={e => setStockCount(e.target.value)}
                className={inputClasses(errors.stockCount)}
                placeholder="10"
                />
                {errors.stockCount && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 ml-1"><AlertCircle size={10} /> {errors.stockCount}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1">Category</label>
                <div className="relative">
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white appearance-none transition-all"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown size={14} />
                  </div>
                </div>
            </div>
            <div className="space-y-1">
                <label className={`text-xs font-bold uppercase flex items-center gap-1 ml-1 ${errors.rating ? 'text-red-500' : 'text-gray-500 dark:text-slate-400'}`}>
                  <Star size={12} className="text-amber-500" /> Catalog Rating
                </label>
                <input 
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={rating}
                onChange={e => setRating(e.target.value)}
                className={inputClasses(errors.rating)}
                placeholder="4.5"
                />
                {errors.rating && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 ml-1"><AlertCircle size={10} /> {errors.rating}</p>}
            </div>
          </div>

           <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1">Brief Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 outline-none h-20 resize-none transition-all text-sm"
              placeholder="Tell customers more about this item..."
            />
          </div>

          <div className="pt-2 flex gap-3 pb-8 shrink-0">
            <button 
              type="submit"
              className="flex-[3] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {currentProductToEdit ? <Save size={20} /> : <Check size={20} />}
              {currentProductToEdit ? 'Save Changes' : 'Confirm & Add to Catalog'}
            </button>
            
            {currentProductToEdit && onDeleteProduct && (
              <button 
                type="button"
                onClick={handleDelete}
                className="flex-1 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/30 active:scale-95"
                title="Delete Product"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
