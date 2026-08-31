"use client";

import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/apiClient";
import toast from "react-hot-toast";
import { useStoreSettings } from "@/store/useStoreSettings";
import { Banknote, CreditCard, Smartphone } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { currencySymbol } = useStoreSettings();
  const { cartItems, cartId, clearCart } = useCartStore(); 
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // 🟢 Settings & Payment State
  const [settings, setSettings] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("COD"); // Default: Cash on Delivery

  // Form State for Shipping Address
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "", 
    zipCode: "",
    phone: ""
  });

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        await apiClient.get("/auth/users/me/");
      } catch (error) {
        router.push("/signin?redirect=/checkout");
        return; 
      }

      try {
        const settingsRes = await apiClient.get("/store/settings/");
        setSettings(settingsRes.data);
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Warning: Delivery charges could not be loaded.");
      } finally {
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
  
  const shippingCost = settings && hasSelectedCity
    ? (isInsideDhaka ? Number(settings.delivery_charge_inside) : Number(settings.delivery_charge_outside))
    : 0;
    
  const grandTotal = subTotal + shippingCost;

  // 🟢 Submit Function
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
      // 🟢 Payload-এ Payment Method যুক্ত করা হলো
      const res = await apiClient.post("/store/orders/", {
        cart_id: currentCartId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        street: formData.street,
        city: formData.city,
        zip_code: formData.zipCode,
        phone: formData.phone,
        delivery_charge: shippingCost,
        payment_method: paymentMethod 
      });

      if (clearCart) clearCart();
      if (typeof window !== 'undefined') localStorage.removeItem('cart_id');
      
      // 🟢 Redirect Logic Based on Payment Method
      if (paymentMethod === "COD") {
        setIsSubmitted(true); 
      } else {
        router.push(`/checkout/payment/${res.data.id}`); // redirect to bKash/Nagad page
      }

    } catch (error: any) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.detail || "Failed to place order. Please check all fields.");
      setIsPlacingOrder(false); // Only reset if failed
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
            Thank you for your purchase. Your order has been successfully placed and is being processed.
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
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 flex flex-col gap-6">
          
          {/* 🟢 Shipping Information Card */}
          <div className="bg-card border border-card-border rounded-[2.5rem] p-8 shadow-sm flex flex-col gap-6">
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
          </div>

          {/* 🟢 Premium Payment Method Section */}
          <div className="bg-card border border-card-border rounded-[2.5rem] p-8 shadow-sm flex flex-col gap-4">
            <h2 className="text-base font-black text-foreground uppercase tracking-wider pb-3 border-b border-card-border">
              Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              
              <button 
                type="button" 
                onClick={() => setPaymentMethod('COD')} 
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  paymentMethod === 'COD' 
                  ? 'border-primary bg-primary/5 text-primary shadow-sm scale-[1.02]' 
                  : 'border-card-border bg-background text-muted hover:border-primary/40'
                }`}
              >
                <Banknote size={26} className="mb-2" />
                <span className="text-xs font-bold">Cash on Delivery</span>
              </button>

              <button 
                type="button" 
                onClick={() => setPaymentMethod('bKash')} 
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  paymentMethod === 'bKash' 
                  ? 'border-primary bg-primary/5 text-primary shadow-sm scale-[1.02]' 
                  : 'border-card-border bg-background text-muted hover:border-primary/40'
                }`}
              >
                <Smartphone size={26} className="mb-2" />
                <span className="text-xs font-bold">bKash (Manual)</span>
              </button>

              <button 
                type="button" 
                onClick={() => setPaymentMethod('Nagad')} 
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  paymentMethod === 'Nagad' 
                  ? 'border-primary bg-primary/5 text-primary shadow-sm scale-[1.02]' 
                  : 'border-card-border bg-background text-muted hover:border-primary/40'
                }`}
              >
                <CreditCard size={26} className="mb-2" />
                <span className="text-xs font-bold">Nagad (Manual)</span>
              </button>

            </div>
          </div>

          <button
            type="submit"
            disabled={isPlacingOrder || !formData.city}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-black text-xs hover:bg-primary-hover disabled:bg-primary/70 transition-all shadow-md cursor-pointer tracking-wide"
          >
            {isPlacingOrder ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing...</>
            ) : (
              `Place Order (${currencySymbol}${Math.round(grandTotal)})` 
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
                    {currencySymbol}{Math.round(Number(item.product?.unit_price || 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-card-border text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="font-bold text-foreground">{currencySymbol}{Math.round(subTotal)}</span>
              </div>
              
              <div className="flex justify-between text-muted transition-all duration-300">
                <span>Shipping</span>
                <span className="font-bold text-primary">
                  {settings ? (formData.city ? `+${currencySymbol}${shippingCost}` : 'Select Zone') : 'Calculating...'}
                </span>
              </div>
              
              <div className="flex justify-between text-sm font-black text-foreground pt-3 border-t border-card-border mt-2 transition-all duration-300">
                <span>Total Amount</span>
                <span className="text-primary">{currencySymbol}{Math.round(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}