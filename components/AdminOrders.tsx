
import React from 'react';
import { X, ClipboardList, Clock, CheckCircle2, Truck, Package, Phone, MapPin, User, ChevronRight } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface AdminOrdersProps {
  orders: Order[];
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onClose, onUpdateStatus }) => {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50';
      case 'accepted': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50';
      case 'out-for-delivery': return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-900/50';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'accepted': return <Package size={14} />;
      case 'out-for-delivery': return <Truck size={14} />;
      case 'delivered': return <CheckCircle2 size={14} />;
      default: return null;
    }
  };

  const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
    'pending': 'accepted',
    'accepted': 'out-for-delivery',
    'out-for-delivery': 'delivered',
    'delivered': null
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-gray-50 dark:bg-slate-950 h-full shadow-2xl flex flex-col animate-slide-in-right transition-colors">
        {/* Header */}
        <div className="p-4 border-b bg-white dark:bg-slate-900 dark:border-slate-800 flex justify-between items-center shadow-sm shrink-0 transition-colors">
          <div className="flex items-center gap-2">
            <ClipboardList className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold text-lg text-gray-800 dark:text-slate-100">Order Management</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500 dark:text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {orders.length > 0 ? (
            orders.map(order => (
              <div key={order.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in transition-colors">
                {/* Order Meta Header */}
                <div className="p-4 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">#{order.id.slice(-6)}</span>
                    <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">
                      {new Date(order.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.replace(/-/g, ' ')}
                  </div>
                </div>

                {/* Main Order Content */}
                <div className="p-4 grid md:grid-cols-2 gap-6">
                  {/* Left: Customer Info */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <User size={14} className="text-gray-400 dark:text-slate-500 mt-1 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase">Customer</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-slate-100">{order.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone size={14} className="text-gray-400 dark:text-slate-500 mt-1 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase">Contact</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-slate-100">{order.customerPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-gray-400 dark:text-slate-500 mt-1 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase">Address</p>
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-300 line-clamp-2">{order.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Items List */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase">Order Summary</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 no-scrollbar">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <div className="flex gap-2 items-center">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded min-w-[20px] text-center">{item.quantity}x</span>
                            <span className="text-gray-700 dark:text-slate-200 font-medium truncate max-w-[120px]">{item.name}</span>
                          </div>
                          <span className="text-gray-400 dark:text-slate-500 font-mono">₹{(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-dashed dark:border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-800 dark:text-slate-100">Total Amount</span>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">₹{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer: Action Buttons */}
                {nextStatusMap[order.status] && (
                  <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-800 flex justify-end transition-colors">
                    <button 
                      onClick={() => onUpdateStatus(order.id, nextStatusMap[order.status]!)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                    >
                      Update to: <span className="uppercase">{nextStatusMap[order.status]!.replace(/-/g, ' ')}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-slate-600">
              <div className="h-20 w-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <ClipboardList size={32} className="text-gray-300 dark:text-slate-600" />
              </div>
              <p className="font-bold text-sm">No orders yet</p>
              <p className="text-xs">Incoming customer orders will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
