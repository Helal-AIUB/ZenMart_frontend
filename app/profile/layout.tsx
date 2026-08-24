"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiClient } from "@/services/apiClient";
import { 
  LayoutDashboard, ShoppingBag, MapPin, CreditCard, Heart, Dog, Settings, Bell, LogOut, CheckCircle2, Crown 
} from "lucide-react";
import toast from "react-hot-toast";

const navItems = [
  { name: "Dashboard", href: "/profile", icon: LayoutDashboard },
  { name: "My Orders", href: "/profile/orders", icon: ShoppingBag },
  { name: "Address Book", href: "/profile/addresses", icon: MapPin },
  { name: "Payment Methods", href: "/profile/payments", icon: CreditCard },
  { name: "Wishlist", href: "/profile/wishlist", icon: Heart },
  { name: "My Pets", href: "/profile/pets", icon: Dog },
  { name: "Profile Settings", href: "/profile/settings", icon: Settings },
  { name: "Notification Settings", href: "/profile/notifications", icon: Bell },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // 🟢 Dynamic States
  const [userData, setUserData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);

  useEffect(() => {
    const fetchLayoutData = async () => {
      try {
        // User (Name, Email) এবং Customer (Membership) ডেটা একসাথে কল করা
        const [userRes, customerRes] = await Promise.all([
          apiClient.get("/auth/users/me/"),
          apiClient.get("/store/customers/me/")
        ]);
        setUserData(userRes.data);
        setCustomerData(customerRes.data);
      } catch (error) {
        console.error("Failed to load user data for sidebar");
      }
    };
    fetchLayoutData();
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
       localStorage.removeItem("access"); // Token remove (আপনার সিস্টেম অনুযায়ী)
       localStorage.removeItem("refresh");
    }
    toast.success("Logged out successfully");
    router.push("/signin");
  };

  // 🟢 Dynamic Values
  const fullName = userData?.first_name ? `${userData.first_name} ${userData.last_name || ''}` : "Loading...";
  const email = userData?.email || "loading@email.com";
  const membershipText = customerData?.membership === 'G' ? 'Gold' : customerData?.membership === 'S' ? 'Silver' : 'Bronze';

  return (
    <div className="bg-slate-50/50 min-h-screen pt-24 pb-12 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        
        {/* --- LEFT SIDEBAR --- */}
        <aside className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
          
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="flex flex-col items-center text-center mb-8 mt-2">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden mb-3">
                  {/* Dynamic Avatar based on First Name */}
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.first_name || 'Petora'}`} alt="User" className="w-full h-full object-cover" />
                </div>
                <button className="absolute bottom-4 right-0 bg-white p-1.5 rounded-full shadow-md text-slate-600 hover:text-emerald-600 transition-colors">
                  <Settings size={14} />
                </button>
              </div>
              <h2 className="text-xl font-bold text-slate-800">{fullName}</h2>
              <p className="text-sm text-slate-500 mb-2">{email}</p>
              <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider rounded-full">
                {membershipText} Member
              </span>
            </div>

            <nav className="w-full flex flex-col gap-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/profile");
                return (
                  <Link 
                    key={item.name} href={item.href}
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 group
                      ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                  >
                    <item.icon size={18} className={isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'} />
                    {item.name}
                  </Link>
                );
              })}
              <div className="h-px w-full bg-slate-100 my-2"></div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-all duration-200"
              >
                <LogOut size={18} /> Logout
              </button>
            </nav>
          </div>

          {/* Promotional Banner */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2rem] p-6 shadow-sm border border-amber-100 relative overflow-hidden group cursor-pointer">
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Crown size={20} className="text-amber-500" /> Petora BD Premium
              </h3>
              <ul className="flex flex-col gap-2.5 mb-6">
                <li className="flex items-center gap-2 text-sm text-slate-600 font-medium"><CheckCircle2 size={16} className="text-amber-500" /> Free Delivery</li>
                <li className="flex items-center gap-2 text-sm text-slate-600 font-medium"><CheckCircle2 size={16} className="text-amber-500" /> Exclusive Discounts</li>
                <li className="flex items-center gap-2 text-sm text-slate-600 font-medium"><CheckCircle2 size={16} className="text-amber-500" /> Priority Support</li>
              </ul>
              <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all w-fit">
                Upgrade Now
              </button>
            </div>
            <div className="absolute -bottom-4 -right-4 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
              <Dog size={120} className="text-amber-200" />
            </div>
          </div>
        </aside>

        {/* --- RIGHT CONTENT AREA --- */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}