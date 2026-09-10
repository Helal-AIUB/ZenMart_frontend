"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query"; // 🟢 Import useQuery
import { 
  Package, Users, ShoppingCart, AlertTriangle, TrendingUp, 
  ChevronRight, Clock, CheckCircle2, XCircle 
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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // 🟢 1. Fetch Dashboard Stats using React Query
  const { data: stats, isLoading: loadingStats } = useQuery<DashboardStats>({
    queryKey: ["dashboard_stats"],
    queryFn: async () => {
      const res = await apiClient.get("/store/dashboard-stats/");
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // 🟢 2. Fetch Revenue Analytics using React Query
  const { data: revenueData = [], isLoading: loadingRevenue } = useQuery({
    queryKey: ["revenue_analytics"],
    queryFn: async () => {
      const res = await apiClient.get('/store/revenue-analytics/');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, 
  });

  // 🟢 3. Fetch Recent Orders using React Query
  const { data: recentOrders = [], isLoading: loadingOrders } = useQuery<Order[]>({
    queryKey: ["recent_orders"],
    queryFn: async () => {
      const res = await apiClient.get('/store/orders/');
      const allOrders = res.data.results || res.data;
      const sortedOrders = allOrders.sort((a: Order, b: Order) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime());
      return sortedOrders.slice(0, 5);
    },
    staleTime: 5 * 60 * 1000,
  });

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
      <ReportDownloadModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />

      {/* Header section optimized for mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <button 
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto"
        >
          <TrendingUp size={16} /> Download Report
        </button>
      </div>

      {/* Stats Grid - with Skeleton Loader */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:-translate-y-1 duration-300">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">{card.title}</p>
                {loadingStats ? (
                  <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg mt-1"></div>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4 sm:mt-8">
        
        {/* Revenue Analytics Chart */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[350px] sm:min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800">Revenue Analytics</h2>
            <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-500 bg-slate-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">Last 30 Days</span>
          </div>

          <div className="flex-1 w-full min-h-[250px] sm:min-h-[300px]">
            {loadingRevenue ? (
              // 🟢 Skeleton for Chart
              <div className="w-full h-full flex items-end justify-between gap-2 px-2 pb-4">
                {[45, 70, 35, 80, 50, 65, 40].map((height, i) => (
                  <div 
                    key={i} 
                    className="w-full bg-slate-100 rounded-t-sm animate-pulse" 
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
            ) : revenueData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs sm:text-sm font-bold text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                No revenue data found for the last 30 days.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} minTickGap={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[350px] sm:min-h-[400px]">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[10px] sm:text-xs md:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
              View All <ChevronRight size={14} className="sm:w-4 sm:h-4" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col gap-2 sm:gap-3">
            {loadingOrders ? (
              // 🟢 Skeleton for Recent Orders
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 animate-pulse">
                  <div className="flex items-center gap-3 w-2/3">
                    <div className="w-9 h-9 bg-slate-100 rounded-xl shrink-0"></div>
                    <div className="w-full">
                      <div className="h-3 w-3/4 bg-slate-100 rounded mb-2"></div>
                      <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-1/4">
                    <div className="h-3 w-full bg-slate-100 rounded"></div>
                    <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                  </div>
                </div>
              ))
            ) : recentOrders.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs sm:text-sm font-bold text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-4 text-center">
                No recent orders found.
              </div>
            ) : (
              recentOrders.map((order) => {
                const total = order.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
                const status = getStatusConfig(order.payment_status);
                const StatusIcon = status.icon;

                return (
                  <div key={order.id} className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 overflow-hidden">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl shrink-0 ${status.bg} ${status.color}`}>
                        <StatusIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs lg:text-sm font-bold text-slate-800 mb-0.5 group-hover:text-emerald-600 transition-colors truncate">
                          Order #{order.id.toString().padStart(4, '0')}
                        </p>
                        <p className="text-[9px] sm:text-[10px] lg:text-xs text-slate-500 font-medium truncate">
                          {order.first_name ? `${order.first_name} ${order.last_name || ''}` : `Cust ID: ${order.customer}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-[11px] sm:text-xs lg:text-sm font-black text-slate-800 mb-0.5">${total.toFixed(2)}</p>
                      <p className={`text-[8px] sm:text-[9px] lg:text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
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