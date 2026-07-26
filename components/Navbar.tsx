// frontend/src/components/Navbar.tsx
'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  // স্ক্রল করলে নেভবারের ডিজাইন চেঞ্জ করার জন্য স্টেট
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md border-gray-200 shadow-[0_4px_30px_rgba(0,0,0,0.03)] py-3' 
          : 'bg-white border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center gap-8">
        
        {/* 1. Premium Logo */}
        <Link href="/" className="group flex items-center gap-1">
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 tracking-tighter group-hover:scale-105 transition-transform duration-300">
            ZenMart
          </span>
          <span className="w-2 h-2 rounded-full bg-yellow-400 mb-4 animate-pulse"></span>
        </Link>
        
        {/* 2. Interactive Search Bar (Hidden on very small screens) */}
        <div className="hidden md:block flex-1 max-w-2xl relative group">
          <input 
            type="text" 
            placeholder="Search for premium products..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pl-6 pr-32 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all duration-300 shadow-inner"
          />
          <button className="absolute right-1 top-1 bottom-1 bg-gray-900 text-white px-6 rounded-full font-bold text-sm hover:bg-teal-600 transition-colors duration-300 flex items-center gap-2 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Search
          </button>
        </div>

        {/* 3. Navigation Links & Action Icons */}
        <div className="flex items-center gap-6 md:gap-8">
          
          {/* Main Links */}
          <div className="hidden lg:flex items-center gap-6 font-bold text-sm text-gray-600">
            <Link href="/" className="hover:text-teal-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-600 hover:after:w-full after:transition-all after:duration-300 pb-1">Shop</Link>
            <Link href="#" className="hover:text-teal-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-600 hover:after:w-full after:transition-all after:duration-300 pb-1">Offers</Link>
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block h-8 w-px bg-gray-200"></div>

          {/* User Profile (Hello, Sign In) */}
          <Link href="#" className="flex items-center gap-2 group cursor-pointer">
            <div className="p-2 rounded-full bg-gray-50 group-hover:bg-teal-50 border border-gray-100 transition-colors duration-300 text-gray-600 group-hover:text-teal-600">
              {/* User SVG Icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-[10px] font-semibold text-gray-400 group-hover:text-teal-500 transition-colors leading-none mb-1">Hello, Sign in</span>
              <span className="text-sm font-extrabold text-gray-800 group-hover:text-teal-700 transition-colors leading-none">Account</span>
            </div>
          </Link>

          {/* Shopping Cart Icon with Badge */}
          <Link href="/cart" className="relative group p-2">
            <div className="text-gray-600 group-hover:text-teal-600 transition-colors duration-300 transform group-hover:scale-110">
              {/* Cart SVG Icon */}
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            
            {/* The Notification Badge (Red Circle) */}
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-[bounce_2s_infinite]">
              3
            </span>
          </Link>

        </div>
      </div>
    </nav>
  );
}