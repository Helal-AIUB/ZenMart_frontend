"use client";

import { Bell, User, Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
      
      {/* Premium Welcome Message */}
      <div className="flex flex-col justify-center">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          Welcome to Petora BD Portal 
          <Sparkles size={18} className="text-emerald-500 animate-pulse" />
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Manage your store, track orders, and monitor performance.
        </p>
      </div>

      {/* Right Side: Notifications & Profile */}
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition-colors">
          <Bell size={20} />
          {/* Notification Dot */}
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
        </button>
        
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