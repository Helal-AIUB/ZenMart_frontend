"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/services/apiClient";
import { X, Loader2, Save, Calendar, Users } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface EditCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: any | null;
  onSuccess: () => void;
}

export default function EditCouponModal({ isOpen, onClose, coupon, onSuccess }: EditCouponModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    usage_limit: "",
    min_purchase_amount: "0.00",
    valid_to: "",
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        usage_limit: coupon.usage_limit?.toString() || "",
        min_purchase_amount: coupon.min_purchase_amount?.toString() || "0.00",
        valid_to: new Date(coupon.valid_to).toISOString().slice(0, 16),
      });
    }
  }, [coupon]);

  if (!isOpen || !coupon) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        min_purchase_amount: parseFloat(formData.min_purchase_amount || "0"),
        valid_to: new Date(formData.valid_to).toISOString(),
      };

      await apiClient.patch(`/store/coupons/${coupon.id}/`, payload);
      toast.success("Coupon updated successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Failed to update coupon details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden">
          
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-base sm:text-lg font-black text-slate-800">Edit Coupon Limit</h3>
            <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 hover:text-rose-500 transition-colors">
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          <form id="editCouponForm" onSubmit={handleSubmit} className="p-4 sm:p-6 flex flex-col gap-4">
            
            {/* Read Only Info Box */}
            <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Coupon Code</p>
              <p className="text-sm sm:text-base font-black text-slate-800 mb-2">{coupon.code}</p>
              <p className="text-[10px] sm:text-xs font-bold text-emerald-600">
                Discount: {coupon.discount_type === 'percentage' ? `${coupon.discount_amount}% OFF` : `৳${coupon.discount_amount} OFF`}
              </p>
              <p className="text-[10px] text-slate-400 mt-1 italic">* Core details cannot be changed to maintain data integrity.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5"><Users size={12}/> Global Limit</label>
                <input type="number" placeholder="Unlimited" value={formData.usage_limit} onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })} className="px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">Min. Order (৳)</label>
                <input type="number" min="0" value={formData.min_purchase_amount} onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })} className="px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3 mt-1">
              <label className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5"><Calendar size={12}/> Extend Validity Until</label>
              <input type="datetime-local" value={formData.valid_to} onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })} className="px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
            </div>

          </form>

          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex gap-3">
            <button type="button" onClick={onClose} className="w-1/2 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-all cursor-pointer">Cancel</button>
            <button type="submit" form="editCouponForm" disabled={isSubmitting} className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md flex justify-center items-center gap-2 transition-all cursor-pointer disabled:opacity-70">
              {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14}/> Save Changes</>}
            </button>
          </div>

        </motion.div>
      </div>
    </>
  );
}