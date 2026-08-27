"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/services/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Truck, ShieldCheck, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const tabs = [
    { id: "general", label: "Store Info", icon: Store },
    { id: "shipping", label: "Shipping Rates", icon: Truck },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get('/store/settings/');
      setFormData(res.data);
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch('/store/settings/', formData);
      toast.success("Settings updated successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500 w-10 h-10" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Platform Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your store configurations and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 space-y-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <Icon size={18} className={isActive ? "text-emerald-600" : "text-slate-400"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 overflow-hidden min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === "general" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Store Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Store Name</label>
                      <input name="store_name" value={formData.store_name || ""} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Support Email</label>
                      <input name="support_email" value={formData.support_email || ""} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                    <input name="address" value={formData.address || ""} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                  </div>
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Delivery Charges</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Inside Dhaka (৳)</label>
                      <input type="number" name="delivery_charge_inside" value={formData.delivery_charge_inside || ""} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Outside Dhaka (৳)</label>
                      <input type="number" name="delivery_charge_outside" value={formData.delivery_charge_outside || ""} onChange={handleChange} className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <ShieldCheck size={48} className="mb-3 opacity-20" />
                  <p>Advanced security settings coming soon.</p>
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
                <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}