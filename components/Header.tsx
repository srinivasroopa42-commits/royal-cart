
import React, { useState } from 'react';
import { Search, MapPin, Plus, Crown, ShoppingCart, ChevronDown, ShieldCheck, LogOut, X, AlertTriangle, ClipboardList, Moon, Sun, Settings, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onSearchClick: () => void;
  onAssistantClick: () => void;
  onUploadClick: () => void;
  onOrdersClick: () => void;
  onSettingsClick?: () => void;
  address: string;
  onAddressClick: () => void;
  onLogout: () => void;
  userName?: string;
  isAdmin?: boolean;
  pendingOrdersCount?: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  cartCount, 
  onCartClick, 
  onSearchClick, 
  onAssistantClick, 
  onUploadClick,
  onOrdersClick,
  onSettingsClick,
  address,
  onAddressClick,
  onLogout,
  userName = 'Guest',
  isAdmin = false,
  pendingOrdersCount = 0,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const getInitials = (name: string) => {
     return name
       .split(' ')
       .map(n => n[0])
       .join('')
       .substring(0, 2)
       .toUpperCase();
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-sm pb-2 transition-colors duration-300">
      {/* Brand & Actions Bar */}
      <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 transition-colors">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10">
                <Crown size={22} className="text-yellow-500 absolute -top-1.5 left-1/2 -translate-x-1/2 z-10" fill="currentColor" />
                <ShoppingCart size={26} className="text-[#0a1e40] dark:text-indigo-400 mt-1.5" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-serif-logo font-black tracking-wide text-[#0a1e40] dark:text-slate-100">
                ROYALCART
            </h1>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 md:gap-3">
            <button 
                onClick={onToggleDarkMode}
                className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Cart Button with Badge */}
            <button 
                onClick={onCartClick}
                className="relative p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors group"
                title="View Cart"
            >
                <ShoppingBag size={22} className="group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-pop">
                        {cartCount}
                    </span>
                )}
            </button>

            {isAdmin && (
                <div className="hidden md:flex items-center gap-2">
                  {onSettingsClick && (
                    <button 
                      onClick={onSettingsClick}
                      className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                      title="Store Settings"
                    >
                      <Settings size={20} />
                    </button>
                  )}
                  <button 
                      onClick={onOrdersClick}
                      className="relative flex items-center gap-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:bg-indigo-50 dark:hover:bg-slate-700 shadow-sm"
                  >
                      <ClipboardList size={14} />
                      <span>Orders</span>
                      {pendingOrdersCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] text-white">
                          {pendingOrdersCount}
                        </span>
                      )}
                  </button>
                  <button 
                      onClick={onUploadClick}
                      className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm"
                  >
                      <Plus size={14} />
                      <span>Add Item</span>
                  </button>
                </div>
            )}
            
            <div className="flex items-center gap-2">
                <div className={`h-9 w-9 flex items-center justify-center text-xs font-bold rounded-full ring-2 shadow-sm cursor-default relative ${isAdmin ? 'bg-indigo-900 text-white ring-indigo-500' : 'bg-[#0a1e40] dark:bg-slate-700 text-white ring-yellow-500'}`} title={userName}>
                  {getInitials(userName)}
                  {isAdmin && (
                    <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full border border-indigo-900 p-0.5">
                        <ShieldCheck size={10} className="text-white" />
                    </div>
                  )}
                </div>
                
                <button 
                    onClick={handleLogoutClick}
                    className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </div>
      </div>

      {/* Delivery Info Sub-bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#f8f9fa] dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-xs text-gray-600 dark:text-slate-400 transition-colors">
           <button 
             onClick={(e) => {
               e.preventDefault();
               onAddressClick();
             }}
             className="flex items-center gap-2 overflow-hidden hover:bg-gray-200 dark:hover:bg-slate-700 px-2 py-1 -ml-2 rounded-lg transition-colors cursor-pointer group"
           >
                <MapPin size={12} className="text-pink-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[200px] font-bold text-gray-800 dark:text-slate-200">{address}</span>
                <ChevronDown size={12} className="text-gray-400 dark:text-slate-500" />
           </button>
           {isAdmin && (
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded uppercase tracking-tighter">Admin Control</span>
                <div className="flex items-center gap-1.5 md:hidden">
                    {onSettingsClick && (
                        <button 
                            onClick={onSettingsClick}
                            className="p-1.5 bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-lg shadow-sm border border-indigo-100 dark:border-slate-600"
                        >
                            <Settings size={14} />
                        </button>
                    )}
                    <button 
                        onClick={onOrdersClick}
                        className="relative p-1.5 bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-lg shadow-sm border border-indigo-100 dark:border-slate-600"
                    >
                        <ClipboardList size={14} />
                        {pendingOrdersCount > 0 && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-slate-800"></div>}
                    </button>
                    <button 
                        onClick={onUploadClick}
                        className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm active:scale-95"
                        title="Add New Product"
                    >
                        <Plus size={14} strokeWidth={3} />
                    </button>
                </div>
             </div>
           )}
      </div>

      {/* Search Bar */}
      <div className="px-4 mt-3">
        <div className="flex gap-2">
          <button
            onClick={onSearchClick}
            className="flex-1 h-12 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center px-4 text-gray-500 dark:text-slate-400 gap-3 border border-gray-200 dark:border-slate-700 active:scale-[0.99] transition-all"
          >
            <Search size={20} />
            <span className="text-sm">Search for "chips"</span>
          </button>
          <button
            onClick={onAssistantClick}
            className="h-12 w-12 bg-gradient-to-br from-[#0a1e40] to-indigo-900 dark:from-indigo-600 dark:to-purple-700 rounded-xl flex items-center justify-center text-yellow-400 shadow-lg animate-pulse border-2 border-yellow-500/20"
            title="AI Assistant"
          >
             <span className="text-xl">✨</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center text-red-500 mb-6">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Signing Out?</h2>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                Are you sure you want to log out of RoyalCart? Your current shopping session will be closed.
              </p>
              
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={confirmLogout}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
                >
                  Yes, Log Me Out
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-2xl active:scale-95 transition-all"
                >
                  Stay Logged In
                </button>
              </div>
            </div>
            <button 
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
