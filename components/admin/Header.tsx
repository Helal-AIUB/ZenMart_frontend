"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, User, Sparkles, Package, AlertTriangle, CheckCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/services/apiClient";
import toast from "react-hot-toast";

interface Notification {
  id: number;
  notification_type: 'order' | 'stock';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  order: number | null;
  product: number | null;
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'order' | 'stock'>('order');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🟢 Fetch Notifications
  const fetchNotifications = async () => {
    try {
      // Assuming your notifications endpoint is under /store/
      const res = await apiClient.get('/store/notifications/');
      const data = res.data.results || res.data;
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Optional: Add a setInterval here to poll notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // 🟢 Handle Click Outside (Desktop)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🟢 Mark as Read & Redirect
  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      try {
        await apiClient.patch(`/store/notifications/${notif.id}/mark_read/`);
        // Update local state instantly for snappy UI
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark as read");
      }
    }
    
    setIsOpen(false);
    
    // Redirect logic
    if (notif.notification_type === 'order' && notif.order) {
      router.push(`/admin/orders`); // Adjust this path according to your app
    } else if (notif.notification_type === 'stock' && notif.product) {
      router.push(`/admin/products`); // Adjust this path according to your app
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.post('/store/notifications/mark_all_read/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const filteredNotifications = notifications.filter(n => n.notification_type === activeTab);
  const unreadOrders = notifications.filter(n => n.notification_type === 'order' && !n.is_read).length;
  const unreadStock = notifications.filter(n => n.notification_type === 'stock' && !n.is_read).length;

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-30 sticky top-0">
      
      {/* Premium Welcome Message (Hidden on small mobile, visible on Tab+) */}
      <div className="hidden sm:flex flex-col justify-center">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          Welcome to Petora BD Portal 
          <Sparkles size={18} className="text-emerald-500 animate-pulse" />
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Manage your store, track orders, and monitor performance.
        </p>
      </div>

      {/* Mobile Title (Visible only on very small screens) */}
      <div className="sm:hidden flex items-center">
        <h1 className="text-lg font-bold text-slate-800">Petora Admin</h1>
      </div>

      {/* Right Side: Notifications & Profile */}
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* 🟢 Notification Container */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`relative p-2.5 rounded-full transition-colors ${isOpen ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
          >
            <Bell size={20} />
            
            {/* 🟢 Dynamic Badge with Number */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-white shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* 🟢 Notifications Window (Responsive: Modal on Mobile, Dropdown on Desktop) */}
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Mobile Backdrop */}
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setIsOpen(false)}
                  className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm"
                />

                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.95 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                  className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col h-[85vh] md:h-auto md:absolute md:top-14 md:-right-4 md:w-[420px] md:bottom-auto md:left-auto md:rounded-2xl md:border md:border-slate-100 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h3 className="font-bold text-slate-800 text-lg">Notifications</h3>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                          <CheckCheck size={14} /> Mark all read
                        </button>
                      )}
                      <button onClick={() => setIsOpen(false)} className="md:hidden p-1.5 bg-slate-100 text-slate-500 rounded-full">
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-slate-100 bg-slate-50/50">
                    <button 
                      onClick={() => setActiveTab('order')}
                      className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'order' ? 'border-emerald-500 text-emerald-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                      Orders {unreadOrders > 0 && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadOrders}</span>}
                    </button>
                    <button 
                      onClick={() => setActiveTab('stock')}
                      className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'stock' ? 'border-amber-500 text-amber-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                      Stock Alerts {unreadStock > 0 && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadStock}</span>}
                    </button>
                  </div>

                  {/* List Content */}
                  <div className="overflow-y-auto max-h-[calc(85vh-130px)] md:max-h-[400px] p-2 bg-white">
                    {filteredNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Bell size={40} className="mb-3 opacity-20" />
                        <p className="text-sm font-medium">No new notifications here.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {filteredNotifications.map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3 md:p-4 rounded-xl flex gap-4 cursor-pointer transition-colors ${
                              notif.is_read 
                                ? 'hover:bg-slate-50 bg-white' 
                                : activeTab === 'order' ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'bg-amber-50/50 hover:bg-amber-50'
                            }`}
                          >
                            <div className={`mt-0.5 shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              notif.notification_type === 'order' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {notif.notification_type === 'order' ? <Package size={18} /> : <AlertTriangle size={18} />}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm ${notif.is_read ? 'text-slate-700 font-medium' : 'text-slate-900 font-bold'}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{notif.message}</p>
                              <p className="text-[10px] font-semibold text-slate-400 mt-2 uppercase tracking-wider">
                                {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            {!notif.is_read && (
                              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        
        {/* Profile Info */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer group">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
            <User size={20} />
          </div>
          <div className="hidden md:block text-sm">
            <p className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">Admin User</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
        </div>
      </div>
      
    </header>
  );
}