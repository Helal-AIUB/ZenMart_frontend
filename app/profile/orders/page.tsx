"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/services/apiClient";
import { 
  Package, Clock, Truck, CheckCircle2, ChevronLeft, 
  MapPin, CreditCard, HeadphonesIcon, FileText, Loader2 
} from "lucide-react";
import toast from "react-hot-toast";

// --- Types ---
interface OrderItem {
  id: number;
  product: { id: number; title: string; unit_price: number; image?: string };
  unit_price: number;
  quantity: number;
}

interface Order {
  id: number;
  customer: number;
  placed_at: string;
  payment_status: string;
  delivery_status: 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Canceled';
  // 🟢 New Dynamic Fields Added
  first_name?: string;
  last_name?: string;
  street?: string;
  city?: string;
  zip_code?: string;
  phone?: string;
  items: OrderItem[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiClient.get("/store/orders/");
        setOrders(res.data.results || res.data);
      } catch (error) {
        toast.error("Failed to load your orders.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.delivery_status === 'Placed' || o.delivery_status === 'Processing').length;
  const shippedOrders = orders.filter(o => o.delivery_status === 'Shipped').length;
  const deliveredOrders = orders.filter(o => o.delivery_status === 'Delivered').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // --- 🟢 MASTER VIEW (Order List & Stats) ---
  if (!selectedOrder) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
        
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Orders</h1>
            <p className="text-sm text-slate-500 mt-1">Track and manage all your orders</p>
          </div>
          <select className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer">
            <option>All Orders</option>
            <option>Last 30 Days</option>
            <option>Last 6 Months</option>
          </select>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center border border-slate-100">
              <Package size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Orders</p>
              <p className="text-xl font-black text-slate-800">{totalOrders}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center border border-amber-100">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending</p>
              <p className="text-xl font-black text-slate-800">{pendingOrders}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center border border-blue-100">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Shipped</p>
              <p className="text-xl font-black text-slate-800">{shippedOrders}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-100">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Delivered</p>
              <p className="text-xl font-black text-slate-800">{deliveredOrders}</p>
            </div>
          </div>
        </div>

        {/* Order List Table/Cards */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={48} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-800">No Orders Found</h3>
              <p className="text-sm text-slate-500 mt-1">You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {orders.map((order, idx) => {
                const total = order.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
                return (
                  <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors ${idx !== orders.length - 1 ? 'border-b border-slate-100' : ''}`}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold">
                        #{order.id}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 mb-1">Order #PTBD-2026-{order.id.toString().padStart(4, '0')}</h4>
                        <p className="text-sm text-slate-500">{new Date(order.placed_at).toLocaleDateString()} • {order.items.length} Items</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
                      <div className="text-left md:text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total</p>
                        <p className="font-black text-emerald-600">${total.toFixed(2)}</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        order.delivery_status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 
                        order.delivery_status === 'Shipped' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {order.delivery_status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- 🔵 DETAIL VIEW (Invoice & Tracking) ---
  const orderTotal = selectedOrder.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const trackingSteps = ['Placed', 'Processing', 'Shipped', 'Delivered'];
  const currentIdx = trackingSteps.indexOf(selectedOrder.delivery_status);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 font-sans">
      
      {/* Back Button & Header */}
      <button 
        onClick={() => setSelectedOrder(null)}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-6 cursor-pointer"
      >
        <ChevronLeft size={16} /> Back to Orders
      </button>

      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-800">Order #PTBD-2026-{selectedOrder.id.toString().padStart(4, '0')}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                selectedOrder.delivery_status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {selectedOrder.delivery_status}
              </span>
            </div>
            <p className="text-sm text-slate-500">Placed on {new Date(selectedOrder.placed_at).toLocaleString()}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-xl font-black text-emerald-600">${orderTotal.toFixed(2)}</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer">
              <FileText size={16} /> Invoice
            </button>
          </div>
        </div>

        {/* --- LIVE TRACKING STEPPER --- */}
        <div className="mb-12">
          <h3 className="text-sm font-bold text-slate-800 mb-6">Live Tracking Status</h3>
          <div className="relative flex items-center justify-between w-full px-2 sm:px-6">
            
            <div className="absolute left-6 right-6 top-5 h-1 bg-slate-100 rounded-full z-0"></div>
            
            <div 
              className="absolute left-6 top-5 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-700 ease-out"
              style={{ width: `calc(${(Math.max(currentIdx, 0) / (trackingSteps.length - 1)) * 100}% - 3rem)` }}
            ></div>

            {trackingSteps.map((step, index) => {
              const isCompleted = index <= currentIdx;
              const isActive = index === currentIdx;

              return (
                <div key={step} className="relative z-10 flex flex-col items-center gap-3 bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-300'}
                    ${isActive && step !== 'Delivered' ? 'ring-4 ring-emerald-500/20' : ''}
                  `}>
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="text-center">
                    <p className={`text-xs sm:text-sm font-bold ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{step}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {selectedOrder.delivery_status === 'Delivered' && (
            <div className="mt-8 bg-emerald-50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between border border-emerald-100">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500" size={24} />
                <div>
                  <p className="font-bold text-emerald-800">Your order has been delivered!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Thank you for shopping with Petora BD.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- 3 COLUMN LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Order Items */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Order Items</h3>
            <div className="flex flex-col gap-4">
              {selectedOrder.items.map(item => (
                <div key={item.id} className="flex items-center justify-between border border-slate-100 p-4 rounded-xl hover:shadow-sm transition-shadow bg-slate-50/50">
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-slate-800">{item.product.title}</p>
                    <p className="text-xs text-slate-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-black text-slate-800">${(item.unit_price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info Cards */}
          <div className="flex flex-col gap-4">
            
            {/* 🟢 Dynamic Shipping Address Card */}
            <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" /> Shipping Address
                </h3>
                {selectedOrder.delivery_status !== 'Delivered' && (
                  <span className="text-xs font-bold text-emerald-600 cursor-pointer">Edit</span>
                )}
              </div>
              
              <div className="text-sm text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">
                  {selectedOrder.first_name || ""} {selectedOrder.last_name || ""}
                </p>
                <p>{selectedOrder.street || "Address not provided"}</p>
                <p>{selectedOrder.city ? `${selectedOrder.city},` : ""} {selectedOrder.zip_code || ""}</p>
                <p>Bangladesh</p>
                <p className="pt-2 text-xs font-medium text-slate-500">
                  {selectedOrder.phone || "Phone not provided"}
                </p>
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-3">
                <CreditCard size={16} className="text-slate-400" /> Payment Information
              </h3>
              <div className="flex items-center justify-between text-sm">
                <p className="text-slate-600">Paid with <strong className="text-slate-800">COD</strong></p>
                <p className="font-bold text-slate-800">${orderTotal.toFixed(2)}</p>
              </div>
              {selectedOrder.payment_status === 'P' && (
                <button className="mt-3 w-full py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors cursor-pointer">
                  Pay Now
                </button>
              )}
            </div>

            <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-2">
                <HeadphonesIcon size={16} className="text-slate-400" /> Need Help?
              </h3>
              <p className="text-xs text-slate-500 mb-3">If you have any questions about your order, our support team is here to help.</p>
              <button className="px-4 py-2 border border-emerald-200 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors bg-white cursor-pointer">
                Contact Support
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}