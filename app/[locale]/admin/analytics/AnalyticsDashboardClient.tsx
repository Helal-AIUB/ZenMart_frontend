"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Users, ShoppingBag, MousePointerClick, Activity } from "lucide-react";

interface AnalyticsClientProps {
  initialData: any;
}

export default function AnalyticsDashboardClient({ initialData }: AnalyticsClientProps) {
  const gaData = initialData || {};

  // 🟢 Data Formatter: Top Pages er nam gulo clean ebong perfect korar jonno
  const formattedTopPages = useMemo(() => {
    if (!gaData.top_pages) return [];
    
    return gaData.top_pages.map((page: any) => {
      let cleanTitle = page.title || "Unknown Page";
      
      // GA4 er "(not set)" ba unknown link gulo k Direct hisabe dhore nibe
      if (cleanTitle === "(not set)") cleanTitle = "Direct / Homepage";

      // Title theke " | PetoraBD" ba " - PetoraBD" kete felbe
      cleanTitle = cleanTitle.replace(/\s*[|\-]\s*Petora(?:BD)?/gi, "").trim();

      // Nam onnek boro hole 25 character er por "..." bosiye dibe jate chart na bhenge jai
      if (cleanTitle.length > 25) {
        cleanTitle = cleanTitle.substring(0, 25) + "...";
      }

      return {
        ...page,
        displayTitle: cleanTitle || "Unknown Page",
      };
    });
  }, [gaData.top_pages]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-[1440px] mx-auto">
        
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics Overview</h1>
            <p className="text-gray-500 mt-1">Track your store performance and visitor insights</p>
          </div>
          <div className="flex gap-2">
            <select className="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer">
              <option>Last 30 Days (Live)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Real-Time Users" 
            value={gaData.realtime_active_users || "0"} 
            trend="Live Now" 
            isPositive={true} 
            icon={<Activity className="w-6 h-6 text-teal-600" />} 
            delay={0.1}
          />
          <StatCard 
            title="Total Sales" 
            value={gaData.total_sales ? `$${gaData.total_sales.toLocaleString()}` : "$0"} 
            trend="Overall" 
            isPositive={true} 
            icon={<ShoppingBag className="w-6 h-6 text-blue-600" />} 
            delay={0.2}
          />
          <StatCard 
            title="Total Page Views" 
            value={gaData.last_30_days?.total_views?.toLocaleString() || "0"} 
            trend="Last 30 days" 
            isPositive={true} 
            icon={<MousePointerClick className="w-6 h-6 text-purple-600" />} 
            delay={0.3}
          />
          <StatCard 
            title="Total Visitors" 
            value={gaData.last_30_days?.total_users?.toLocaleString() || "0"} 
            trend="Last 30 days" 
            isPositive={true} 
            icon={<Users className="w-6 h-6 text-orange-600" />} 
            delay={0.4}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Traffic Trend (Live)</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gaData.traffic_trend || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="pageViews" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="users" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Pages (Live)</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedTopPages} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="displayTitle" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#4b5563', fontSize: 12}} 
                    width={140} /* 🟢 Width barano hoyeche jate boro nam gulo ek line e boste pare */
                  />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    formatter={(value: any) => [value, 'Views']}
                  />
                  <Bar dataKey="views" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, trend, isPositive, icon, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-xl">
          {icon}
        </div>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend}
        </span>
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </motion.div>
  );
}