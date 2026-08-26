"use client";

import { useState } from "react";
import { apiClient } from "@/services/apiClient";
import { X, Loader2, UserPlus, Mail, Lock, Phone, Calendar, ShieldCheck, User } from "lucide-react";
import toast from "react-hot-toast";

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCustomerModal({ isOpen, onClose, onSuccess }: CreateCustomerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    dob: "",
    membership: "B"
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Create Core User Account
      const userRes = await apiClient.post("/auth/users/", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      const userId = userRes.data.id;

      // 2. Prepare Customer Payload safely (ignoring empty dob)
      const customerPayload: any = {
        phone: formData.phone,
        membership: formData.membership
      };
      if (formData.dob) {
        customerPayload.dob = formData.dob;
      }

      // 3. Find auto-created Customer Profile and Update it
      const custRes = await apiClient.get('/store/customers/');
      const customers = custRes.data.results || custRes.data;
      const existingProfile = customers.find((c: any) => c.user_id === userId);

      if (existingProfile) {
        await apiClient.patch(`/store/customers/${existingProfile.id}/`, customerPayload);
      } else {
        await apiClient.post("/store/customers/", {
          ...customerPayload,
          user_id: userId
        });
      }

      toast.success("Customer created successfully!");
      setFormData({ username: "", email: "", password: "", first_name: "", last_name: "", phone: "", dob: "", membership: "B" });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.username?.[0] 
                    || error.response?.data?.password?.[0]
                    || error.response?.data?.detail 
                    || "Failed to create customer. Please check the inputs.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-all overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Add New Customer</h2>
              <p className="text-xs text-slate-500 font-medium">Create a new user account and profile</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30">
          <form id="createCustomerForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Account Details */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <Lock size={16} className="text-emerald-500" /> Account Details
              </h3>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Username *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required type="text" name="username" value={formData.username} onChange={handleChange} placeholder="e.g. john_doe" className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Email Address *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Password *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white" />
                </div>
              </div>
            </div>

            {/* Right Column: Personal & Profile Details */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <User size={16} className="text-emerald-500" /> Personal Profile
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">First Name</label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="John" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Last Name</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Doe" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Phone Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+880 17..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Date of Birth</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white cursor-pointer" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Membership</label>
                  <div className="relative">
                    <ShieldCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select name="membership" value={formData.membership} onChange={handleChange} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white cursor-pointer text-slate-700">
                      <option value="B">Bronze</option>
                      <option value="S">Silver</option>
                      <option value="G">Gold</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors cursor-pointer">
            Cancel
          </button>
          <button type="submit" form="createCustomerForm" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer">
            {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Create Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}