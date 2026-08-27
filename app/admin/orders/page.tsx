"use client";

import { useEffect, useState, useMemo } from "react";
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
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/store/orders/');
      setAllOrders(res.data.results || res.data);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Real-time Smart Filtering (Monthly Filter Fixed 🟢)
  const filteredOrders = useMemo(() => {
    return allOrders.filter(order => {
      const matchId = filterId ? order.id.toString().includes(filterId) : true;
      const matchStatus = filterStatus ? order.payment_status === filterStatus : true;
      
      // Safe String Manipulation for Timezone-free date handling
      // Extract "YYYY-MM-DD" from "2026-08-24T11:12:46Z"
      const orderDateStr = order.placed_at.split('T')[0];
      const orderMonthStr = orderDateStr.substring(0, 7); // Output: "YYYY-MM"

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
    try {
      await apiClient.delete(`/store/orders/${id}/`);
      toast.success("Order deleted successfully");
      setAllOrders(prev => prev.filter(o => o.id !== id)); 
    } catch (error) {
      toast.error("Failed to delete order.");
    }
  };

  const handleOrderUpdated = (updatedOrder: Order) => {
    setAllOrders((prev) => prev.map((o) => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'C': return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold"><CheckCircle size={12} /> Complete</span>;
      case 'P': return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold"><Clock size={12} /> Pending</span>;
      case 'F': return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold"><XCircle size={12} /> Failed</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 pb-10 font-sans">
      
      {/* Header with Add Order Button 🟢 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Order Management</h1>
          <p className="text-sm text-slate-500 mt-1">View, track, and update customer orders ({totalItems} records found)</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Add Order
        </button>
      </div>

      {/* Advanced Premium Toolbar / Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row items-center gap-4">
        <div className="relative w-full lg:w-1/4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="number" placeholder="Search by Order ID..." value={filterId} onChange={(e) => setFilterId(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white" />
        </div>
        
        <div className="w-full lg:w-1/4">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer outline-none transition-all text-slate-700">
            <option value="">All Statuses</option>
            <option value="P">Pending Orders</option>
            <option value="C">Completed Orders</option>
            <option value="F">Failed/Canceled</option>
          </select>
        </div>

        <div className="relative w-full lg:w-1/4">
          <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setFilterMonth(""); }} className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-700 cursor-pointer" title="Filter by Specific Date"/>
        </div>

        {/* 🟢 Fixed Monthly Picker */}
        <div className="relative w-full lg:w-1/4">
          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input type="month" value={filterMonth} onChange={(e) => { setFilterMonth(e.target.value); setFilterDate(""); }} className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-700 cursor-pointer" title="Filter by Specific Month"/>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-5 w-24">Order ID</th>
                <th className="px-6 py-5">Customer Info</th>
                <th className="px-6 py-5">Date & Time</th>
                <th className="px-6 py-5">Total Amount</th>
                <th className="px-6 py-5 w-32">Status</th>
                <th className="px-6 py-5 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" /> Loading...</td></tr>
              ) : currentDisplayedOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400"><AlertCircle size={32} className="mx-auto mb-3 text-slate-300" /> No orders match your filters.</td></tr>
              ) : (
                currentDisplayedOrders.map((order) => {
                  // const total = order.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
                  const total = order.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0) + Number(order.delivery_charge || 0);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 font-extrabold text-slate-700">#{order.id.toString().padStart(4, '0')}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700">{order.first_name || `Cust-ID: ${order.customer}`}</p>
                        <p className="text-xs text-slate-500">{order.phone || "No phone"}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">{new Date(order.placed_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600">${total.toFixed(2)}</td>
                      <td className="px-6 py-4">{renderStatusBadge(order.payment_status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setSelectedOrder(order); setIsDetailsOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors border border-emerald-200"><Eye size={14} /> View</button>
                          <button onClick={() => handleDelete(order.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
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
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-center gap-6 bg-slate-50/50">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 text-slate-600 transition-all shadow-sm"><ChevronLeft size={18} /></button>
            <span className="text-sm font-bold tracking-wide text-slate-600">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 text-slate-600 transition-all shadow-sm"><ChevronRight size={18} /></button>
          </div>
        )}
      </div>

      {/* Details/Edit Modal */}
      <OrderDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        order={selectedOrder} 
        onUpdate={handleOrderUpdated} 
      />

      {/* 🟢 Create New Order Modal */}
      <CreateOrderModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={fetchOrders} // Refresh list after creation
      />
    </div>
  );
}