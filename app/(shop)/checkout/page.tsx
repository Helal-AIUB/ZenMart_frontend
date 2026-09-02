"use client";

import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/apiClient";
import toast from "react-hot-toast";
import { useStoreSettings } from "@/store/useStoreSettings";
import { 
  Banknote, CreditCard, Smartphone, Tag, X, Loader2, 
  ShieldCheck, User, Home, MapPin, Mail, Phone, Lock, ChevronRight, CheckCircle2 
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { currencySymbol } = useStoreSettings();
  
  // 🟢 Extracted Coupon & Cart States
  const { 
    cartItems, cartId, clearCart, 
    appliedCoupon, discountAmount, applyCoupon, removeCoupon 
  } = useCartStore(); 
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // 🟢 Coupon API States
  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Settings & Payment State
  const [settings, setSettings] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", street: "", city: "", zipCode: "", phone: ""
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
        toast.error("Warning: Delivery charges could not be loaded.");
      } finally {
        setIsLoading(false); 
      }
    };
    fetchCheckoutData();
  }, [router]);

  // 🟢 Calculations
  const subTotal = cartItems?.reduce((total: number, item: any) => {
    const price = Number(item.product?.unit_price || item.unit_price || 0);
    return total + (price * item.quantity);
  }, 0) || 0;

  const hasSelectedCity = formData.city !== "";
  const isInsideDhaka = formData.city === "Dhaka";
  const shippingCost = settings && hasSelectedCity
    ? (isInsideDhaka ? Number(settings.delivery_charge_inside) : Number(settings.delivery_charge_outside))
    : 0;
    
  // 🟢 Apply Discount logic
  const grandTotal = Math.max(0, subTotal + shippingCost - discountAmount);
  const totalItemsCount = cartItems?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

  // 🟢 Coupon Validation Handler
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    try {
      const res = await apiClient.post("/store/coupons/validate/", {
        code: couponInput,
        cart_id: cartId
      });
      applyCoupon(res.data.coupon_code, res.data.discount_amount);
      setCouponInput("");
      toast.success(res.data.message || "Coupon applied successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.code || "Invalid or expired coupon.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // 🟢 Submit Order Function
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentCartId = cartId || (typeof window !== 'undefined' ? localStorage.getItem('cart_id') : null);

    if (!currentCartId) return toast.error("Your cart is empty or missing!");
    if (!formData.city) return toast.error("Please select a delivery zone!");

    setIsPlacingOrder(true);
    try {
      const res = await apiClient.post("/store/orders/", {
        cart_id: currentCartId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        street: formData.street,
        city: formData.city,
        zip_code: formData.zipCode,
        phone: formData.phone,
        delivery_charge: shippingCost,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon || "" 
      });

      if (clearCart) clearCart();
      if (typeof window !== 'undefined') localStorage.removeItem('cart_id');
      
      if (paymentMethod === "COD") {
        setIsSubmitted(true); 
      } else {
        router.push(`/checkout/payment/${res.data.id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to place order.");
      setIsPlacingOrder(false);
    } 
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
    </div>
  );

  if (isSubmitted) return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 font-sans px-4 pt-20">
      <div className="bg-white border border-slate-100 p-10 rounded-[2rem] shadow-xl text-center w-full max-w-lg animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-3">Order Placed!</h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          Thank you for your purchase. Your order has been successfully placed and is now being processed by our team.
        </p>
        <button onClick={() => window.location.href = "/products"} className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-md transition-all">
          Continue Shopping
        </button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-slate-50/50 font-sans pt-28 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* 🟢 Premium Header */}
        {/* <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Checkout</h1>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-xs font-bold w-fit">
            <ShieldCheck size={16} /> 100% Secure Checkout
          </div>
        </div> */}

        {/* 🟢 Stepper (Visual) */}
        <div className="hidden md:flex items-center gap-4 mb-10 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm shrink-0">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">1</div>
            Shipping & Payment
          </div>
          <div className="h-px w-16 bg-emerald-200"></div>
          <div className="flex items-center gap-2 text-slate-400 font-bold text-sm shrink-0">
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs">2</div>
            Review & Complete
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* --- LEFT SIDE: FORMS --- */}
          <div className="lg:col-span-7 flex flex-col gap-8 order-2 lg:order-1">
            <form id="checkout-form" onSubmit={handleSubmitOrder} className="flex flex-col gap-8">
              
              {/* 🟢 Shipping Card */}
              <div className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Shipping Information</h2>
                    <p className="text-xs text-slate-500 font-medium">Enter your delivery details</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600">First Name <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><User size={16} /></div>
                      <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Enter first name" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600">Last Name <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><User size={16} /></div>
                      <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Enter last name" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600">Street Address <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Home size={16} /></div>
                      <input required type="text" name="street" value={formData.street} onChange={handleInputChange} placeholder="House no, Street, Area" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600">City / Zone <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><MapPin size={16} /></div>
                      <select required name="city" value={formData.city} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer font-medium">
                        <option value="" disabled>Select your city</option>
                        <option value="Dhaka">Inside Dhaka</option>
                        <option value="Outside Dhaka">Outside Dhaka</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600">Postal Code <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Mail size={16} /></div>
                      <input required type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="Enter postal code" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600">Phone Number <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Phone size={16} /></div>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="01XXXXXXXXX" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 🟢 Payment Method Card */}
              <div className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Payment Method</h2>
                    <p className="text-xs text-slate-500 font-medium">Choose how you want to pay</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button type="button" onClick={() => setPaymentMethod('COD')} className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'}`}>
                    <Banknote size={28} className={paymentMethod === 'COD' ? 'text-emerald-600' : 'text-slate-400'} />
                    <span className="text-xs font-bold">Cash on Delivery</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('bKash')} className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'bKash' ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'}`}>
                    <Smartphone size={28} className={paymentMethod === 'bKash' ? 'text-pink-600' : 'text-slate-400'} />
                    <span className="text-xs font-bold">bKash</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('Nagad')} className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'Nagad' ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'}`}>
                    <CreditCard size={28} className={paymentMethod === 'Nagad' ? 'text-orange-600' : 'text-slate-400'} />
                    <span className="text-xs font-bold">Nagad</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* --- RIGHT SIDE: SUMMARY (Sticky) --- */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm lg:sticky top-28 overflow-hidden flex flex-col">
              
              {/* Premium Green Header */}
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-xl font-black tracking-wide mb-1">Order Summary</h2>
                  <p className="text-emerald-100/80 text-sm font-medium">{totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'}</p>
                </div>
                {/* Abstract shape/icon to match demo vibe */}
                <Tag size={120} className="absolute -bottom-6 -right-6 text-white opacity-10 rotate-12" />
              </div>

              <div className="p-6 sm:p-8 flex flex-col gap-6">
                
                {/* Product List */}
                <div className="flex flex-col gap-4 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                      {/* Image Thumbnail Placeholder (Optional: Add real image if available) */}
                      <div className="w-16 h-16 bg-slate-100 rounded-xl shrink-0 flex items-center justify-center border border-slate-200 overflow-hidden">
                        {item.product?.images?.[0] ? (
                          <img src={item.product.images[0].image} alt={item.product.title} className="w-full h-full object-cover" />
                        ) : (
                          <Tag size={20} className="text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-800 truncate">{item.product?.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-slate-800">{currencySymbol}{Math.round(Number(item.product?.unit_price || 0) * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 🟢 Promo Code Input */}
                <div className="pt-6 border-t border-slate-100">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-4 rounded-2xl transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Coupon Applied</p>
                          <p className="text-sm font-black text-emerald-800">{appliedCoupon}</p>
                        </div>
                      </div>
                      <button onClick={removeCoupon} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors cursor-pointer">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center p-1.5 bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                      <div className="pl-3 text-slate-400"><Tag size={18} /></div>
                      <input 
                        type="text" 
                        placeholder="Enter promo code" 
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 bg-transparent border-none px-3 py-2 text-sm text-slate-800 font-bold uppercase placeholder:normal-case placeholder:font-medium placeholder:text-slate-400 focus:outline-none" 
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        disabled={!couponInput.trim() || isApplyingCoupon}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 disabled:opacity-50 disabled:bg-slate-400 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                      >
                        {isApplyingCoupon ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                      </button>
                    </div>
                  )}
                </div>

                {/* 🟢 Calculations */}
                <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Subtotal</span>
                    <span className="font-bold text-slate-800">{currencySymbol}{Math.round(subTotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Shipping</span>
                    <span className="font-bold text-slate-800">
                      {settings ? (formData.city ? (shippingCost === 0 ? <span className="text-emerald-600">FREE</span> : `+${currencySymbol}${shippingCost}`) : 'Select Zone') : '...'}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-sm text-emerald-600 font-bold animate-in fade-in slide-in-from-right-2">
                      <span>Discount</span>
                      <span>-{currencySymbol}{Math.round(discountAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-2">
                    <span className="text-base font-black text-slate-800">Total Amount</span>
                    <span className="text-2xl font-black text-emerald-600">{currencySymbol}{Math.round(grandTotal)}</span>
                  </div>
                </div>

                {/* Security Note & Main Submit Button */}
                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 py-3 rounded-xl border border-slate-100">
                    <Lock size={14} className="text-emerald-500" /> Secure checkout with SSL encryption
                  </div>
                  
                  {/* The button triggers the form via the `form` attribute */}
                  <button 
                    type="submit" 
                    form="checkout-form"
                    disabled={isPlacingOrder || !formData.city} 
                    className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer group"
                  >
                    <span className="font-bold text-sm">
                      {isPlacingOrder ? "Processing..." : "Continue to Payment"}
                    </span>
                    {isPlacingOrder ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    )}
                  </button>
                  <p className="text-center text-[10px] text-slate-400 font-medium">You won't be charged until the final step.</p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}