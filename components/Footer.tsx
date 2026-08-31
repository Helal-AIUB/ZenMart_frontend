"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  const { data: settingsData } = useQuery({
    queryKey: ["store_settings"],
    queryFn: async () => {
      const res = await apiClient.get("/store/settings/");
      return res.data;
    },
  });

  const settings = Array.isArray(settingsData) 
    ? settingsData[0] 
    : settingsData?.results?.[0] || settingsData || {};

  const storeName = settings.store_name || "Petora BD";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0b1315] text-white pt-16 pb-8 mt-16 font-sans border border-card-border/20 shadow-2xl relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 blur-[140px] pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 pb-12 border-b border-white/10 relative z-10">
          
          {/* Brand Info & Contact Section */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-1 group w-fit">
              <span className="text-3xl font-black text-primary tracking-tight">
                {storeName}
              </span>
              <span className="w-2 h-2 rounded-full bg-yellow-400 mt-2 animate-pulse"></span>
            </Link>
            
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed font-normal">
              {settings.short_description || "Your one-stop destination for premium pet care products, top brands and unbeatable prices. Shop smart, live better."}
            </p>

            {/* Dynamic Contact Details */}
            <div className="flex flex-col gap-2.5 mt-2 text-xs text-gray-400">
              {settings.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin size={14} className="shrink-0 text-primary mt-0.5" />
                  <span className="leading-snug">{settings.address}</span>
                </div>
              )}
              {settings.contact_phone && (
                <div className="flex items-center gap-2.5">
                  <Phone size={14} className="shrink-0 text-primary" />
                  <span>{settings.contact_phone}</span>
                </div>
              )}
              {settings.support_email && (
                <div className="flex items-center gap-2.5">
                  <Mail size={14} className="shrink-0 text-primary" />
                  <span>{settings.support_email}</span>
                </div>
              )}
            </div>

            {/* 🟢 SVGs used directly for Social Icons to bypass Lucide missing exports */}
            <div className="flex items-center gap-3 mt-2">
              {settings.facebook_link && (
                <a href={settings.facebook_link} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 cursor-pointer shadow-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {settings.instagram_link && (
                <a href={settings.instagram_link} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 cursor-pointer shadow-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              )}
              {settings.youtube_link && (
                <a href={settings.youtube_link} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 cursor-pointer shadow-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2C5.12 19.5 12 19.5 12 19.5s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-extrabold tracking-wider uppercase text-white mb-1">Shop</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-400 font-medium">
              <li><Link href="/products" className="hover:text-primary transition-colors">All Categories</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">Best Sellers</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">Flash Sale</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">New Arrivals</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">Brands</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-extrabold tracking-wider uppercase text-white mb-1">Customer Service</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-400 font-medium">
              <li><Link href="#" className="hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Shipping Info</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-extrabold tracking-wider uppercase text-white mb-1">Company</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-400 font-medium">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Press & Media</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Become a Seller</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* App Download Section */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h4 className="text-sm font-extrabold tracking-wider uppercase text-white mb-1">Download Our App</h4>
            <p className="text-[11px] text-gray-400 leading-tight">Shop on the go with our mobile app</p>
            <div className="flex flex-col gap-2">
              <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-white/20 transition-all">
                <span className="text-sm">🍏</span>
                <div className="flex flex-col">
                  <span className="text-[8px] text-gray-300 leading-none">Download on the</span>
                  <span className="text-[11px] font-bold text-white leading-tight">App Store</span>
                </div>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-white/20 transition-all">
                <span className="text-sm">🤖</span>
                <div className="flex flex-col">
                  <span className="text-[8px] text-gray-300 leading-none">GET IT ON</span>
                  <span className="text-[11px] font-bold text-white leading-tight">Google Play</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription Row */}
        <div className="py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center border-b border-white/10 relative z-10">
          <div>
            <h4 className="text-sm font-extrabold text-white mb-0.5">Stay Updated</h4>
            <p className="text-xs text-gray-400">Subscribe to get special offers, free giveaways and early access to new arrivals.</p>
          </div>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary flex-1 transition-colors"
            />
            <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-primary-hover transition-colors shadow-md cursor-pointer shrink-0">
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col lg:flex-row items-center justify-between gap-6 text-xs text-gray-400 font-medium relative z-10">
          <p>© {currentYear} {storeName}. All rights reserved.</p>

          <div className="flex items-center gap-6 flex-wrap justify-center">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">Cookies Policy</Link>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-[11px] text-gray-400 mr-1">We Accept</span>
            <span className="bg-white text-blue-800 px-2.5 py-1 rounded text-[10px] font-black tracking-tighter shadow-sm">VISA</span>
            <span className="bg-white text-orange-600 px-2 py-1 rounded text-[10px] font-black tracking-tighter shadow-sm">mastercard</span>
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-black tracking-tighter shadow-sm">AMEX</span>
            <span className="bg-pink-600 text-white px-2 py-1 rounded text-[10px] font-bold tracking-tight shadow-sm">bKash</span>
            <span className="bg-orange-500 text-white px-2 py-1 rounded text-[10px] font-bold tracking-tight shadow-sm">Nagad</span>
            <span className="bg-emerald-700 text-white px-2 py-1 rounded text-[10px] font-bold tracking-tight shadow-sm">SSLcommerz</span>
          </div>
        </div>
      </div>
    </footer>
  );
}