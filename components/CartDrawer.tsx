"use client";

import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const router = useRouter();
  const { isCartOpen, closeCart, cartItems, updateQuantity, removeItem } = useCartStore();
  const [showLoginModal, setShowLoginModal] = useState(false);

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
    const price = Number(item.product?.unit_price || item.unit_price || 0);
    return total + (price * item.quantity);
  }, 0) || 0;

  const handleCheckoutClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await apiClient.get("/auth/users/me/");
      closeCart();
      router.push("/checkout");
    } catch (error) {
      setShowLoginModal(true);
    }
  };

  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-500 ${
          isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-background z-[110] shadow-2xl flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-card-border">
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            Shopping Cart
            <span className="bg-primary-light text-primary text-xs px-2 py-0.5 rounded-full font-bold">
              {cartItems?.length || 0}
            </span>
          </h2>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-card border border-card-border hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar">
          {!cartItems || cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
              <span className="text-6xl mb-4">🛍️</span>
              <p className="text-lg font-bold text-foreground">Your cart is empty</p>
              <p className="text-sm text-muted mt-1">Looks like you haven't added anything yet.</p>
              <button onClick={closeCart} className="mt-6 text-primary text-sm font-bold hover:underline cursor-pointer">
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item: any) => (
              <div key={item.id} className="flex gap-4 bg-card p-3 rounded-2xl border border-card-border relative group transition-all hover:border-card-hoverBorder shadow-sm">
                <div className="w-20 h-20 bg-background rounded-xl flex items-center justify-center text-3xl shrink-0 border border-card-border">
                  📦
                </div>
                <div className="flex flex-col flex-1 justify-between py-1">
                  <div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-1 leading-tight">
                      {item.product?.title || "Product Name"}
                    </h3>
                    <p className="text-xs text-muted mt-0.5 font-medium">
                      ${Math.round(Number(item.product?.unit_price || 0))}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-background border border-card-border rounded-lg overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1} 
                        className="w-7 h-7 flex items-center justify-center text-foreground hover:bg-card hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-foreground">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-foreground hover:bg-card hover:text-primary transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-muted hover:text-rose-500 p-1.5 transition-colors group/delete cursor-pointer"
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

        {cartItems && cartItems.length > 0 && (
          <div className="p-6 bg-card border-t border-card-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-muted">Subtotal</span>
              <span className="text-xl font-black text-foreground tracking-tight">${Math.round(subTotal)}</span>
            </div>
            <p className="text-[10px] text-muted text-center mb-4">
              Shipping and taxes calculated at checkout.
            </p>
            <button 
              onClick={handleCheckoutClick}
              className="w-full flex items-center justify-center bg-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-primary-hover transition-all active:scale-[0.98] cursor-pointer"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center px-4 animate-fade-in">
          <div className="bg-card border border-card-border p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center text-primary text-2xl mb-4 font-black">
              🔒
            </div>
            <h3 className="text-lg font-black text-foreground mb-2">Authentication Required</h3>
            <p className="text-xs text-muted mb-6 leading-relaxed">
              Please login first to proceed your order.
            </p>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-background border border-card-border text-foreground hover:bg-card-border/20 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  closeCart();
                  router.push("/signin?redirect=/checkout");
                }}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-primary text-white hover:bg-primary-hover transition-all cursor-pointer shadow-md"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}