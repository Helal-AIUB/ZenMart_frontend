"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/services/apiClient";
import { Phone, Calendar, ShieldCheck, Edit3, Loader2, Mail, User, X, Save } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileDetails() {
  // 🟢 Dynamic States
  const [userData, setUserData] = useState<any>(null);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🟢 Edit Modal States
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    dob: "",
  });

  const fetchProfile = async () => {
    try {
      const [userRes, customerRes] = await Promise.all([
        apiClient.get("/auth/users/me/"),
        apiClient.get("/store/customers/me/")
      ]);
      setUserData(userRes.data);
      setCustomerInfo(customerRes.data);
      
      // Populate form data
      setFormData({
        first_name: userRes.data?.first_name || "",
        last_name: userRes.data?.last_name || "",
        phone: customerRes.data?.phone || "",
        dob: customerRes.data?.dob || "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // 1. Update Django User (first_name, last_name)
      await apiClient.patch("/auth/users/me/", {
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      // 2. Update Customer Profile (phone, dob)
      // Since your backend supports PUT, we send the required fields
      await apiClient.put("/store/customers/me/", {
        phone: formData.phone,
        dob: formData.dob || null, // Handle empty date
        membership: customerInfo?.membership // Keep existing membership
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile(); // Refresh UI with new data
    } catch (error) {
      toast.error("Failed to update profile.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // 🟢 Extracting Dynamic Values
  const fullName = userData?.first_name ? `${userData.first_name} ${userData.last_name || ''}` : "Unknown User";
  const email = userData?.email || "No email found";
  const phone = customerInfo?.phone || "Not added yet";
  const dob = customerInfo?.dob || "Not added yet";
  
  // Dynamic Membership Logic
  const membershipLevel = customerInfo?.membership || 'B';
  const membershipText = membershipLevel === 'G' ? 'Gold' : membershipLevel === 'S' ? 'Silver' : 'Bronze';
  
  // Dynamic Styling based on Membership
  const membershipStyles = {
    'G': 'bg-yellow-50 border-yellow-200 text-yellow-600',
    'S': 'bg-slate-100 border-slate-200 text-slate-600',
    'B': 'bg-amber-50 border-amber-100 text-amber-600'
  };
  const currentStyle = membershipStyles[membershipLevel as keyof typeof membershipStyles];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans relative">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-0">
        
        {/* Personal Details Card */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User size={20} className="text-emerald-500" /> Personal Details
            </h2>
            <button 
              onClick={() => setIsEditing(true)}
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 size={14} /> Edit
            </button>
          </div>

          <div className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <p className="text-sm font-semibold text-slate-800">{fullName}</p>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-slate-400" />
                <p className="text-sm font-semibold text-slate-800">{email}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-slate-400" />
                <p className="text-sm font-semibold text-slate-800">{phone}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date of Birth</label>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                <p className="text-sm font-semibold text-slate-800">{dob}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Account Level Card */}
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2rem] p-8 shadow-md text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                <ShieldCheck size={24} className="text-emerald-200" /> Account Security
              </h2>
              <p className="text-sm text-emerald-100/80 mb-6">Your account is fully secured. You can change your Password.</p>
              <button className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-bold rounded-xl transition-all backdrop-blur-sm cursor-pointer w-fit">
                Change Password
              </button>
            </div>
            <ShieldCheck size={120} className="absolute -bottom-6 -right-6 text-white opacity-10" />
          </div>

          <div className={`border rounded-[2rem] p-6 shadow-sm ${currentStyle}`}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">Current Membership</h3>
            <p className="text-2xl font-black mb-1">{membershipText} Member</p>
            <p className="text-xs font-medium opacity-80">Enjoy exclusive perks and free delivery on Petora BD.</p>
          </div>
        </div>
      </div>

      {/* 🟢 EDIT PROFILE MODAL (Framer Motion) */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSaving && setIsEditing(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Edit Profile</h3>
                <button 
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                    <input 
                      name="first_name" 
                      value={formData.first_name} 
                      onChange={handleInputChange} 
                      placeholder="e.g. John" 
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                    <input 
                      name="last_name" 
                      value={formData.last_name} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Doe" 
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                  <input 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    placeholder="+880..." 
                    className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Date of Birth</label>
                  <input 
                    type="date"
                    name="dob" 
                    value={formData.dob} 
                    onChange={handleInputChange} 
                    className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-600" 
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}