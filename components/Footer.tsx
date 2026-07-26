"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand & Description */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="text-3xl font-extrabold text-teal-600 tracking-tighter mb-4 inline-block"
            >
              ZenMart
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Elevating your lifestyle with premium products, curated
              collections, and exclusive drops. Shop smart, live better.
            </p>
            {/* Social Icons Placeholder */}
            <div className="flex gap-4 text-gray-400">
              <span className="hover:text-teal-600 cursor-pointer transition-colors text-xl">
                📘
              </span>
              <span className="hover:text-teal-600 cursor-pointer transition-colors text-xl">
                📸
              </span>
              <span className="hover:text-teal-600 cursor-pointer transition-colors text-xl">
                🐦
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4 uppercase tracking-wider text-sm">
              Explore
            </h3>
            <ul className="space-y-3 text-gray-500 text-sm font-medium">
              <li>
                <Link
                  href="/"
                  className="hover:text-teal-600 transition-colors"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-teal-600 transition-colors"
                >
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-teal-600 transition-colors"
                >
                  Flash Sales
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-teal-600 transition-colors"
                >
                  Gift Cards
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4 uppercase tracking-wider text-sm">
              Support
            </h3>
            <ul className="space-y-3 text-gray-500 text-sm font-medium">
              <li>
                <Link
                  href="#"
                  className="hover:text-teal-600 transition-colors"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-teal-600 transition-colors"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-teal-600 transition-colors"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-teal-600 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h3 className="text-gray-900 font-bold mb-4 uppercase tracking-wider text-sm">
              Stay Updated
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Subscribe to get special offers, free giveaways, and early access
              to new collections.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm transition-all"
                required
              />
              <button
                type="submit"
                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-teal-600 transition-colors shadow-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} ZenMart. All rights reserved.
          </p>
          <div className="flex gap-6 text-gray-400 text-sm">
            <Link href="#" className="hover:text-gray-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-gray-600 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
