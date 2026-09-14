"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/apiClient";
import toast from "react-hot-toast";
import { useStoreSettings } from "@/store/useStoreSettings";
import { CheckCircle, ArrowRight, Loader2, Tag } from "lucide-react";

export default function PaymentGatewayPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const { currencySymbol } = useStoreSettings();
  const [order, setOrder] = useState<any>(null);
  const [trxId, setTrxId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await apiClient.get(`/store/orders/${orderId}/`);
        
        if (res.data.transaction_id || res.data.payment_method === 'COD') {
          router.replace("/products");
          return;
        }
        setOrder(res.data);
      } catch (error) {
        toast.error("Order not found");
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (orderId) fetchOrder();
  }, [orderId, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trxId.length < 8) return toast.error("Please enter a valid Transaction ID");
    
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/store/orders/${orderId}/verify_payment/`, { transaction_id: trxId });
      setIsSuccess(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Verification failed");
      setIsSubmitting(false); 
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const isBkash = order.payment_method === 'bKash';
  const themeColor = isBkash ? "bg-[#e2136e]" : "bg-[#c3161c]"; 
  const lightColor = isBkash ? "bg-[#e2136e]/5" : "bg-[#c3161c]/5";
  const textColor = isBkash ? "text-[#e2136e]" : "text-[#c3161c]";
  
  const itemsTotal = order.items.reduce((sum: number, i: any) => sum + (Number(i.unit_price) * i.quantity), 0);
  const deliveryCharge = Number(order.delivery_charge || 0);
  const discountAmount = Number(order.discount_amount || 0);
  const totalAmount = Math.max(0, itemsTotal + deliveryCharge - discountAmount);

  if (isSuccess) {
    return (
      // 🟢 min-h-[80vh] to perfectly center without pushing footer away
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background p-4 pt-24 pb-12">
        <div className="bg-card p-8 sm:p-10 rounded-3xl sm:rounded-[2rem] shadow-xl text-center max-w-md w-full animate-in zoom-in duration-200 border border-card-border">
          <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-emerald-500 mb-4" />
          <h2 className="text-xl sm:text-2xl font-black text-foreground mb-2">Verification Sent!</h2>
          <p className="text-xs sm:text-sm text-muted mb-6 sm:mb-8">We have received your TrxID ({trxId}). Your order will be processed once the payment is confirmed.</p>
          <button onClick={() => router.push("/products")} className="w-full py-3 sm:py-3.5 bg-primary text-white rounded-xl font-bold text-[11px] sm:text-xs shadow-md active:scale-95 transition-all">
            Explore Products
          </button>
        </div>
      </div>
    );
  }

  return (
    // 🟢 Fixed height and alignment issues (items-center, min-h-[80vh])
    <div className="flex items-center justify-center bg-background px-4 pt-28 pb-12 md:pt-36 md:pb-20 min-h-[80vh] font-sans">
      <div className="bg-card border border-card-border shadow-xl rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-[22rem] sm:max-w-lg overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Header - scaled for mobile */}
        <div className={`${themeColor} p-6 sm:p-8 text-white text-center`}>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-widest">{order.payment_method} Payment</h1>
          <p className="text-[10px] sm:text-sm font-medium mt-0.5 sm:mt-1 opacity-90">Secure Manual Checkout</p>
        </div>

        {/* Body - reduced padding and gap for mobile */}
        <div className="p-5 sm:p-8 flex flex-col gap-5 sm:gap-6">
          <div className="text-center">
            <p className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-wider">Total Amount to Pay</p>
            <h2 className={`text-3xl sm:text-4xl font-black ${textColor} mt-1`}>
              {currencySymbol}{Math.round(totalAmount)}
            </h2>
            
            {discountAmount > 0 && (
              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 sm:px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600">
                <Tag size={12} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider">
                  Discount Applied: -{currencySymbol}{Math.round(discountAmount)}
                </span>
              </div>
            )}
          </div>

          <div className={`${lightColor} border border-card-border p-4 sm:p-5 rounded-xl sm:rounded-2xl space-y-2 sm:space-y-3`}>
            <p className="text-[11px] sm:text-xs font-bold text-foreground">Payment Instructions:</p>
            <ol className="text-[10px] sm:text-xs text-muted space-y-1.5 sm:space-y-2 list-decimal list-inside">
              <li>Open your {order.payment_method} App</li>
              <li>Select <strong className="text-foreground">Send Money</strong></li>
              <li>Enter our {order.payment_method} Number: <strong className="text-foreground">01825-358009</strong> (Personal)</li>
              <li>Enter the exact amount: <strong className="text-foreground">{currencySymbol}{Math.round(totalAmount)}</strong></li>
              <li>Use Reference: <strong className="text-foreground">Order #{order.id}</strong></li>
            </ol>
          </div>

          <form onSubmit={handleVerify} className="flex flex-col gap-3 sm:gap-4 mt-1 sm:mt-2">
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <label className="text-[10px] sm:text-xs font-bold text-muted">Transaction ID (TrxID)</label>
              <input 
                required 
                type="text" 
                value={trxId} 
                onChange={(e) => setTrxId(e.target.value.toUpperCase())} 
                placeholder={`e.g. ${isBkash ? '8A7B6C5D4E' : '71B8X9C'}`} 
                className="px-4 py-3 sm:px-5 sm:py-4 rounded-lg sm:rounded-xl bg-background border border-card-border font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase tracking-wider" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting || !trxId} 
              className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 py-3.5 sm:py-4 rounded-lg sm:rounded-xl ${themeColor} text-white font-black text-[11px] sm:text-xs hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all shadow-md cursor-pointer tracking-wide mt-1 sm:mt-2`}
            >
              {isSubmitting ? (
                <><Loader2 size={14} className="animate-spin sm:w-4 sm:h-4" /> Verifying...</>
              ) : (
                <>Verify Payment <ArrowRight size={14} className="sm:w-4 sm:h-4" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}