"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Package, Users, ShoppingCart, AlertTriangle, TrendingUp, 
  Loader2, ChevronRight, Clock, CheckCircle2, XCircle 
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiClient } from "@/services/apiClient";
import ReportDownloadModal from "@/components/admin/ReportDownloadModal";

// --- Types ---
interface DashboardStats {
  total_products: number;
  low_stock_alerts: number;
  total_orders: number;
  total_customers: number;
}

interface OrderItem {
  unit_price: number;
  quantity: number;
}

interface Order {
  id: number;
  first_name?: string;
  last_name?: string;
  customer: number;
  placed_at: string;
  payment_status: 'P' | 'C' | 'F';
  items: OrderItem[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Chart States
  const [revenueData, setRevenueData] = useState([]);
  const [loadingRevenue, setLoadingRevenue] = useState(true);

  // Recent Orders States
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // 🟢 Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    // 1. Fetch Dashboard Stats
    const fetchStats = async () => {
      try {
        const res = await apiClient.get("/store/dashboard-stats/");
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoadingStats(false);
      }
    };

    // 2. Fetch Revenue Analytics for Chart
    const fetchRevenue = async () => {
      try {
        const res = await apiClient.get('/store/revenue-analytics/');
        setRevenueData(res.data);
      } catch (error) {
        console.error("Failed to fetch revenue analytics", error);
      } finally {
        setLoadingRevenue(false);
      }
    };

    // 3. Fetch Recent Orders
    const fetchRecentOrders = async () => {
      try {
        const res = await apiClient.get('/store/orders/');
        const allOrders = res.data.results || res.data;
        const sortedOrders = allOrders.sort((a: Order, b: Order) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime());
        setRecentOrders(sortedOrders.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch recent orders", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchStats();
    fetchRevenue();
    fetchRecentOrders();
  }, []);

  const statCards = [
    { title: "Total Products", value: stats?.total_products || 0, icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Total Orders", value: stats?.total_orders || 0, icon: ShoppingCart, color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "Total Customers", value: stats?.total_customers || 0, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
    { title: "Low Stock Alerts", value: stats?.low_stock_alerts || 0, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50" },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white p-3 rounded-xl shadow-xl border border-slate-700">
          <p className="text-xs text-slate-300 font-bold uppercase tracking-wider mb-1">{label}</p>
          <p className="text-lg font-black text-emerald-400">
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'C': return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100', text: 'Paid' };
      case 'P': return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100', text: 'Pending' };
      case 'F': return { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-100', text: 'Failed' };
      default: return { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100', text: 'Unknown' };
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10">
      
      {/* 🟢 Include Modal here */}
      <ReportDownloadModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <button 
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <TrendingUp size={16} /> Download Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:-translate-y-1 duration-300">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">{card.title}</p>
                {loadingStats ? (
                  <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
                ) : (
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-800">{card.value}</h3>
                )}
              </div>
              <div className={`p-3 sm:p-4 rounded-xl ${card.bg} ${card.color}`}>
                <Icon size={20} className="sm:w-6 sm:h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Recent Orders Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Revenue Analytics Chart */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800">Revenue Analytics</h2>
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Last 30 Days</span>
          </div>

          <div className="flex-1 w-full min-h-[300px]">
            {loadingRevenue ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-emerald-500">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm font-bold text-slate-400">Loading Chart Data...</p>
              </div>
            ) : revenueData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                No revenue data found for the last 30 days.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[11px] sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {loadingOrders ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-emerald-500">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm font-bold text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                No recent orders found.
              </div>
            ) : (
              recentOrders.map((order) => {
                const total = order.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
                const status = getStatusConfig(order.payment_status);
                const StatusIcon = status.icon;

                return (
                  <div key={order.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl ${status.bg} ${status.color}`}>
                        <StatusIcon size={18} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 mb-0.5 group-hover:text-emerald-600 transition-colors">
                          Order #{order.id.toString().padStart(4, '0')}
                        </p>
                        <p className="text-[10px] sm:text-xs text-slate-500 font-medium line-clamp-1">
                          {order.first_name ? `${order.first_name} ${order.last_name || ''}` : `Cust ID: ${order.customer}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-black text-slate-800 mb-0.5">${total.toFixed(2)}</p>
                      <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                        {status.text}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}