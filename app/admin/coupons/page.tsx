"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/services/apiClient";
import toast from "react-hot-toast";
import { 
  TicketPercent, Plus, Trash2, Calendar, 
  Tag, Percent, DollarSign, CheckCircle2, XCircle, X, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Coupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_amount: string;
  min_purchase_amount: string;
  is_global: boolean;
  active: boolean;
  valid_from: string;
  valid_to: string;
  usage_limit: number | null;
  used_count: number;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_amount: "",
    min_purchase_amount: "0.00",
    is_global: true,
    applicable_collections: [] as number[],
    applicable_products: [] as number[],
    valid_from: new Date().toISOString().slice(0, 16),
    valid_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    usage_limit: "",
    active: true,
  });

  const fetchCoupons = async () => {
    try {
      const res = await apiClient.get("/store/coupons/");
      setCoupons(res.data.results || res.data);
    } catch (error) {
      toast.error("Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [colRes, prodRes] = await Promise.all([
        apiClient.get("/store/collections/"),
        apiClient.get("/store/products/")
      ]);
      setCollections(colRes.data.results || colRes.data);
      setProducts(prodRes.data.results || prodRes.data);
    } catch (error) {
      console.error("Failed to load scopes", error);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchMetadata();
  }, []);

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/store/coupons/${id}/`, { active: !currentStatus });
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: !currentStatus } : c))
      );
      toast.success("Coupon status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await apiClient.delete(`/store/coupons/${id}/`);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Coupon deleted successfully");
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      discount_amount: parseFloat(formData.discount_amount),
      min_purchase_amount: parseFloat(formData.min_purchase_amount || "0"),
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      valid_from: new Date(formData.valid_from).toISOString(),
      valid_to: new Date(formData.valid_to).toISOString(),
    };

    try {
      const res = await apiClient.post("/store/coupons/", payload);
      setCoupons([res.data, ...coupons]);
      toast.success("Coupon created successfully!");
      setIsModalOpen(false);
      setFormData({
        code: "",
        discount_type: "percentage",
        discount_amount: "",
        min_purchase_amount: "0.00",
        is_global: true,
        applicable_collections: [],
        applicable_products: [],
        valid_from: new Date().toISOString().slice(0, 16),
        valid_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        usage_limit: "",
        active: true,
      });
    } catch (error: any) {
      const err = error.response?.data;
      toast.error(err?.code?.[0] || "Failed to create coupon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto min-h-screen">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-2.5">
            Coupons & Discounts
            <TicketPercent className="text-emerald-500" size={28} />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create codes, manage promotional campaigns, and set custom scope limits.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/10 transition-all cursor-pointer w-full sm:w-auto"
        >
          <Plus size={18} />
          Create Coupon
        </button>
      </div>

      {/* Main Container */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <TicketPercent size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No coupons available</h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-6 max-w-sm">
            Launch promotional marketing campaigns by creating discount codes for your customers.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700 transition-all cursor-pointer"
          >
            Create Your First Coupon
          </button>
        </div>
      ) : (
        <>
          {/* 🟢 Desktop & Tablet View: Full Table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Coupon Code</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6">Scope</th>
                  <th className="py-4 px-6">Usage</th>
                  <th className="py-4 px-6">Validity</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-emerald-500" />
                        <span className="font-bold text-slate-800 tracking-wide">{c.code}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {c.discount_type === 'percentage' ? `${c.discount_amount}% OFF` : `৳${c.discount_amount} OFF`}
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                        Min: ৳{c.min_purchase_amount}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${c.is_global ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {c.is_global ? 'All Products' : 'Specific Target'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {c.used_count} / {c.usage_limit ? c.usage_limit : '∞'}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      <span className="block">{new Date(c.valid_from).toLocaleDateString()}</span>
                      <span className="text-[11px] text-slate-400 font-medium">to {new Date(c.valid_to).toLocaleDateString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => handleToggleActive(c.id, c.active)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${c.active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                      >
                        {c.active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {c.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete coupon"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🟢 Mobile View: Responsive Cards (for iPhone, Samsung) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {coupons.map((c) => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Tag size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm tracking-wide">{c.code}</p>
                      <p className="text-[11px] text-slate-400">{c.is_global ? 'Global Scope' : 'Targeted Scope'}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleToggleActive(c.id, c.active)}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${c.active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                  >
                    {c.active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-1">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Discount</span>
                    <span className="font-bold text-slate-800">
                      {c.discount_type === 'percentage' ? `${c.discount_amount}% OFF` : `৳${c.discount_amount} OFF`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Redemptions</span>
                    <span className="font-bold text-slate-800">{c.used_count} / {c.usage_limit || '∞'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={13} className="text-slate-400" />
                    <span>Expires: {new Date(c.valid_to).toLocaleDateString()}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 🟢 Slide-Over / Modal for Creating Coupon */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm"
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden my-auto"
              >
                <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Add New Coupon</h3>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
                  
                  {/* Code */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Coupon Code *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. SUMMER20, PETORA50"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold tracking-wider uppercase focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Type and Amount */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Discount Type</label>
                      <select 
                        value={formData.discount_type}
                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                        className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (৳)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Discount Value *</label>
                      <input 
                        required 
                        type="number" 
                        min="1"
                        placeholder="20"
                        value={formData.discount_amount}
                        onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Minimum Amount & Limit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Min. Order Value (৳)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={formData.min_purchase_amount}
                        onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Global Limit</label>
                      <input 
                        type="number" 
                        placeholder="Unlimited"
                        value={formData.usage_limit}
                        onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Scope Selector */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-700">Coupon Application Scope</label>
                    <div className="flex gap-4 text-xs font-medium text-slate-600">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          checked={formData.is_global} 
                          onChange={() => setFormData({ ...formData, is_global: true })}
                        />
                        All Products
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          checked={!formData.is_global} 
                          onChange={() => setFormData({ ...formData, is_global: false })}
                        />
                        Specific Collections / Items
                      </label>
                    </div>

                    {!formData.is_global && (
                      <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 block mb-1">Applicable Collections</label>
                          <select 
                            multiple
                            value={formData.applicable_collections.map(String)}
                            onChange={(e) => {
                              const selected = Array.from(e.target.selectedOptions, opt => Number(opt.value));
                              setFormData({ ...formData, applicable_collections: selected });
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                          >
                            {collections.map((col) => (
                              <option key={col.id} value={col.id}>{col.title}</option>
                            ))}
                          </select>
                          <span className="text-[10px] text-slate-400">Ctrl + Click to select multiple</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Validity Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Valid From</label>
                      <input 
                        type="datetime-local" 
                        value={formData.valid_from}
                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Valid Until</label>
                      <input 
                        type="datetime-local" 
                        value={formData.valid_to}
                        onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Save Coupon"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}