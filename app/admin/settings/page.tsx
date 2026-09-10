"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Truck,
  ShieldCheck,
  Loader2,
  Save,
  Link as LinkIcon,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const tabs = [
    { id: "general", label: "Store Info", icon: Store },
    { id: "social", label: "Social Media", icon: LinkIcon },
    { id: "shipping", label: "Shipping Rates", icon: Truck },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  // 🟢 Fetch Settings with React Query for Instant Caching & Zero Loading Lag
  const { isLoading: loading } = useQuery({
    queryKey: ["admin_settings"],
    queryFn: async () => {
      const res = await apiClient.get("/store/settings/");
      const data = Array.isArray(res.data)
        ? res.data[0]
        : res.data?.results?.[0] || res.data || {};
      setFormData(data);
      return data;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch("/store/settings/", formData);
      toast.success("Settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin_settings"] });
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="animate-spin text-emerald-500 w-10 h-10" />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-10 font-sans mt-4 sm:mt-6 px-3 sm:px-4 lg:px-6">
      
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Platform Settings</h1>
        <p className="text-[11px] sm:text-sm text-slate-500 mt-1 font-medium">
          Manage Petora BD configurations and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 sm:gap-6 lg:gap-8 items-start">
        
        {/* 🟢 Responsive Sidebar Tabs (Horizontal scroll on mobile, vertical on desktop) */}
        <div className="w-full lg:w-64 shrink-0 flex lg:flex-col gap-2 bg-white p-2.5 sm:p-3 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 shadow-sm lg:shadow-none"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <Icon
                  size={16}
                  className={`sm:w-[18px] sm:h-[18px] ${isActive ? "text-emerald-600" : "text-slate-400"}`}
                />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 md:p-8 overflow-hidden min-h-[350px] sm:min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-5 sm:space-y-6"
            >
              {/* 🟢 General Store Info Tab */}
              {activeTab === "general" && (
                <div className="space-y-4 sm:space-y-5">
                  <h2 className="text-base sm:text-lg font-bold text-slate-800 border-b border-slate-100 pb-2.5">
                    Store Information
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Store Name
                      </label>
                      <input
                        name="store_name"
                        value={formData.store_name || ""}
                        onChange={handleChange}
                        placeholder="e.g. Petora BD"
                        className="w-full mt-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Support Email
                      </label>
                      <input
                        name="support_email"
                        type="email"
                        value={formData.support_email || ""}
                        onChange={handleChange}
                        placeholder="support@petorabd.com"
                        className="w-full mt-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Currency Dropdown */}
                  <div>
                    <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Currency Symbol
                    </label>
                    <div className="relative mt-1">
                      <select
                        name="currency_symbol"
                        value={formData.currency_symbol || "৳"}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer text-slate-700 font-medium text-xs sm:text-sm"
                      >
                        <option value="৳">Taka (৳)</option>
                        <option value="$">US Dollar ($)</option>
                        <option value="€">Euro (€)</option>
                        <option value="£">Pound (£)</option>
                        <option value="₹">Rupee (₹)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1 ml-1">
                      Select the main currency for your store.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Contact Phone
                      </label>
                      <input
                        name="contact_phone"
                        value={formData.contact_phone || ""}
                        onChange={handleChange}
                        placeholder="e.g. +880 1234 567890"
                        className="w-full mt-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Business Hours
                      </label>
                      <input
                        name="business_hours"
                        value={formData.business_hours || ""}
                        onChange={handleChange}
                        placeholder="e.g. 9:00 AM - 10:00 PM"
                        className="w-full mt-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Store Address
                    </label>
                    <input
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      placeholder="Full physical address"
                      className="w-full mt-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Short Description (Footer)
                    </label>
                    <textarea
                      name="short_description"
                      value={formData.short_description || ""}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Short text showing below the footer logo..."
                      className="w-full mt-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* 🟢 Social Media Links Tab */}
              {activeTab === "social" && (
                <div className="space-y-4 sm:space-y-5">
                  <h2 className="text-base sm:text-lg font-bold text-slate-800 border-b border-slate-100 pb-2.5">
                    Social Media Links
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 mb-4">
                    Leave fields blank to hide the respective social icons from the footer.
                  </p>

                  <div className="space-y-3.5 sm:space-y-4">
                    <div>
                      <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        Facebook URL
                      </label>
                      <input
                        name="facebook_link"
                        value={formData.facebook_link || ""}
                        onChange={handleChange}
                        placeholder="https://facebook.com/yourpage"
                        className="w-full mt-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        Instagram URL
                      </label>
                      <input
                        name="instagram_link"
                        value={formData.instagram_link || ""}
                        onChange={handleChange}
                        placeholder="https://instagram.com/yourprofile"
                        className="w-full mt-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        YouTube URL
                      </label>
                      <input
                        name="youtube_link"
                        value={formData.youtube_link || ""}
                        onChange={handleChange}
                        placeholder="https://youtube.com/@yourchannel"
                        className="w-full mt-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 🟢 Shipping Tab */}
              {activeTab === "shipping" && (
                <div className="space-y-4">
                  <h2 className="text-base sm:text-lg font-bold text-slate-800 border-b border-slate-100 pb-2.5">
                    Delivery Charges
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Inside Dhaka (৳)
                      </label>
                      <input
                        type="number"
                        name="delivery_charge_inside"
                        value={formData.delivery_charge_inside || ""}
                        onChange={handleChange}
                        className="w-full mt-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Outside Dhaka (৳)
                      </label>
                      <input
                        type="number"
                        name="delivery_charge_outside"
                        value={formData.delivery_charge_outside || ""}
                        onChange={handleChange}
                        className="w-full mt-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 🟢 Security Tab */}
              {activeTab === "security" && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
                  <ShieldCheck size={40} className="mb-3 opacity-20 sm:w-12 sm:h-12" />
                  <p className="text-xs sm:text-sm font-medium">Advanced security settings coming soon.</p>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4 sm:pt-6 mt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto px-5 sm:px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:bg-emerald-400"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}{" "}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}