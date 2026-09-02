"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { apiClient } from "@/services/apiClient";
import { Search, ChevronLeft, ChevronRight, AlertCircle, Loader2, Eye, Trash2, CheckCircle, Clock, XCircle, Calendar, CalendarDays, Plus } from "lucide-react";
import toast from "react-hot-toast";
import OrderDetailsModal from "@/components/admin/OrderDetailsModal";
import CreateOrderModal from "@/components/admin/CreateOrderModal";

// --- Types ---
interface OrderItem {
  id: number;
  product: { id: number; title: string; unit_price: number };
  unit_price: number;
  quantity: number;
}

interface Order {
  id: number;
  customer: number;
  placed_at: string;
  payment_status: 'P' | 'C' | 'F';
  delivery_status: 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Canceled';
  first_name?: string;
  phone?: string;
  delivery_charge?: string | number;
  payment_method?: string;
  transaction_id?: string;
  items: OrderItem[];
  coupon_code?: string;         
  discount_amount?: string | number;
}

// SWR Fetcher for ultra-fast data fetching and caching
const fetcher = (url: string) => apiClient.get(url).then(res => res.data.results || res.data);

export default function AdminOrdersPage() {
  // Replaced useEffect with useSWR for caching, instant loading, and auto-revalidation
  const { data: allOrders = [], error, mutate, isLoading: loading } = useSWR<Order[]>('/store/orders/', fetcher, {
    revalidateOnFocus: true, 
    dedupingInterval: 5000,  
  });

  // Filters State
  const [filterId, setFilterId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState(""); 
  const [filterMonth, setFilterMonth] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return allOrders.filter(order => {
      const matchId = filterId ? order.id.toString().includes(filterId) : true;
      const matchStatus = filterStatus ? order.payment_status === filterStatus : true;
      
      const orderDateStr = order.placed_at.split('T')[0];
      const orderMonthStr = orderDateStr.substring(0, 7); 

      const matchDate = filterDate ? orderDateStr === filterDate : true;
      const matchMonth = filterMonth ? orderMonthStr === filterMonth : true;

      return matchId && matchStatus && matchDate && matchMonth;
    });
  }, [allOrders, filterId, filterStatus, filterDate, filterMonth]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterId, filterStatus, filterDate, filterMonth]);

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentDisplayedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this order?")) return;
    
    // Optimistic UI Update: Instantly remove from screen before API call finishes
    const previousOrders = [...allOrders];
    mutate(allOrders.filter((o) => o.id !== id), false);

    try {
      await apiClient.delete(`/store/orders/${id}/`);
      toast.success("Order deleted successfully");
      mutate(); // Sync final state with backend
    } catch (error) {
      toast.error("Failed to delete order.");
      mutate(previousOrders, false); // Revert changes if API fails
    }
  };

  const handleOrderUpdated = (updatedOrder: Order) => {
    mutate(allOrders.map((o) => o.id === updatedOrder.id ? updatedOrder : o), false);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'C': return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold whitespace-nowrap"><CheckCircle size={12} /> Complete</span>;
      case 'P': return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold whitespace-nowrap"><Clock size={12} /> Pending</span>;
      case 'F': return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold whitespace-nowrap"><XCircle size={12} /> Failed</span>;
      default: return null;
    }
  };

  if (error) {
    return <div className="p-10 text-center text-rose-500 font-bold">Failed to load orders. Please refresh.</div>;
  }

  return (
    <div className="space-y-6 pb-10 font-sans px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto mt-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Order Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">View, track, and update customer orders ({totalItems} records found)</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus size={18} /> Add Order
        </button>
      </div>

      {/* Advanced Premium Filters - Fully Responsive Grid */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="number" placeholder="Search by Order ID..." value={filterId} onChange={(e) => setFilterId(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white" />
          </div>
          
          <div className="w-full">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer outline-none transition-all text-slate-700">
              <option value="">All Statuses</option>
              <option value="P">Pending Orders</option>
              <option value="C">Completed Orders</option>
              <option value="F">Failed/Canceled</option>
            </select>
          </div>

          <div className="relative w-full">
            <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setFilterMonth(""); }} className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-700 cursor-pointer" title="Filter by Specific Date"/>
          </div>

          <div className="relative w-full">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="month" value={filterMonth} onChange={(e) => { setFilterMonth(e.target.value); setFilterDate(""); }} className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-700 cursor-pointer" title="Filter by Specific Month"/>
          </div>

        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Horizontal scroll wrapper for mobile safety */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-4 sm:px-6 py-4 w-24">Order ID</th>
                <th className="px-4 sm:px-6 py-4">Customer Info</th>
                <th className="px-4 sm:px-6 py-4">Date & Time</th>
                <th className="px-4 sm:px-6 py-4">Total Amount</th>
                <th className="px-4 sm:px-6 py-4 w-32">Status</th>
                <th className="px-4 sm:px-6 py-4 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && allOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" /> Loading...</td></tr>
              ) : currentDisplayedOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400"><AlertCircle size={32} className="mx-auto mb-3 text-slate-300" /> No orders match your filters.</td></tr>
              ) : (
                currentDisplayedOrders.map((order) => {
                  const subTotal = order.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
                  const shipping = Number(order.delivery_charge || 0);
                  const discount = Number(order.discount_amount || 0);
                  const total = Math.max(0, Math.round(subTotal + shipping - discount)); 

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-4 sm:px-6 py-4 font-extrabold text-slate-700">#{order.id.toString().padStart(4, '0')}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <p className="font-bold text-slate-700 truncate max-w-[150px] sm:max-w-[200px]">{order.first_name || `Cust-ID: ${order.customer}`}</p>
                        <p className="text-xs text-slate-500">{order.phone || "No phone"}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-slate-500 font-medium whitespace-nowrap">{new Date(order.placed_at).toLocaleDateString()}</td>
                      
                      <td className="px-4 sm:px-6 py-4">
                        <p className="font-bold text-emerald-600">${total}</p>
                        {order.coupon_code && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-bold">
                            {order.coupon_code}
                          </span>
                        )}
                      </td>
                      
                      <td className="px-4 sm:px-6 py-4">{renderStatusBadge(order.payment_status)}</td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setSelectedOrder(order); setIsDetailsOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors border border-emerald-200 active:scale-95"><Eye size={14} /> <span className="hidden sm:inline">View</span></button>
                          <button onClick={() => handleDelete(order.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors active:scale-95"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-between sm:justify-center gap-4 sm:gap-6 bg-slate-50/50">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 text-slate-600 transition-all shadow-sm bg-white"><ChevronLeft size={18} /></button>
            <span className="text-xs sm:text-sm font-bold tracking-wide text-slate-600">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 text-slate-600 transition-all shadow-sm bg-white"><ChevronRight size={18} /></button>
          </div>
        )}
      </div>

      <OrderDetailsModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} order={selectedOrder} onUpdate={handleOrderUpdated} />
      
      {/* Auto-refresh table after creating new order */}
      <CreateOrderModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={() => mutate()} />
    </div>
  );
}