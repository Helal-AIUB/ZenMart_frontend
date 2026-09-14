"use client";

import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/apiClient";
import toast from "react-hot-toast";
import { useStoreSettings } from "@/store/useStoreSettings";
import { 
  Banknote, CreditCard, Smartphone, Tag, X, Loader2, 
  MapPin, Mail, Phone, Lock, ChevronRight, CheckCircle2, User, Home 
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { currencySymbol } = useStoreSettings();
  
  const { 
    cartItems, cartId, clearCart, 
    appliedCoupon, discountAmount, applyCoupon, removeCoupon 
  } = useCartStore(); 
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [settings, setSettings] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", street: "", city: "", zipCode: "", phone: ""
  });

  useEffect(() => {
    // SessionStorage used as simple cache to speed up re-visits
    const fetchCheckoutData = async () => {
      try {
        await apiClient.get("/auth/users/me/");
      } catch (error) {
        router.push("/signin?redirect=/checkout");
        return; 
      }
      try {
        const cachedSettings = sessionStorage.getItem("storeSettings");
        if (cachedSettings) {
          setSettings(JSON.parse(cachedSettings));
        } else {
          const settingsRes = await apiClient.get("/store/settings/");
          setSettings(settingsRes.data);
          sessionStorage.setItem("storeSettings", JSON.stringify(settingsRes.data));
        }
      } catch (error) {
        toast.error("Warning: Delivery charges could not be loaded.");
      } finally {
        setIsLoading(false); 
      }
    };
    fetchCheckoutData();
  }, [router]);

  const subTotal = cartItems?.reduce((total: number, item: any) => {
    const price = Number(item.product?.unit_price || item.unit_price || 0);
    return total + (price * item.quantity);
  }, 0) || 0;

  const hasSelectedCity = formData.city !== "";
  const isInsideDhaka = formData.city === "Dhaka";
  const shippingCost = settings && hasSelectedCity
    ? (isInsideDhaka ? Number(settings.delivery_charge_inside) : Number(settings.delivery_charge_outside))
    : 0;
    
  const grandTotal = Math.max(0, subTotal + shippingCost - discountAmount);
  const totalItemsCount = cartItems?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

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
      <div className="bg-white border border-slate-100 p-8 sm:p-10 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl text-center w-full max-w-lg animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 size={40} className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mb-3">Order Placed!</h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          Thank you for your purchase. Your order has been successfully placed and is now being processed by our team.
        </p>
        <button onClick={() => window.location.href = "/products"} className="w-full py-3.5 sm:py-4 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-md transition-all">
          Continue Shopping
        </button>
      </div>
    </main>
  );

  return (
    // 🟢 Fixed navbar overlap issue with dynamic top padding
    <main className="min-h-screen bg-slate-50/50 font-sans pt-40 md:pt-44 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        <div className="hidden md:flex items-center gap-4 mb-8 sm:mb-10 overflow-x-auto pb-2">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* --- LEFT SIDE: FORMS (Mobile First Order) --- */}
          <div className="lg:col-span-7 flex flex-col gap-6 sm:gap-8 order-1 lg:order-1">
            <form id="checkout-form" onSubmit={handleSubmitOrder} className="flex flex-col gap-6 sm:gap-8">
              
              <div className="bg-white border border-slate-200 rounded-3xl sm:rounded-[2rem] p-5 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <MapPin size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-800">Shipping Information</h2>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Enter your delivery details</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600">First Name <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-slate-400"><User size={14} className="sm:w-4 sm:h-4" /></div>
                      <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First name" className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600">Last Name <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-slate-400"><User size={14} className="sm:w-4 sm:h-4" /></div>
                      <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last name" className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:gap-2 md:col-span-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600">Street Address <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-slate-400"><Home size={14} className="sm:w-4 sm:h-4" /></div>
                      <input required type="text" name="street" value={formData.street} onChange={handleInputChange} placeholder="House no, Street, Area" className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600">City / Zone <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-slate-400"><MapPin size={14} className="sm:w-4 sm:h-4" /></div>
                      <select required name="city" value={formData.city} onChange={handleInputChange} className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer font-medium">
                        <option value="" disabled>Select your city</option>
                        <option value="Dhaka">Inside Dhaka</option>
                        <option value="Outside Dhaka">Outside Dhaka</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600">Postal Code <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-slate-400"><Mail size={14} className="sm:w-4 sm:h-4" /></div>
                      <input required type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="Postal code" className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:gap-2 md:col-span-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600">Phone Number <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-slate-400"><Phone size={14} className="sm:w-4 sm:h-4" /></div>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="01XXXXXXXXX" className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl sm:rounded-[2rem] p-5 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <CreditCard size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-800">Payment Method</h2>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Choose how you want to pay</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <button type="button" onClick={() => setPaymentMethod('COD')} className={`flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer col-span-2 sm:col-span-1 ${paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'}`}>
                    <Banknote size={24} className={`sm:w-7 sm:h-7 ${paymentMethod === 'COD' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-[11px] sm:text-xs font-bold">Cash on Delivery</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('bKash')} className={`flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'bKash' ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'}`}>
                    <Smartphone size={24} className={`sm:w-7 sm:h-7 ${paymentMethod === 'bKash' ? 'text-pink-600' : 'text-slate-400'}`} />
                    <span className="text-[11px] sm:text-xs font-bold">bKash</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('Nagad')} className={`flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'Nagad' ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'}`}>
                    <CreditCard size={24} className={`sm:w-7 sm:h-7 ${paymentMethod === 'Nagad' ? 'text-orange-600' : 'text-slate-400'}`} />
                    <span className="text-[11px] sm:text-xs font-bold">Nagad</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* --- RIGHT SIDE: SUMMARY (Mobile Second Order, Sticky Desktop) --- */}
          <div className="lg:col-span-5 order-2 lg:order-2">
            <div className="bg-white border border-slate-200 rounded-3xl sm:rounded-[2rem] shadow-sm lg:sticky top-28 overflow-hidden flex flex-col">
              
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 sm:p-6 md:p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-lg sm:text-xl font-black tracking-wide mb-0.5 sm:mb-1">Order Summary</h2>
                  <p className="text-emerald-100/80 text-xs sm:text-sm font-medium">{totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'}</p>
                </div>
                <Tag size={100} className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 text-white opacity-10 rotate-12 sm:w-[120px] sm:h-[120px]" />
              </div>

              <div className="p-5 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-6">
                
                <div className="flex flex-col gap-3 sm:gap-4 max-h-[30vh] sm:max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 sm:gap-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-lg sm:rounded-xl shrink-0 flex items-center justify-center border border-slate-200 overflow-hidden">
                        {item.product?.images?.[0] ? (
                          <img src={item.product.images[0].image} alt={item.product.title} className="w-full h-full object-cover" />
                        ) : (
                          <Tag size={18} className="text-slate-300 sm:w-5 sm:h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 truncate">{item.product?.title}</h3>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-black text-slate-800">{currencySymbol}{Math.round(Number(item.product?.unit_price || 0) * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-5 sm:pt-6 border-t border-slate-100">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-sm text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={16} className="sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <p className="text-[9px] sm:text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Coupon Applied</p>
                          <p className="text-xs sm:text-sm font-black text-emerald-800">{appliedCoupon}</p>
                        </div>
                      </div>
                      <button onClick={removeCoupon} className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors cursor-pointer">
                        <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center p-1 sm:p-1.5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                      <div className="pl-2.5 sm:pl-3 text-slate-400"><Tag size={16} className="sm:w-[18px] sm:h-[18px]" /></div>
                      <input 
                        type="text" 
                        placeholder="Promo code" 
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 bg-transparent border-none px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-800 font-bold uppercase placeholder:normal-case placeholder:font-medium placeholder:text-slate-400 focus:outline-none min-w-0" 
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        disabled={!couponInput.trim() || isApplyingCoupon}
                        className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-emerald-600 text-white font-bold text-[10px] sm:text-xs hover:bg-emerald-700 disabled:opacity-50 disabled:bg-slate-400 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                      >
                        {isApplyingCoupon ? <Loader2 size={14} className="animate-spin sm:w-4 sm:h-4" /> : "Apply"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2.5 sm:gap-3 pt-5 sm:pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-slate-500 font-medium">Subtotal</span>
                    <span className="font-bold text-slate-800">{currencySymbol}{Math.round(subTotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-slate-500 font-medium">Shipping</span>
                    <span className="font-bold text-slate-800">
                      {settings ? (formData.city ? (shippingCost === 0 ? <span className="text-emerald-600">FREE</span> : `+${currencySymbol}${shippingCost}`) : 'Select Zone') : '...'}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-xs sm:text-sm text-emerald-600 font-bold animate-in fade-in slide-in-from-right-2">
                      <span>Discount</span>
                      <span>-{currencySymbol}{Math.round(discountAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-slate-100 mt-1 sm:mt-2">
                    <span className="text-sm sm:text-base font-black text-slate-800">Total Amount</span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-600">{currencySymbol}{Math.round(grandTotal)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:gap-4 mt-2 sm:mt-4">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-slate-500 bg-slate-50 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-100">
                    <Lock size={12} className="text-emerald-500 sm:w-3.5 sm:h-3.5" /> Secure checkout with SSL encryption
                  </div>
                  
                  <button 
                    type="submit" 
                    form="checkout-form"
                    disabled={isPlacingOrder || !formData.city} 
                    className="w-full flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer group"
                  >
                    <span className="font-bold text-xs sm:text-sm">
                      {isPlacingOrder ? "Processing..." : "Continue to Payment"}
                    </span>
                    {isPlacingOrder ? (
                      <Loader2 size={16} className="animate-spin sm:w-[18px] sm:h-[18px]" />
                    ) : (
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform sm:w-5 sm:h-5" />
                    )}
                  </button>
                  <p className="text-center text-[9px] sm:text-[10px] text-slate-400 font-medium">You won't be charged until the final step.</p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}