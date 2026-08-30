"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/apiClient";
import toast from "react-hot-toast";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";

export default function PaymentGatewayPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const isBkash = order.payment_method === 'bKash';
  // 🟢 Fixed: Nagad's Khoyeri/Dark Red color applied (#c3161c)
  const themeColor = isBkash ? "bg-[#e2136e]" : "bg-[#c3161c]"; 
  const lightColor = isBkash ? "bg-[#e2136e]/5" : "bg-[#c3161c]/5";
  const textColor = isBkash ? "text-[#e2136e]" : "text-[#c3161c]";
  const totalAmount = order.items.reduce((sum: number, i: any) => sum + (Number(i.unit_price) * i.quantity), 0) + Number(order.delivery_charge || 0);

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="bg-card p-10 rounded-[2rem] shadow-xl text-center max-w-md w-full animate-in zoom-in duration-200">
          <CheckCircle size={64} className="mx-auto text-emerald-500 mb-4" />
          <h2 className="text-2xl font-black text-foreground mb-2">Verification Sent!</h2>
          <p className="text-sm text-muted mb-8">We have received your TrxID ({trxId}). Your order will be processed once the payment is confirmed.</p>
          <button onClick={() => router.push("/products")} className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all">
            Explore Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-background p-4 pt-32 pb-16 font-sans">
      <div className="bg-card border border-card-border shadow-xl rounded-[2.5rem] w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        <div className={`${themeColor} p-8 text-white text-center`}>
          <h1 className="text-2xl font-black uppercase tracking-widest">{order.payment_method} Payment</h1>
          <p className="text-sm font-medium mt-1 opacity-90">Secure Manual Checkout</p>
        </div>

        <div className="p-8 flex flex-col gap-6">
          <div className="text-center">
            <p className="text-xs font-bold text-muted uppercase tracking-wider">Total Amount to Pay</p>
            <h2 className={`text-4xl font-black ${textColor} mt-1`}>${Math.round(totalAmount)}</h2>
          </div>

          <div className={`${lightColor} border border-card-border p-5 rounded-2xl space-y-3`}>
            <p className="text-xs font-bold text-foreground">Payment Instructions:</p>
            <ol className="text-xs text-muted space-y-2 list-decimal list-inside">
              <li>Open your {order.payment_method} App</li>
              <li>Select <strong className="text-foreground">Send Money</strong></li>
              {/* 🟢 Fixed: Dynamically showing bKash or Nagad Number */}
              <li>Enter our {order.payment_method} Number: <strong className="text-foreground">01825-358009</strong> (Personal)</li>
              <li>Enter the exact amount: <strong className="text-foreground">${Math.round(totalAmount)}</strong></li>
              <li>Use Reference: <strong className="text-foreground">Order #{order.id}</strong></li>
            </ol>
          </div>

          <form onSubmit={handleVerify} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted">Transaction ID (TrxID)</label>
              <input 
                required 
                type="text" 
                value={trxId} 
                onChange={(e) => setTrxId(e.target.value.toUpperCase())} 
                placeholder={`e.g. ${isBkash ? '8A7B6C5D4E' : '71B8X9C'}`} 
                className="px-5 py-4 rounded-xl bg-background border border-card-border font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase tracking-wider" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting || !trxId} 
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl ${themeColor} text-white font-black text-xs hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all shadow-md cursor-pointer tracking-wide mt-2`}
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Verifying...</>
              ) : (
                <>Verify Payment <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}