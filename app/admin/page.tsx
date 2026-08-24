"use client";

import { useEffect, useState } from "react";
import { Package, Users, ShoppingCart, AlertTriangle, TrendingUp } from "lucide-react";

interface DashboardStats {
  total_products: number;
  low_stock_alerts: number;
  total_orders: number;
  total_customers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const fetchStats = async () => {
    //   try {
    //     const res = await fetch("http://127.0.0.1:8000/store/dashboard-stats/", {
    //       credentials: "include", 
    //     });
    //     if (res.ok) {
    //       const data = await res.json();
    //       setStats(data);
    //     }
    //   } catch (error) {
    //     console.error("Failed to fetch dashboard stats", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:8000/store/dashboard-stats/", {
          credentials: "include", 
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          // এরর ধরার জন্য এই অংশটুকু যুক্ত করা হলো
          console.error("API Error Status:", res.status);
          const errorData = await res.json();
          console.error("API Error Message:", errorData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Products", value: stats?.total_products || 0, icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Total Orders", value: stats?.total_orders || 0, icon: ShoppingCart, color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "Total Customers", value: stats?.total_customers || 0, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
    { title: "Low Stock Alerts", value: stats?.low_stock_alerts || 0, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition">
          <TrendingUp size={16} /> Download Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:-translate-y-1 duration-300">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
                {loading ? (
                  <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
                ) : (
                  <h3 className="text-3xl font-bold text-slate-800">{card.value}</h3>
                )}
              </div>
              <div className={`p-4 rounded-xl ${card.bg} ${card.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Future space for Charts and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Revenue Analytics</h2>
          <div className="flex items-center justify-center h-full text-slate-400">
            Chart integration goes here...
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Orders</h2>
          <div className="flex items-center justify-center h-full text-slate-400">
            Order list goes here...
          </div>
        </div>
      </div>
    </div>
  );
}