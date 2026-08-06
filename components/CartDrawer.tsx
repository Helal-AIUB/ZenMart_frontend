"use client";

import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { useEffect } from "react";

export default function CartDrawer() {
  const { isCartOpen, closeCart, cartItems, updateQuantity, removeItem } = useCartStore();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  const subTotal = cartItems?.reduce((total: number, item: any) => {
    return total + (Number(item.product?.unit_price || 0) * item.quantity);
  }, 0) || 0;

  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-500 ${
          isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Side Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-background z-[110] shadow-2xl flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-card-border">
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            Shopping Cart
            <span className="bg-primary-light text-primary text-xs px-2 py-0.5 rounded-full font-bold">
              {cartItems?.length || 0}
            </span>
          </h2>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-card border border-card-border hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar">
          {!cartItems || cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
              <span className="text-6xl mb-4">🛍️</span>
              <p className="text-lg font-bold text-foreground">Your cart is empty</p>
              <p className="text-sm text-muted mt-1">Looks like you haven't added anything yet.</p>
              <button onClick={closeCart} className="mt-6 text-primary text-sm font-bold hover:underline">
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item: any) => (
              <div key={item.id} className="flex gap-4 bg-card p-3 rounded-2xl border border-card-border relative group transition-all hover:border-card-hoverBorder shadow-sm">
                
                {/* Image Placeholder */}
                <div className="w-20 h-20 bg-background rounded-xl flex items-center justify-center text-3xl shrink-0">
                  📦
                </div>

                {/* Item Details */}
                <div className="flex flex-col flex-1 justify-between py-1">
                  <div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-1 leading-tight">
                      {item.product?.title || "Product Name"}
                    </h3>
                    <p className="text-xs text-muted mt-0.5 font-medium">
                      ${Math.round(Number(item.product?.unit_price || 0))}
                    </p>
                  </div>

                  {/* Quantity Controls & Remove */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-background border border-card-border rounded-lg overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1} 
                        className="w-7 h-7 flex items-center justify-center text-foreground hover:bg-card hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-foreground">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-foreground hover:bg-card hover:text-primary transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-muted hover:text-rose-500 p-1.5 transition-colors group/delete"
                      title="Remove Item"
                    >
                      <svg className="w-4 h-4 group-hover/delete:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout Section */}
        {cartItems && cartItems.length > 0 && (
          <div className="p-6 bg-card border-t border-card-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-muted">Subtotal</span>
              <span className="text-xl font-black text-foreground tracking-tight">${Math.round(subTotal)}</span>
            </div>
            <p className="text-[10px] text-muted text-center mb-4">
              Shipping and taxes calculated at checkout.
            </p>
            <Link 
              href="/checkout" 
              onClick={closeCart}
              className="w-full flex items-center justify-center bg-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-primary-hover transition-all active:scale-[0.98]"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );   
}