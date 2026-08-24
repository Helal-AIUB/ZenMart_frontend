"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/services/apiClient";
import { Phone, Calendar, ShieldCheck, Edit3, Loader2, Mail, User } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfileDetails() {
  // 🟢 Dynamic States
  const [userData, setUserData] = useState<any>(null);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userRes, customerRes] = await Promise.all([
          apiClient.get("/auth/users/me/"),
          apiClient.get("/store/customers/me/")
        ]);
        setUserData(userRes.data);
        setCustomerInfo(customerRes.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

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
  const membershipText = customerInfo?.membership === 'G' ? 'Gold' : customerInfo?.membership === 'S' ? 'Silver' : 'Bronze';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Personal Details Card */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User size={20} className="text-emerald-500" /> Personal Details
            </h2>
            <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
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

          <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 shadow-sm">
            <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-2">Current Membership</h3>
            <p className="text-2xl font-black text-amber-600 mb-1">{membershipText} Member</p>
            <p className="text-xs text-amber-700/70 font-medium">Enjoy exclusive perks and free delivery on Petora BD.</p>
          </div>
        </div>

      </div>
    </div>
  );
}