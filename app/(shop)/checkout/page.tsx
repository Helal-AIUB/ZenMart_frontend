"use client";

import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/apiClient";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems } = useCartStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await apiClient.get("/auth/users/me/");
        setIsLoading(false);
      } catch (error) {
        router.push("/signin?redirect=/checkout");
      }
    };
    verifyAuth();
  }, [router]);

  const subTotal = cartItems?.reduce((total: number, item: any) => {
    const price = Number(item.product?.unit_price || item.unit_price || 0);
    return total + (price * item.quantity);
  }, 0) || 0;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <main className="max-w-xl mx-auto px-4 py-32 min-h-screen flex items-center justify-center font-sans">
        <div className="bg-card border border-card-border p-10 rounded-[2.5rem] shadow-xl text-center w-full">
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-md">
            ✓
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2">Order Placed Successfully!</h1>
          <p className="text-xs text-muted mb-8">
            Thank you for shopping with ZenMart. Your order has been successfully placed.
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-3.5 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primary-hover transition-all shadow-md"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-28 min-h-screen font-sans">
      <div className="h-6"></div>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground tracking-tight">Checkout</h1>
        <p className="text-xs text-muted mt-1">Complete your shipping and payment details to place order.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 bg-card border border-card-border rounded-[2.5rem] p-8 shadow-sm flex flex-col gap-6">
          <h2 className="text-base font-black text-foreground uppercase tracking-wider pb-3 border-b border-card-border">
            Shipping Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted">First Name</label>
              <input required type="text" placeholder="John" className="px-4 py-3 rounded-xl bg-background border border-card-border text-xs text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted">Last Name</label>
              <input required type="text" placeholder="Doe" className="px-4 py-3 rounded-xl bg-background border border-card-border text-xs text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted">Street Address</label>
            <input required type="text" placeholder="123 Main Street, Apt 4B" className="px-4 py-3 rounded-xl bg-background border border-card-border text-xs text-foreground focus:outline-none focus:border-primary transition-all" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted">City</label>
              <input required type="text" placeholder="Bhola" className="px-4 py-3 rounded-xl bg-background border border-card-border text-xs text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted">Postal Code</label>
              <input required type="text" placeholder="10001" className="px-4 py-3 rounded-xl bg-background border border-card-border text-xs text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted">Phone Number</label>
              <input required type="tel" placeholder="+880 -xxxx-xxxx" className="px-4 py-3 rounded-xl bg-background border border-card-border text-xs text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full py-4 rounded-2xl bg-primary text-white font-black text-xs hover:bg-primary-hover transition-all shadow-md cursor-pointer tracking-wide"
          >
            Place Order (${Math.round(subTotal)})
          </button>
        </form>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-card border border-card-border rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-base font-black text-foreground uppercase tracking-wider pb-3 border-b border-card-border mb-4">
              Order Summary
            </h2>

            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar mb-6">
              {cartItems?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted font-medium line-clamp-1 max-w-[200px]">
                    {item.product?.title} <strong className="text-foreground">x{item.quantity}</strong>
                  </span>
                  <span className="font-bold text-foreground">
                    ${Math.round(Number(item.product?.unit_price || 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-card-border text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="font-bold text-foreground">${Math.round(subTotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between text-sm font-black text-foreground pt-3 border-t border-card-border mt-2">
                <span>Total Amount</span>
                <span className="text-primary">${Math.round(subTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}