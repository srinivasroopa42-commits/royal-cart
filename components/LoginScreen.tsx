
import React, { useState } from 'react';
import { Crown, ShoppingCart, MapPin, Phone, User, ArrowRight, Lock, ShieldCheck, Mail, CheckCircle2, Moon, Sun, Wand2 } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isDarkMode, onToggleDarkMode }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');

  const fillAdminDefaults = () => {
    setAdminId('admin');
    setAdminPassword('admin123');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isAdminMode) {
      if (isResetMode) {
        // Simulate sending a reset link
        if (resetEmail.includes('@')) {
          setResetSuccess(true);
          setTimeout(() => {
            setResetSuccess(false);
            setIsResetMode(false);
            setResetEmail('');
          }, 3000);
        } else {
          setError('Please enter a valid admin email address.');
        }
        return;
      }

      // Mock Admin Auth
      if (adminId === 'admin' && adminPassword === 'admin123') {
        onLogin({ 
          name: 'Store Manager', 
          phone: '+91 98765 43210', 
          address: 'Main Store Warehouse, Sector 12', 
          role: 'admin' 
        });
      } else {
        setError('Invalid Admin credentials. Try admin/admin123');
      }
    } else {
      if (name && phone && address) {
        onLogin({ name, phone, address, role: 'user' });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-gray-100 dark:border-slate-800 transition-colors">
        <div className={`p-8 text-center relative overflow-hidden transition-colors duration-500 ${isAdminMode ? 'bg-indigo-900' : 'bg-[#0a1e40] dark:bg-slate-950'}`}>
            <div className="absolute top-[-50%] left-[-50%] w-full h-full rounded-full bg-white/5 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center gap-3">
                <div className="relative flex items-center justify-center w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm shadow-inner">
                    {isAdminMode ? (
                        <ShieldCheck size={38} className="text-yellow-400" fill="currentColor" />
                    ) : (
                        <>
                            <Crown size={32} className="text-yellow-500 absolute -top-2 left-1/2 -translate-x-1/2 z-10" fill="currentColor" />
                            <ShoppingCart size={38} className="text-white mt-2" fill="currentColor" />
                        </>
                    )}
                </div>
                <h1 className="text-3xl font-serif-logo font-black tracking-wide text-white drop-shadow-md">
                    {isAdminMode ? 'ADMIN PORTAL' : 'ROYALCART'}
                </h1>
                <p className="text-indigo-200 text-sm font-medium tracking-wider uppercase">
                    {isAdminMode ? 'Store Management System' : 'Premium Grocery Delivery'}
                </p>
            </div>

            {onToggleDarkMode && (
              <button 
                onClick={onToggleDarkMode}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/70 transition-colors"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
        </div>

        <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-6 text-center font-serif-logo">
                {isResetMode ? 'Reset Admin Password' : isAdminMode ? 'Secure Access' : 'Welcome Member'}
            </h2>
            
            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg">
                    {error}
                </div>
            )}

            {resetSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 animate-fade-in">
                    <CheckCircle2 size={48} className="text-green-500 mb-4" />
                    <p className="text-sm font-bold text-gray-800 dark:text-slate-100 mb-1">Reset Link Sent!</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Check your inbox for instructions.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isAdminMode ? (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1">Your Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 group-focus-within:text-[#0a1e40] dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input 
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0a1e40] dark:focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1">Phone Number</label>
                                <div className="relative group">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 group-focus-within:text-[#0a1e40] dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input 
                                        required
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0a1e40] dark:focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                                        placeholder="+91 99999 88888"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1">Delivery Address</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-3 top-3 text-gray-400 dark:text-slate-500 group-focus-within:text-[#0a1e40] dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <textarea 
                                        required
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0a1e40] dark:focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all resize-none h-24"
                                        placeholder="Flat 101, Building X, Street Y"
                                    />
                                </div>
                            </div>
                        </>
                    ) : isResetMode ? (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1">Admin Recovery Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 group-focus-within:text-indigo-900 dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input 
                                        required
                                        type="email"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-900 dark:focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                                        placeholder="admin@royalcart.com"
                                    />
                                </div>
                            </div>
                            <div className="text-right">
                                <button 
                                    type="button"
                                    onClick={() => setIsResetMode(false)}
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1">Admin ID</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 group-focus-within:text-indigo-900 dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input 
                                        required
                                        value={adminId}
                                        onChange={(e) => setAdminId(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-900 dark:focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                                        placeholder="Admin Username"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 group-focus-within:text-indigo-900 dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input 
                                        required
                                        type="password"
                                        value={adminPassword}
                                        onChange={(e) => setAdminPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-900 dark:focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <button 
                                    type="button"
                                    onClick={fillAdminDefaults}
                                    className="text-[10px] flex items-center gap-1.5 font-black uppercase text-indigo-500 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg transition-all"
                                >
                                    <Wand2 size={10} /> Fill Test Admin
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setIsResetMode(true)}
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </>
                    )}

                    <button 
                        type="submit"
                        className={`w-full mt-4 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${isAdminMode ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-[#0a1e40] dark:bg-indigo-600 hover:bg-[#153466] dark:hover:bg-indigo-500'}`}
                    >
                        {isResetMode ? 'Send Reset Link' : isAdminMode ? 'Access Store' : 'Start Shopping'} <ArrowRight size={20} />
                    </button>
                </form>
            )}

            <div className="mt-8 text-center">
                <button 
                    onClick={() => {
                        setIsAdminMode(!isAdminMode);
                        setIsResetMode(false);
                        setError('');
                        setResetSuccess(false);
                    }}
                    className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                >
                    {isAdminMode ? 'Back to Member Login' : 'Switch to Admin Portal'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
