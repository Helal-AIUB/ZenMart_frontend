"use client";

import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/apiClient";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartId, clearCart } = useCartStore(); 
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // 🟢 Settings State for Dynamic Shipping Cost
  const [settings, setSettings] = useState<any>(null);

  // Form State for Shipping Address
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "", // Will be selected from Dropdown
    zipCode: "",
    phone: ""
  });

  useEffect(() => {
    const fetchCheckoutData = async () => {
      // ১. 🟢 ইউজার অথেন্টিকেশন চেক (আলাদা try-catch)
      try {
        await apiClient.get("/auth/users/me/");
      } catch (error) {
        // লগ-ইন করা না থাকলে রিডাইরেক্ট করবে এবং ফাংশন থামিয়ে দেবে
        router.push("/signin?redirect=/checkout");
        return; 
      }

      // ২. 🟢 ডায়নামিক সেটিংস ফেচ করা (আলাদা try-catch)
      try {
        const settingsRes = await apiClient.get("/store/settings/");
        setSettings(settingsRes.data);
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Warning: Delivery charges could not be loaded.");
      } finally {
        // সেটিংস ফেচ হোক বা না হোক, লোডিং বন্ধ করে পেজ দেখাবে
        setIsLoading(false); 
      }
    };
    
    fetchCheckoutData();
  }, [router]);

  // 🟢 Real-time Calculations
  const subTotal = cartItems?.reduce((total: number, item: any) => {
    const price = Number(item.product?.unit_price || item.unit_price || 0);
    return total + (price * item.quantity);
  }, 0) || 0;

  const hasSelectedCity = formData.city !== "";
  const isInsideDhaka = formData.city === "Dhaka";
  
  // ক্যালকুলেট শিপিং চার্জ
  const shippingCost = settings && hasSelectedCity
    ? (isInsideDhaka ? Number(settings.delivery_charge_inside) : Number(settings.delivery_charge_outside))
    : 0;
    
  const grandTotal = subTotal + shippingCost;

  // Submit Function with Address Data
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentCartId = cartId || (typeof window !== 'undefined' ? localStorage.getItem('cart_id') : null);

    if (!currentCartId) {
      toast.error("Your cart is empty or missing!");
      return;
    }

    if (!formData.city) {
      toast.error("Please select a delivery zone!");
      return;
    }

    setIsPlacingOrder(true);
    try {
      // 🟢 Sending dynamic address and shipping cost to backend
      await apiClient.post("/store/orders/", {
        cart_id: currentCartId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        street: formData.street,
        city: formData.city,
        zip_code: formData.zipCode,
        phone: formData.phone,
        delivery_charge: shippingCost // 🟢 Added delivery charge to order
      });

      if (clearCart) clearCart();
      if (typeof window !== 'undefined') localStorage.removeItem('cart_id');
      
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.detail || "Failed to place order. Please check all fields.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        <div className="bg-card border border-card-border p-10 rounded-[2.5rem] shadow-xl text-center w-full animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-md">
            ✓
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2">Order Placed Successfully!</h1>
          <p className="text-xs text-muted mb-8">
            Thank you for shopping with Petora BD. Your order has been successfully placed and is being processed.
          </p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.location.href = "/products";
            }}
            className="inline-block px-8 py-3.5 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primary-hover transition-all shadow-md cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-28 min-h-screen font-sans">
      <div className="h-6"></div>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground tracking-tight">Checkout</h1>
        <p className="text-xs text-muted mt-1">Complete your shipping and payment details to place your order.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 bg-card border border-card-border rounded-[2.5rem] p-8 shadow-sm flex flex-col gap-6">
          <h2 className="text-base font-black text-foreground uppercase tracking-wider pb-3 border-b border-card-border">
            Shipping Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted">First Name</label>
              <input required type="text" name="firstName" placeholder="Rabbi" value={formData.firstName} onChange={handleInputChange} className="px-4 py-3 rounded-xl bg-background border border-card-border text-xs text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted">Last Name</label>
              <input required type="text" name="lastName" placeholder="Islam" value={formData.lastName} onChange={handleInputChange} className="px-4 py-3 rounded-xl bg-background border border-card-border text-xs text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted">Street Address</label>
            <input required type="text" name="street" placeholder="House-12, Road-5, Sector-11" value={formData.street} onChange={handleInputChange} className="px-4 py-3 rounded-xl bg-background border border-card-border text-xs text-foreground focus:outline-none focus:border-primary transition-all" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 🟢 City / Zone Select Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted">City / Zone</label>
              <select 
                required 
                name="city" 
                value={formData.city} 
                onChange={handleInputChange} 
                className="px-4 py-3 rounded-xl bg-background border border-card-border text-xs text-foreground focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Select Delivery Zone</option>
                <option value="Dhaka">Inside Dhaka</option>
                <option value="Outside Dhaka">Outside Dhaka</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted">Postal Code</label>
              <input required type="text" name="zipCode" placeholder="1230" value={formData.zipCode} onChange={handleInputChange} className="px-4 py-3 rounded-xl bg-background border border-card-border text-xs text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted">Phone Number</label>
              <input required type="tel" name="phone" placeholder="+880 17xx-xxxxxx" value={formData.phone} onChange={handleInputChange} className="px-4 py-3 rounded-xl bg-background border border-card-border text-xs text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPlacingOrder || !formData.city}
            className="mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-black text-xs hover:bg-primary-hover disabled:bg-primary/70 transition-all shadow-md cursor-pointer tracking-wide"
          >
            {isPlacingOrder ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Placing Order...</>
            ) : (
              /* 🟢 Updated Button text with Grand Total */
              `Place Order ($${Math.round(grandTotal)})` 
            )}
          </button>
        </form>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-card border border-card-border rounded-[2.5rem] p-8 shadow-sm sticky top-32">
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
              
              {/* 🟢 Dynamic Shipping Cost UI */}
              <div className="flex justify-between text-muted transition-all duration-300">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600">
                  {settings ? (formData.city ? `+$${shippingCost}` : 'Select Zone') : 'Calculating...'}
                </span>
              </div>
              
              {/* 🟢 Dynamic Grand Total */}
              <div className="flex justify-between text-sm font-black text-foreground pt-3 border-t border-card-border mt-2 transition-all duration-300">
                <span>Total Amount</span>
                <span className="text-primary">${Math.round(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}