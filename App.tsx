
import React, { useState, useEffect, useMemo, useRef } from 'react';
/* Added ShoppingCart and ClipboardList to the lucide-react imports to resolve errors */
import { ShoppingBag, ShoppingCart, Search, Clock, ChevronRight, X, Filter, ArrowUpDown, MapPin, Check, RotateCcw, Phone, Navigation, Loader2, PartyPopper, PackageCheck, AlertCircle, ExternalLink, Crosshair, QrCode, CreditCard, Banknote, Settings, Plus, LayoutDashboard, ClipboardList } from 'lucide-react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { SmartAssistant } from './components/SmartAssistant';
import { AdminUpload } from './components/AdminUpload';
import { AdminOrders } from './components/AdminOrders';
import { AdminSettings } from './components/AdminSettings';
import { LoginScreen } from './components/LoginScreen';
import { CATEGORIES, PRODUCTS as DEFAULT_PRODUCTS } from './constants';
import { Product, CartItem, UserProfile, SortOption, Order, OrderStatus, StoreSettings } from './types';
import { getAddressSuggestions, AddressSuggestion } from './services/geminiService';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | undefined>(() => {
    const saved = localStorage.getItem('userCoords');
    return saved ? JSON.parse(saved) : undefined;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('storeProducts');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('storeOrders');
    return saved ? JSON.parse(saved) : [];
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('storeSettings');
    return saved ? JSON.parse(saved) : { storeName: 'RoyalCart' };
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('shoppingCart');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  // Payment Flow State
  const [paymentStep, setPaymentStep] = useState<'checkout' | 'method' | 'upi_qr' | 'processing'>('checkout');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD' | null>(null);
  const [upiTxnId, setUpiTxnId] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  
  const [tempAddress, setTempAddress] = useState('');
  const [tempPhone, setTempPhone] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ phone?: string; address?: string }>({});
  
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [view, setView] = useState<'home' | 'search'>('home');
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  
  const [address, setAddress] = useState(() => {
    const savedAddress = localStorage.getItem('deliveryAddress');
    if (savedAddress && savedAddress !== 'Set Location') return savedAddress;
    return (userProfile && userProfile.address !== 'Set Location' ? userProfile.address : 'Set Location');
  });

  const [phoneNumber, setPhoneNumber] = useState(() => {
    return userProfile ? userProfile.phone : '+91 ';
  });

  useEffect(() => {
    if (navigator.geolocation && !userCoords) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        localStorage.setItem('userCoords', JSON.stringify(coords));
      }, (err) => console.log("Geolocation ignored:", err));
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('storeProducts', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('deliveryAddress', address);
  }, [address]);

  useEffect(() => {
    localStorage.setItem('storeOrders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('storeSettings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  const validateAddressForm = () => {
    const errors: { phone?: string; address?: string } = {};
    const phoneDigits = tempPhone.replace(/\D/g, '');
    
    if (!tempPhone.trim() || tempPhone.trim() === '+91') {
      errors.phone = "Phone number is required";
    } else if (phoneDigits.length < 10) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!tempAddress.trim() || tempAddress === 'Set Location') {
      errors.address = "Address is required";
    } else if (tempAddress.trim().length < 10) {
      errors.address = "Please provide more building details (House #, Wing, etc.)";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (isAddressModalOpen) {
      validateAddressForm();
    }
  }, [tempPhone, tempAddress, isAddressModalOpen]);

  const handleLogin = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setAddress(profile.address);
    setPhoneNumber(profile.phone);
  };

  const handleLogout = () => {
    setUserProfile(null);
    localStorage.removeItem('userProfile');
    localStorage.removeItem('shoppingCart');
    localStorage.removeItem('deliveryAddress');
    localStorage.removeItem('userCoords');
    setCart([]); 
    setAddress('Set Location');
    setPhoneNumber('+91 ');
    setUserCoords(undefined);
  };

  const openAddressModal = () => {
    setTempAddress(address === 'Set Location' ? '' : address);
    setTempPhone(phoneNumber === '' ? '+91 ' : phoneNumber);
    setAddressSearch('');
    setAddressSuggestions([]);
    setValidationErrors({});
    setIsAddressModalOpen(true);
  };

  const handleAddressSearchChange = (val: string) => {
    setAddressSearch(val);
    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    
    if (val.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setIsFetchingSuggestions(true);
    addressDebounceRef.current = setTimeout(async () => {
      const suggestions = await getAddressSuggestions(val, userCoords);
      setAddressSuggestions(suggestions);
      setIsFetchingSuggestions(false);
    }, 600);
  };

  const selectAddressSuggestion = (suggestion: AddressSuggestion) => {
    setTempAddress(suggestion.address);
    setAddressSearch('');
    setAddressSuggestions([]);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserCoords(coords);
        localStorage.setItem('userCoords', JSON.stringify(coords));
        
        try {
          const suggestions = await getAddressSuggestions("Precise delivery address including building name and house/flat number", coords);
          if (suggestions.length > 0) {
            setTempAddress(suggestions[0].address);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        alert("Unable to retrieve your location. Please type your address manually.");
        setIsLocating(false);
      }
    );
  };

  const saveNewAddress = () => {
    if (validateAddressForm()) {
      setAddress(tempAddress.trim());
      setPhoneNumber(tempPhone.trim());
      
      if (userProfile) {
        const updatedProfile: UserProfile = {
          ...userProfile,
          address: tempAddress.trim(),
          phone: tempPhone.trim()
        };
        setUserProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      }
      
      setIsAddressModalOpen(false);
    }
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const finalizeOrder = async () => {
    if (!userProfile || !paymentMethod) return;

    setIsProcessingPayment(true);
    setPaymentStep('processing');
    
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: userProfile.name,
      customerPhone: phoneNumber,
      address: address,
      items: [...cart],
      total: cartTotal + 5.00,
      timestamp: Date.now(),
      status: 'pending',
      paymentMethod: paymentMethod,
      upiTransactionId: paymentMethod === 'UPI' ? upiTxnId : undefined
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setOrders(prev => [newOrder, ...prev]);
    setIsProcessingPayment(false);
    setShowPaymentSuccess(true);
    setShowCartDrawer(false);
    setCart([]); 
    setPaymentStep('checkout');
    setPaymentMethod(null);
    setUpiTxnId('');
    
    setTimeout(() => setShowPaymentSuccess(false), 4000);
  };

  const handlePayClick = () => {
    const isAddressMissing = !address || address.trim() === '' || address === 'Set Location';
    const isPhoneInvalid = !phoneNumber || phoneNumber.replace(/\D/g, '').length < 10;

    if (isAddressMissing || isPhoneInvalid) {
      alert("⚠️ Detailed address or mobile number is missing. Please update delivery details.");
      openAddressModal();
      return;
    }
    
    setPaymentStep('method');
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (activeCategory !== 'all') result = result.filter(p => p.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.tags.some(t => t.includes(q)));
    }
    if (priceFilter === 'under-100') result = result.filter(p => p.price < 100);
    else if (priceFilter === '100-500') result = result.filter(p => p.price >= 100 && p.price <= 500);
    else if (priceFilter === 'above-500') result = result.filter(p => p.price > 500);

    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'popularity': result.sort((a, b) => b.salesCount - a.salesCount); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'discount':
        result.sort((a, b) => {
          const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return discB - discA;
        });
        break;
    }
    return result;
  }, [activeCategory, searchQuery, products, sortBy, priceFilter]);

  if (!userProfile) {
    return <LoginScreen onLogin={handleLogin} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />;
  }

  const isAdmin = userProfile.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans pb-24 relative transition-colors duration-300">
      <Header 
        cartCount={cartItemCount} 
        onCartClick={() => setShowCartDrawer(true)} 
        onSearchClick={() => { setView('search'); setActiveCategory('all'); }}
        onAssistantClick={() => setIsAssistantOpen(true)}
        onUploadClick={() => setIsUploadOpen(true)}
        onOrdersClick={() => setIsOrdersOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        address={address}
        onAddressClick={openAddressModal}
        onLogout={handleLogout}
        userName={userProfile.name}
        isAdmin={isAdmin}
        pendingOrdersCount={orders.filter(o => o.status === 'pending').length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <main className="p-4 space-y-6">
        {view === 'home' && !searchQuery && (
          <>
            {/* Promo Banners */}
            <div className="overflow-x-auto no-scrollbar flex gap-4 -mx-4 px-4 py-2">
                <div className="min-w-[280px] h-40 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-5 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
                    <div className="z-10">
                        <h3 className="font-bold text-xl mb-1 text-white">Fresh Veggies</h3>
                        <p className="text-teal-100 text-sm">Farm Fresh Quality</p>
                        <button onClick={() => setActiveCategory('fruits-veg')} className="mt-4 bg-white text-teal-700 px-4 py-1.5 rounded-lg text-xs font-bold shadow-md">SHOP NOW</button>
                    </div>
                </div>
                <div className="min-w-[280px] h-40 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl p-5 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
                    <div className="z-10">
                        <h3 className="font-bold text-xl mb-1 text-white">Dairy Deals</h3>
                        <p className="text-blue-100 text-sm">Essentials for Daily Life</p>
                        <button onClick={() => setActiveCategory('dairy')} className="mt-4 bg-white text-blue-700 px-4 py-1.5 rounded-lg text-xs font-bold shadow-md">SHOP NOW</button>
                    </div>
                </div>
            </div>

            {/* Admin Quick Actions Bar */}
            {isAdmin && (
               <div className="animate-fade-in bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <LayoutDashboard size={18} />
                    <h3 className="text-sm font-black uppercase tracking-widest">Store Manager Dashboard</h3>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsUploadOpen(true)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-md group"
                    >
                      <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                      <span className="text-xs">Add New Product</span>
                    </button>
                    <button 
                      onClick={() => setIsOrdersOpen(true)}
                      className="flex-1 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                    >
                      <ClipboardList size={24} />
                      <span className="text-xs">Manage Orders</span>
                    </button>
                  </div>
               </div>
            )}

            {/* Categories */}
            <div>
                <h2 className="font-bold text-lg text-gray-800 dark:text-slate-100 mb-3">Shop by Category</h2>
                <div className="grid grid-cols-4 gap-3">
                {CATEGORIES.map(cat => (
                    <button 
                    key={cat.id} 
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${activeCategory === cat.id ? 'bg-indigo-50 dark:bg-indigo-900/40 ring-2 ring-indigo-500' : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                    >
                    <div className={`h-14 w-14 rounded-full ${cat.color} dark:bg-slate-700 flex items-center justify-center text-2xl shadow-sm`}>
                        {cat.icon}
                    </div>
                    <span className="text-xs font-medium text-center text-gray-700 dark:text-slate-200 leading-tight">{cat.name}</span>
                    </button>
                ))}
                </div>
            </div>
          </>
        )}

        {/* Product Listing */}
        <div className="animate-fade-in space-y-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg text-gray-800 dark:text-slate-100">
                  {searchQuery ? `Searching for "${searchQuery}"` : activeCategory === 'all' ? 'All Products' : CATEGORIES.find(c => c.id === activeCategory)?.name}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  quantity={cart.find(c => c.id === product.id)?.quantity || 0}
                  onAdd={(p) => {
                    if (p.stockCount <= 0) {
                      alert("Sorry, this item is currently out of stock.");
                      return;
                    }
                    setCart(prev => {
                      const existing = prev.find(i => i.id === p.id);
                      if (existing) {
                        if (existing.quantity >= p.stockCount) {
                          alert(`Only ${p.stockCount} units available in stock.`);
                          return prev;
                        }
                        return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
                      }
                      return [...prev, { ...p, quantity: 1 }];
                    });
                  }}
                  onRemove={(pid) => setCart(prev => {
                    const existing = prev.find(i => i.id === pid);
                    if (existing && existing.quantity > 1) return prev.map(i => i.id === pid ? { ...i, quantity: i.quantity - 1 } : i);
                    return prev.filter(i => i.id !== pid);
                  })}
                  onEdit={(p) => { setEditingProduct(p); setIsUploadOpen(true); }}
                  onDelete={(pid) => { if (window.confirm('Delete this product?')) setProducts(prev => prev.filter(p => p.id !== pid)); }}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
        </div>
      </main>

      {/* Cart Drawer & UPI Payment Flow */}
      {showCartDrawer && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full flex flex-col animate-slide-in-right overflow-hidden">
                  <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-2">
                         {paymentStep !== 'checkout' && (
                           <button onClick={() => setPaymentStep('checkout')} className="p-1 hover:bg-gray-100 rounded-full">
                              <RotateCcw size={16} className="text-indigo-600" />
                           </button>
                         )}
                         <h2 className="font-bold text-lg dark:text-slate-100">
                           {paymentStep === 'checkout' ? 'My Cart' : paymentStep === 'method' ? 'Choose Payment' : 'Scan & Pay'}
                         </h2>
                      </div>
                      <button onClick={() => { setShowCartDrawer(false); setPaymentStep('checkout'); }} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
                          <X size={20} className="dark:text-slate-400" />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                      {paymentStep === 'checkout' && (
                        <>
                          {cart.map(item => (
                              <div key={item.id} className="flex gap-4 py-2 border-b dark:border-slate-800">
                                  <img src={item.image} className="h-16 w-16 object-contain bg-gray-50 dark:bg-slate-800 rounded-lg" alt="" />
                                  <div className="flex-1">
                                      <p className="text-sm font-medium dark:text-slate-100">{item.name}</p>
                                      <div className="flex justify-between items-center mt-1">
                                          <p className="font-bold dark:text-slate-100">₹{(item.price * item.quantity).toFixed(2)}</p>
                                          <div className="flex items-center bg-green-600 rounded-lg text-white">
                                              <button onClick={() => {
                                                setCart(prev => {
                                                  const existing = prev.find(i => i.id === item.id);
                                                  if (existing && existing.quantity > 1) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i);
                                                  return prev.filter(i => i.id !== item.id);
                                                });
                                              }} className="px-2 py-1">-</button>
                                              <span className="px-2 text-xs font-bold">{item.quantity}</span>
                                              <button onClick={() => {
                                                setCart(prev => {
                                                  if (item.quantity >= item.stockCount) {
                                                    alert(`Only ${item.stockCount} units available in stock.`);
                                                    return prev;
                                                  }
                                                  return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
                                                });
                                              }} className="px-2 py-1">+</button>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                          {cart.length === 0 && <div className="text-center py-20 text-gray-400">Your cart is empty</div>}
                        </>
                      )}

                      {paymentStep === 'method' && (
                         <div className="space-y-4 pt-4">
                            <button 
                               onClick={() => {
                                 if (storeSettings.upiQrCode) {
                                   setPaymentMethod('UPI');
                                   setPaymentStep('upi_qr');
                                 } else {
                                   alert("Store hasn't configured UPI payments yet. Please use COD.");
                                 }
                               }}
                               className="w-full p-4 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-2xl flex items-center justify-between group hover:ring-2 hover:ring-indigo-500 transition-all"
                            >
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
                                     <CreditCard size={24} />
                                  </div>
                                  <div className="text-left">
                                     <p className="font-bold dark:text-white">Pay Online (UPI)</p>
                                     <p className="text-xs text-gray-400">Secure QR Scan Payment</p>
                                  </div>
                               </div>
                               <ChevronRight className="text-gray-300" />
                            </button>

                            <button 
                               onClick={() => { setPaymentMethod('COD'); finalizeOrder(); }}
                               className="w-full p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl flex items-center justify-between group hover:ring-2 hover:ring-gray-300 transition-all"
                            >
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-gray-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-gray-600">
                                     <Banknote size={24} />
                                  </div>
                                  <div className="text-left">
                                     <p className="font-bold dark:text-white">Cash on Delivery</p>
                                     <p className="text-xs text-gray-400">Pay when you receive</p>
                                  </div>
                               </div>
                               <ChevronRight className="text-gray-300" />
                            </button>
                         </div>
                      )}

                      {paymentStep === 'upi_qr' && (
                         <div className="flex flex-col items-center gap-6 pt-4 text-center">
                            <div className="bg-white p-4 rounded-3xl shadow-xl border-4 border-indigo-50">
                               {storeSettings.upiQrCode ? (
                                 <img src={storeSettings.upiQrCode} className="w-64 h-64 object-contain" alt="Scan to pay" />
                               ) : (
                                 <div className="w-64 h-64 flex items-center justify-center text-red-500 font-bold">QR MISSING</div>
                               )}
                            </div>
                            
                            <div className="space-y-2">
                               <p className="text-sm font-bold text-gray-600 dark:text-slate-300">Scan QR and Pay</p>
                               <p className="text-2xl font-black text-indigo-600">₹{(cartTotal + 5.00).toFixed(2)}</p>
                               {storeSettings.upiId && <p className="text-[10px] font-mono bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-gray-500">{storeSettings.upiId}</p>}
                            </div>

                            <div className="w-full space-y-3">
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Optional: Enter Transaction ID</p>
                               <input 
                                 value={upiTxnId}
                                 onChange={(e) => setUpiTxnId(e.target.value)}
                                 className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-center font-mono dark:text-white"
                                 placeholder="1234 5678 9012"
                               />
                            </div>
                         </div>
                      )}

                      {paymentStep === 'processing' && (
                         <div className="flex flex-col items-center justify-center py-20 gap-6">
                             <div className="relative">
                               <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                               <ShoppingCart size={32} className="absolute inset-0 m-auto text-indigo-600 animate-pulse" />
                             </div>
                             <div className="text-center">
                                <p className="font-bold text-gray-800 dark:text-white">Verifying Payment...</p>
                                <p className="text-xs text-gray-400 mt-1">Please do not close this window</p>
                             </div>
                         </div>
                      )}
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-800 shrink-0">
                      {paymentStep === 'checkout' ? (
                        <button 
                            disabled={cart.length === 0}
                            onClick={handlePayClick}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            Checkout • ₹{(cartTotal + 5.00).toFixed(2)}
                        </button>
                      ) : paymentStep === 'upi_qr' ? (
                        <button 
                            onClick={finalizeOrder}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all"
                        >
                            I've Paid • Place Order
                        </button>
                      ) : null}
                  </div>
              </div>
          </div>
      )}

      {/* Address & Settings Modals */}
      {isAddressModalOpen && (
          <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800 shrink-0">
                      <h2 className="font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                          <MapPin size={18} className="text-pink-500" /> Confirm Delivery Spot
                      </h2>
                      <button onClick={() => setIsAddressModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full">
                          <X size={18} className="dark:text-slate-400" />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                      <div className="space-y-1">
                          <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${validationErrors.phone ? 'text-red-500' : 'text-gray-500 dark:text-slate-400'}`}>
                            Contact Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="tel"
                                value={tempPhone}
                                onChange={(e) => setTempPhone(e.target.value)}
                                className={`w-full p-3.5 pl-10 bg-gray-50 dark:bg-slate-800 dark:text-white border rounded-xl focus:ring-2 outline-none transition-all ${validationErrors.phone ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200 dark:border-slate-700 focus:ring-pink-500'}`}
                                placeholder="+91 00000 00000"
                            />
                          </div>
                      </div>

                      <div className="space-y-4">
                          <div className="space-y-1 relative">
                              <label className="text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest ml-1">Building/Unit Search</label>
                              <div className="relative flex-1 group">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                  <input 
                                      value={addressSearch}
                                      onChange={(e) => handleAddressSearchChange(e.target.value)}
                                      className="w-full p-3.5 pl-10 pr-10 bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                                      placeholder="Building name, Landmark..."
                                  />
                              </div>
                          </div>
                          
                          <button 
                              onClick={handleLocateMe}
                              disabled={isLocating}
                              className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center gap-2 border border-indigo-100 dark:border-indigo-900/50 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all active:scale-95 disabled:opacity-50"
                          >
                              {isLocating ? <Loader2 className="animate-spin" size={14} /> : <Crosshair size={14} />}
                              {isLocating ? "Fetching Precise Address..." : "Locate Me"}
                          </button>
                      </div>

                      <div className="space-y-1">
                          <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${validationErrors.address ? 'text-red-500' : 'text-gray-500 dark:text-slate-400'}`}>
                            Confirmed Delivery Address (Building & Unit)
                          </label>
                          <textarea 
                              value={tempAddress}
                              onChange={(e) => setTempAddress(e.target.value)}
                              className={`w-full p-4 bg-gray-50 dark:bg-slate-800 dark:text-white border rounded-xl focus:ring-2 outline-none h-28 resize-none transition-all text-sm ${validationErrors.address ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200 dark:border-slate-700 focus:ring-pink-500'}`}
                              placeholder="E.g. #402, B-Wing, Landmark Residency..."
                          />
                      </div>
                  </div>

                  <div className="p-6 bg-gray-50 dark:bg-slate-800 border-t dark:border-slate-700 shrink-0">
                      <button 
                          onClick={saveNewAddress}
                          disabled={Object.keys(validationErrors).length > 0}
                          className="w-full py-4 bg-[#0a1e40] dark:bg-indigo-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                      >
                          <Check size={20} /> Confirm Precise Location
                      </button>
                  </div>
              </div>
          </div>
      )}

      {isSettingsOpen && (
        <AdminSettings 
          onClose={() => setIsSettingsOpen(false)} 
          settings={storeSettings} 
          onSave={setStoreSettings} 
        />
      )}

      {/* Main App Overlay Modals */}
      {showPaymentSuccess && (
          <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="relative h-24 w-24 bg-green-600 rounded-full flex items-center justify-center text-white shadow-2xl mb-8">
                  <Check size={48} strokeWidth={3} className="animate-pop" />
              </div>
              <h1 className="text-3xl font-black dark:text-white mb-2 font-serif-logo">Order Placed!</h1>
              <p className="text-gray-500 dark:text-slate-400 mb-8">Your groceries are on the way! 🚀</p>
              <button onClick={() => setShowPaymentSuccess(false)} className="w-full max-w-xs py-4 bg-[#0a1e40] dark:bg-indigo-600 text-white font-bold rounded-2xl">Awesome</button>
          </div>
      )}

      {isAssistantOpen && (
        <SmartAssistant 
          onClose={() => setIsAssistantOpen(false)}
          products={products}
          cart={cart}
          onAddFromAssistant={(p) => setCart(prev => [...prev, { ...p, quantity: 1 }])}
        />
      )}

      {isUploadOpen && (
        <AdminUpload 
          onClose={() => { setIsUploadOpen(false); setEditingProduct(null); }}
          onAddProduct={(p) => setProducts(prev => [p, ...prev])}
          onUpdateProduct={(p) => setProducts(prev => prev.map(old => old.id === p.id ? p : old))}
          onDeleteProduct={(pid) => setProducts(prev => prev.filter(p => p.id !== pid))}
          productToEdit={editingProduct}
          allProducts={products}
          isDarkMode={isDarkMode}
        />
      )}

      {isOrdersOpen && (
        <AdminOrders 
          orders={orders}
          onClose={() => setIsOrdersOpen(false)}
          onUpdateStatus={(id, s) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: s } : o))}
        />
      )}
    </div>
  );
}
