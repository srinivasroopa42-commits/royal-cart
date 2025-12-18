
import React, { useState, useRef } from 'react';
import { X, QrCode, Save, Upload, Trash2, Info, Copy, Check } from 'lucide-react';
import { StoreSettings } from '../types';

interface AdminSettingsProps {
  onClose: () => void;
  settings: StoreSettings;
  onSave: (settings: StoreSettings) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onClose, settings, onSave }) => {
  const [upiId, setUpiId] = useState(settings.upiId || '');
  const [qrCode, setQrCode] = useState(settings.upiQrCode || '');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCode(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave({
      ...settings,
      upiId: upiId.trim(),
      upiQrCode: qrCode
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                <QrCode size={20} />
            </div>
            <div>
                <h2 className="font-bold text-gray-800 dark:text-slate-100 leading-none">Store Settings</h2>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 uppercase tracking-tighter font-bold">Manage Payments & UPI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} className="dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar max-h-[70vh]">
          {/* Info Card */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-xl flex gap-3">
            <Info size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
              Configure your store's UPI details. This information is shown to customers during the "Scan & Pay" checkout process.
            </p>
          </div>

          {/* UPI ID Section */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 dark:text-slate-400 uppercase ml-1 tracking-wider">Store UPI ID (VPA)</label>
            <div className="relative group">
              <input 
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full p-3.5 pr-12 bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all font-mono text-sm"
                placeholder="e.g. storename@okicici"
              />
              {upiId && (
                  <button 
                    onClick={handleCopy}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 ml-1">Example: yourname@upi, mobilenumber@okaxis</p>
          </div>

          {/* QR Code Section */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 dark:text-slate-400 uppercase ml-1 tracking-wider">Store Payment QR Code</label>
            <div 
              onClick={() => !qrCode && fileInputRef.current?.click()}
              className={`relative w-full aspect-square max-w-[200px] mx-auto rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${
                qrCode 
                  ? 'border-indigo-200 bg-white dark:bg-slate-800 shadow-inner' 
                  : 'border-gray-300 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
              }`}
            >
              {qrCode ? (
                <>
                  <img src={qrCode} className="w-full h-full object-contain p-6" alt="UPI QR" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity">
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-indigo-600 text-xs font-bold shadow-xl active:scale-95 transition-all">
                      <Upload size={14} /> Update QR
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setQrCode(''); }} className="flex items-center gap-2 px-4 py-2 bg-red-500 rounded-xl text-white text-xs font-bold shadow-xl active:scale-95 transition-all">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 text-gray-400">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload size={24} className="opacity-50" />
                  </div>
                  <p className="text-xs font-bold text-gray-600 dark:text-slate-300">Upload Shop QR</p>
                  <p className="text-[10px] mt-1">Accepts JPG/PNG/WebP</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-gray-50 dark:bg-slate-800 border-t dark:border-slate-700">
          <button 
            onClick={handleSave}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
