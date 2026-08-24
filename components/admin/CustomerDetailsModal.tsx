"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/services/apiClient";
import { X, Loader2, User, Phone, Calendar, ShieldCheck, Mail, Package, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

interface Customer {
  id: number;
  phone: string;
  dob: string | null;
  membership: 'B' | 'S' | 'G';
  user_id: number;
  user?: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onUpdate: (updatedCustomer: Customer) => void;
}

export default function CustomerDetailsModal({ isOpen, onClose, customer, onUpdate }: CustomerDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [membership, setMembership] = useState<'B' | 'S' | 'G'>('B');
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (customer && isOpen) {
      setMembership(customer.membership);
      setPhone(customer.phone || "");
      setDob(customer.dob || "");

      // 🟢 Fetching Order History for this specific customer
      setIsLoadingOrders(true);
      apiClient.get('/store/orders/')
        .then(res => {
          const allOrders = res.data.results || res.data;
          setCustomerOrders(allOrders.filter((o: any) => o.customer === customer.id));
        })
        .catch(() => toast.error("Failed to load order history"))
        .finally(() => setIsLoadingOrders(false));
    }
  }, [customer, isOpen]);

  if (!isOpen || !customer) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await apiClient.patch(`/store/customers/${customer.id}/`, {
        membership, phone, dob
      });
      onUpdate({ ...customer, membership, phone, dob });
      toast.success("Customer details updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update customer details.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getMembershipDisplay = (type: string) => {
    switch (type) {
      case 'G': return 'bg-amber-100 text-amber-600';
      case 'S': return 'bg-slate-200 text-slate-600';
      case 'B': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const displayName = customer.user?.first_name 
    ? `${customer.user.first_name} ${customer.user.last_name || ''}` 
    : customer.user?.username || `Customer #${customer.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-all overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${getMembershipDisplay(customer.membership)}`}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{displayName}</h2>
              <p className="text-xs text-slate-500 font-medium">{customer.user?.email || "No Email Attached"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          <form id="editCustomerForm" onSubmit={handleUpdate} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <User size={16} className="text-emerald-500" /> Edit Customer Info
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Phone Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Date of Birth</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Membership Level</label>
              <div className="relative">
                <ShieldCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={membership} onChange={(e) => setMembership(e.target.value as 'B' | 'S' | 'G')} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer text-slate-700">
                  <option value="B">Bronze Member</option>
                  <option value="S">Silver Member</option>
                  <option value="G">Gold Member</option>
                </select>
              </div>
            </div>
          </form>

          {/* 🟢 Order History Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
              <Package size={16} className="text-emerald-500" /> Order History ({customerOrders.length})
            </h3>
            
            {isLoadingOrders ? (
              <div className="py-8 text-center"><Loader2 size={24} className="animate-spin text-emerald-500 mx-auto" /></div>
            ) : customerOrders.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-sm border border-slate-100 rounded-xl bg-slate-50/50">This customer hasn't placed any orders yet.</div>
            ) : (
              <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto custom-scrollbar">
                {customerOrders.map(order => {
                  const total = order.items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0);
                  return (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Order #{order.id.toString().padStart(4, '0')}</p>
                        <p className="text-xs text-slate-500">{new Date(order.placed_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-black text-emerald-600">${total.toFixed(2)}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{order.delivery_status}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors cursor-pointer">
            Close
          </button>
          <button type="submit" form="editCustomerForm" disabled={isUpdating} className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer">
            {isUpdating ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}