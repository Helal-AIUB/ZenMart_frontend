"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "../store/useCartStore";
import { apiClient } from "@/services/apiClient";
import { useWishlistStore } from "@/store/useWishlistStore";

export default function Navbar() {
  const { openCart, cartItems, cartId, fetchCart } = useCartStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { wishlistItems, openWishlist } = useWishlistStore();
  const wishlistCount = wishlistItems.length;

  // Fetch Categories from Database
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiClient.get("/collections/");
      return res.data.results || res.data;
    },
  });

  useEffect(() => {
    setMounted(true);
    if (cartId) {
      fetchCart();
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [cartId, fetchCart]);

  const totalItems =
    cartItems?.reduce((total: number, item: any) => total + item.quantity, 0) ||
    0;
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white ${
        isScrolled ? "shadow-md py-2" : "border-b border-border-color py-4"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4">
        {/* Top Section */}
        <div className="flex justify-between items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 shrink-0 group">
            <span className="text-3xl font-black text-primary tracking-tight group-hover:scale-105 transition-transform duration-300">
              ZenMart
            </span>
            <span className="w-2 h-2 rounded-full bg-yellow-400 mt-2 animate-pulse"></span>
          </Link>

          {/* Interactive Search Bar (Dynamic Categories) */}
          <div className="hidden lg:flex flex-1 max-w-3xl border border-border-color rounded-full items-center pl-4 pr-1 h-12 bg-gray-50 focus-within:bg-white focus-within:border-primary focus-within:shadow-sm transition-all">
            <div className="relative flex items-center border-r border-border-color pr-3">
              <select className="bg-transparent text-sm font-medium text-text-gray focus:outline-none cursor-pointer appearance-none pr-6">
                <option value="">All Categories</option>
                {safeCategories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
              <svg
                className="w-4 h-4 text-text-light absolute right-1 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Search for products, brands and more..."
              className="flex-1 bg-transparent border-none px-4 text-sm text-text-dark placeholder-text-light focus:outline-none focus:ring-0 h-full w-full"
            />
            <button className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-hover transition-colors shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          {/* Quick Links */}
          <div className="hidden xl:flex items-center gap-6 text-sm font-medium text-text-gray">
            <Link
              href="#"
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <span className="text-orange-500">🔥</span> Hot Deals
            </Link>
            <Link
              href="#"
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              New Arrivals
              <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-sm">
                NEW
              </span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              Brands
            </Link>
          </div>

          {/* Action Icons & Profile */}
          <div className="flex items-center gap-5">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative text-text-dark hover:text-primary transition-colors group cursor-pointer"
            >
              <svg
                className="w-6 h-6 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </Link>

            {/* Wishlist Icon in Navbar */}
            <button
              onClick={openWishlist}
              className="relative text-text-dark hover:text-primary transition-colors group cursor-pointer"
            >
              <svg
                className="w-6 h-6 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-badge-red text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Dynamic Cart */}
            <button
              onClick={openCart}
              className="relative text-text-dark hover:text-primary transition-colors mr-2 group cursor-pointer"
            >
              <svg
                className="w-6 h-6 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-badge-red text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white animate-[bounce_2s_infinite]">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            {/* User Profile */}
            <Link
              href="/account"
              className="flex items-center gap-3 pl-4 border-l border-border-color group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-border-color">
                <div className="w-full h-full bg-primary-light flex items-center justify-center text-primary">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-[11px] font-medium text-text-gray leading-tight group-hover:text-primary transition-colors">
                  Hi, Sign In
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-text-dark leading-tight group-hover:text-primary transition-colors">
                    Account
                  </span>
                  <svg
                    className="w-3 h-3 text-text-gray group-hover:text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom Section - Dynamic Categories List */}
        <div
          className={`hidden lg:flex items-center gap-8 text-sm transition-all duration-300 ${isScrolled ? "h-0 opacity-0 overflow-hidden mt-0" : "h-10 opacity-100 mt-1"}`}
        >
          <button className="bg-primary text-white px-5 py-2.5 rounded-md font-semibold flex items-center gap-2 hover:bg-primary-hover transition-colors whitespace-nowrap shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            All Categories
          </button>

          <nav className="flex items-center gap-7 font-medium text-text-gray flex-1 overflow-x-auto hide-scroll-bar">
            {safeCategories.length === 0 ? (
              <div className="w-full flex gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-4 w-20 bg-gray-200 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            ) : (
              safeCategories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/collections/${category.id}`}
                  className="hover:text-primary whitespace-nowrap transition-colors"
                >
                  {category.title}
                </Link>
              ))
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
