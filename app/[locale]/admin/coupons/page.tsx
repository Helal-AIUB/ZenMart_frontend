"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import toast from "react-hot-toast";
import { 
  TicketPercent, Plus, Trash2, Calendar, Edit, Search,
  Tag, CheckCircle2, XCircle, X, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EditCouponModal from "@/components/admin/EditCouponModal";

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
  const queryClient = useQueryClient();

  const { data: coupons = [], isLoading: isLoadingCoupons } = useQuery<Coupon[]>({
    queryKey: ["admin_coupons"],
    queryFn: async () => {
      const res = await apiClient.get("/store/coupons/");
      return res.data.results || res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: metadata, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ["admin_coupon_metadata"],
    queryFn: async () => {
      const colRes = await apiClient.get("/store/collections/");
      return { collections: colRes.data.results || colRes.data };
    },
    staleTime: 10 * 60 * 1000,
  });

  const collections = metadata?.collections || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Product Search State ---
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);

  const [formData, setFormData] = useState({
    code: "", discount_type: "percentage", discount_amount: "", min_purchase_amount: "0.00",
    is_global: true, applicable_collections: [] as number[],
    valid_from: new Date().toISOString().slice(0, 16),
    valid_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    usage_limit: "", active: true,
  });

  // Debounced Product Search
  useEffect(() => {
    if (!productSearch.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearchingProducts(true);
      try {
        const res = await apiClient.get(`/store/products/?search=${productSearch}`);
        setSearchResults(res.data.results || res.data);
      } catch (e) {} finally { setIsSearchingProducts(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const handleAddProduct = (prod: any) => {
    if (selectedProducts.length >= 5) return toast.error("Maximum 5 products allowed.");
    if (selectedProducts.some(p => p.id === prod.id)) return toast.error("Product already added.");
    setSelectedProducts([...selectedProducts, prod]);
    setProductSearch("");
    setSearchResults([]);
  };

  const removeProduct = (id: number) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== id));
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    queryClient.setQueryData(["admin_coupons"], (old: Coupon[]) => old.map((c) => (c.id === id ? { ...c, active: !currentStatus } : c)));
    try {
      await apiClient.patch(`/store/coupons/${id}/`, { active: !currentStatus });
      toast.success("Coupon status updated");
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ["admin_coupons"] }); 
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    queryClient.setQueryData(["admin_coupons"], (old: Coupon[]) => old.filter((c) => c.id !== id));
    try {
      await apiClient.delete(`/store/coupons/${id}/`);
      toast.success("Coupon deleted successfully");
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ["admin_coupons"] });
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
      applicable_products: selectedProducts.map(p => p.id), // Add selected products
    };

    try {
      await apiClient.post("/store/coupons/", payload);
      toast.success("Coupon created successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin_coupons"] }); 
      setIsModalOpen(false);
      setFormData({
        code: "", discount_type: "percentage", discount_amount: "", min_purchase_amount: "0.00",
        is_global: true, applicable_collections: [],
        valid_from: new Date().toISOString().slice(0, 16),
        valid_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        usage_limit: "", active: true,
      });
      setSelectedProducts([]); // Reset products
    } catch (error: any) {
      const err = error.response?.data;
      toast.error(err?.code?.[0] || "Failed to create coupon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-10 font-sans mt-4 sm:mt-6 max-w-[1600px] mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-2">
            Coupons & Discounts
            <TicketPercent className="text-emerald-500 w-6 h-6 sm:w-8 sm:h-8" />
          </h1>
          <p className="text-[11px] sm:text-sm text-slate-500 mt-1 font-medium">Create codes, manage promotional campaigns, and set custom scope limits.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/10 transition-all cursor-pointer w-full sm:w-auto shrink-0">
          <Plus size={18} className="sm:w-5 sm:h-5" /> Create Coupon
        </button>
      </div>

      {/* Main Container */}
      {isLoadingCoupons ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Coupon Code</th><th className="py-4 px-6">Discount</th><th className="py-4 px-6">Scope</th><th className="py-4 px-6">Usage</th><th className="py-4 px-6">Validity</th><th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-6"><div className="h-5 bg-slate-200 rounded w-24"></div></td>
                  <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-20 mb-2"></div></td>
                  <td className="py-4 px-6"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                  <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                  <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                  <td className="py-4 px-6"><div className="h-8 bg-slate-200 rounded-lg w-20 ml-auto"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4"><TicketPercent size={28} className="sm:w-8 sm:h-8" /></div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">No coupons available</h3>
          <p className="text-[11px] sm:text-sm text-slate-400 mb-5 sm:mb-6 max-w-sm">Launch promotional marketing campaigns by creating discount codes for your customers.</p>
          <button onClick={() => setIsModalOpen(true)} className="px-5 sm:px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow hover:bg-emerald-700 transition-all cursor-pointer">Create Your First Coupon</button>
        </div>
      ) : (
        <>
          {/* 🟢 Desktop & Tablet View */}
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
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Min: ৳{c.min_purchase_amount}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.is_global ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {c.is_global ? 'All Products' : 'Specific Target'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">{c.used_count} / {c.usage_limit ? c.usage_limit : '∞'}</td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      <span className="block font-medium">{new Date(c.valid_from).toLocaleDateString()}</span>
                      <span className="text-[10px] text-slate-400 font-medium">to {new Date(c.valid_to).toLocaleDateString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <button onClick={() => handleToggleActive(c.id, c.active)} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold transition-all cursor-pointer ${c.active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}>
                        {c.active ? <CheckCircle2 size={13} /> : <XCircle size={13} />} {c.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => { setSelectedCoupon(c); setIsEditModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Edit limit/validity"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Delete coupon"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🟢 Mobile View: Responsive Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {coupons.map((c) => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3 transition-all hover:shadow-md">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Tag size={16} /></div>
                    <div>
                      <p className="font-black text-slate-800 text-sm tracking-wide">{c.code}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.is_global ? 'Global Scope' : 'Targeted Scope'}</p>
                    </div>
                  </div>
                  <button onClick={() => handleToggleActive(c.id, c.active)} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${c.active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs py-1">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Discount</span>
                    <span className="font-bold text-slate-800 text-sm">{c.discount_type === 'percentage' ? `${c.discount_amount}% OFF` : `৳${c.discount_amount} OFF`}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Redemptions</span>
                    <span className="font-bold text-slate-800 text-sm">{c.used_count} / {c.usage_limit || '∞'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[10px] sm:text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span>Expires: {new Date(c.valid_to).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setSelectedCoupon(c); setIsEditModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 🟢 Edit Coupon Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <EditCouponModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} coupon={selectedCoupon} onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin_coupons"] })} />
        )}
      </AnimatePresence>

      {/* 🟢 Create Coupon Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden my-auto flex flex-col max-h-[95vh] sm:max-h-[90vh]">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-800">Add New Coupon</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 hover:text-rose-500 transition-colors"><X size={18}/></button>
                </div>

                <div className="overflow-y-auto custom-scrollbar flex-1 p-4 sm:p-6">
                  <form id="couponForm" onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
                    
                    {/* Basic Info */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">Coupon Code *</label>
                      <input required type="text" placeholder="e.g. SUMMER20" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 text-xs sm:text-sm font-bold tracking-wider uppercase focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">Discount Type</label>
                        <select value={formData.discount_type} onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })} className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none bg-white">
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (৳)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">Discount Value *</label>
                        <input required type="number" min="1" placeholder="20" value={formData.discount_amount} onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })} className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">Min. Order (৳)</label>
                        <input type="number" min="0" value={formData.min_purchase_amount} onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })} className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">Global Limit</label>
                        <input type="number" placeholder="Unlimited" value={formData.usage_limit} onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })} className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none" />
                      </div>
                    </div>

                    {/* Scope Selector with Specific Products Search */}
                    <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                      <label className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">Coupon Application Scope</label>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-slate-600 mt-1">
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 sm:p-0 rounded-lg sm:rounded-none sm:bg-transparent">
                          <input type="radio" checked={formData.is_global} onChange={() => setFormData({ ...formData, is_global: true })} className="w-4 h-4 text-emerald-600 accent-emerald-600"/> All Products
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 sm:p-0 rounded-lg sm:rounded-none sm:bg-transparent">
                          <input type="radio" checked={!formData.is_global} onChange={() => setFormData({ ...formData, is_global: false })} className="w-4 h-4 text-emerald-600 accent-emerald-600"/> Specific Scope
                        </label>
                      </div>

                      {!formData.is_global && (
                        <div className="mt-2 p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                          
                          {/* Collections Select */}
                          <div>
                            <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase block mb-1.5">Applicable Collections</label>
                            {isLoadingMetadata ? <div className="w-full p-2 h-20 bg-slate-200 animate-pulse rounded-lg"></div> : (
                              <select multiple value={formData.applicable_collections.map(String)} onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, opt => Number(opt.value));
                                setFormData({ ...formData, applicable_collections: selected });
                              }} className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none h-20 custom-scrollbar">
                                {collections.map((col: any) => <option key={col.id} value={col.id} className="p-1.5 hover:bg-emerald-50">{col.title}</option>)}
                              </select>
                            )}
                          </div>

                          {/* Specific Product Search (Max 5) */}
                          <div className="border-t border-slate-200 pt-3">
                            <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase flex items-center justify-between mb-1.5">
                              <span>Specific Products</span>
                              <span className={`${selectedProducts.length >= 5 ? 'text-rose-500' : 'text-slate-400'} font-bold`}>{selectedProducts.length} / 5 Max</span>
                            </label>
                            
                            {/* Selected Chips */}
                            {selectedProducts.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-2.5">
                                {selectedProducts.map(p => (
                                  <span key={p.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 shadow-sm">
                                    <span className="truncate max-w-[100px] sm:max-w-[150px]">{p.title}</span>
                                    <button type="button" onClick={() => removeProduct(p.id)} className="hover:text-rose-500"><X size={12} /></button>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Search Bar */}
                            <div className="relative">
                              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input 
                                type="text" 
                                placeholder={selectedProducts.length >= 5 ? "Limit reached (5 max)" : "Search product by name..."}
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                disabled={selectedProducts.length >= 5}
                                className="w-full pl-8 pr-3 py-2 sm:py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none disabled:bg-slate-100 transition-all bg-white"
                              />
                              {isSearchingProducts && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin" />}
                              
                              {/* Search Results Dropdown */}
                              {searchResults.length > 0 && productSearch && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto custom-scrollbar">
                                  {searchResults.map(p => (
                                    <button 
                                      key={p.id} type="button" onClick={() => handleAddProduct(p)}
                                      className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 border-b border-slate-50 last:border-0 flex justify-between items-center transition-colors"
                                    >
                                      <span className="font-bold text-slate-700 truncate mr-2">{p.title}</span>
                                      <span className="text-emerald-600 font-black shrink-0">${p.unit_price}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>

                    {/* Validity Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 border-t border-slate-100">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">Valid From</label>
                        <input type="datetime-local" value={formData.valid_from} onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })} className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none transition-all" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">Valid Until</label>
                        <input type="datetime-local" value={formData.valid_to} onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })} className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none transition-all" />
                      </div>
                    </div>
                  </form>
                </div>

                <div className="p-4 sm:p-5 border-t border-slate-100 shrink-0 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-1/2 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 transition-all cursor-pointer">Cancel</button>
                  <button type="submit" form="couponForm" disabled={isSubmitting} className="w-full sm:w-1/2 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:bg-emerald-400">
                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Coupon"}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}