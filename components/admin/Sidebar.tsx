"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, ShoppingBag, Users, 
  ShoppingCart, Bone, Settings, ChevronLeft, ChevronRight, TicketPercent 
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { name: "Orders", icon: ShoppingCart, path: "/admin/orders" },
  { name: "Products", icon: ShoppingBag, path: "/admin/products" },
  { name: "Coupons", icon: TicketPercent, path: "/admin/coupons" },
  { name: "Customers", icon: Users, path: "/admin/customers" },
  { name: "Pet Content", icon: Bone, path: "/admin/pet-content" },
  { name: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="relative flex flex-col h-screen bg-slate-900 text-slate-100 border-r border-slate-800"
    >
      <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
        {!isCollapsed && (
          <span className="text-xl font-bold tracking-wider text-emerald-400">
            PetoraBD
          </span>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors mx-auto"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || (pathname?.startsWith(item.path) && item.path !== "/admin");
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.path}>
              <div
                className={twMerge(
                  clsx(
                    "flex items-center px-3 py-3 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-emerald-500/10 text-emerald-400" 
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-100"
                  )
                )}
              >
                <Icon size={22} className="min-w-[22px]" />
                {!isCollapsed && (
                  <span className="ml-4 text-sm font-medium whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}