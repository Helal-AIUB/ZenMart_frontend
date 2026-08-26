"use client";

import { useEffect, useState, useMemo } from "react";
import { apiClient } from "@/services/apiClient";
import { Search, Loader2, AlertCircle, Eye, Trash2, Users, Award, ChevronLeft, ChevronRight, Mail, Phone, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import CustomerDetailsModal from "@/components/admin/CustomerDetailsModal";
import CreateCustomerModal from "@/components/admin/CreateCustomerModal"; // 🟢 New Import

// --- Types ---
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

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMembership, setFilterMembership] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false); // 🟢 New State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/store/customers/');
      setCustomers(res.data.results || res.data);
    } catch (error) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Real-time Smart Filtering
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = searchQuery 
        ? customer.phone?.toLowerCase().includes(searchLower) || 
          customer.user?.first_name?.toLowerCase().includes(searchLower) ||
          customer.user?.email?.toLowerCase().includes(searchLower) ||
          customer.id.toString().includes(searchLower)
        : true;
      
      const matchMembership = filterMembership ? customer.membership === filterMembership : true;

      return matchSearch && matchMembership;
    });
  }, [customers, searchQuery, filterMembership]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterMembership]);

  // Pagination & Stats Calculations
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentDisplayedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalGold = customers.filter(c => c.membership === 'G').length;
  const totalSilver = customers.filter(c => c.membership === 'S').length;
  const totalBronze = customers.filter(c => c.membership === 'B').length;

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently remove this customer? This might delete their orders as well.")) return;
    try {
      await apiClient.delete(`/store/customers/${id}/`);
      toast.success("Customer removed successfully");
      setCustomers(prev => prev.filter(c => c.id !== id)); 
    } catch (error) {
      toast.error("Failed to remove customer. They might have active orders.");
    }
  };

  const handleCustomerUpdated = (updatedCustomer: Customer) => {
    setCustomers((prev) => prev.map((c) => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  const renderMembershipBadge = (type: string) => {
    switch (type) {
      case 'G': return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-xs font-bold shadow-sm"><Award size={12} /> Gold</span>;
      case 'S': return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-bold shadow-sm"><Award size={12} /> Silver</span>;
      case 'B': return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded-full text-xs font-bold shadow-sm"><Award size={12} /> Bronze</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 pb-10 font-sans">
      
      {/* 🟢 Header Update with Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customer Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage users, view profiles, and upgrade memberships</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <UserPlus size={18} /> Add Customer
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-100"><Users size={24} /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Customers</p><p className="text-xl font-black text-slate-800">{customers.length}</p></div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center border border-amber-100"><Award size={24} /></div>
          <div><p className="text-xs text-amber-600/70 font-bold uppercase tracking-wider">Gold Members</p><p className="text-xl font-black text-slate-800">{totalGold}</p></div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center border border-slate-200"><Award size={24} /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Silver Members</p><p className="text-xl font-black text-slate-800">{totalSilver}</p></div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center border border-orange-100"><Award size={24} /></div>
          <div><p className="text-xs text-orange-600/70 font-bold uppercase tracking-wider">Bronze Members</p><p className="text-xl font-black text-slate-800">{totalBronze}</p></div>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-1/2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" placeholder="Search by name, email, phone or ID..." 
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
          />
        </div>
        <div className="w-full sm:w-1/4">
          <select value={filterMembership} onChange={(e) => setFilterMembership(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer">
            <option value="">All Memberships</option>
            <option value="G">Gold Members</option>
            <option value="S">Silver Members</option>
            <option value="B">Bronze Members</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-5 w-20 text-center">ID</th>
                <th className="px-6 py-5">Customer Profile</th>
                <th className="px-6 py-5">Contact Info</th>
                <th className="px-6 py-5 w-32">Membership</th>
                <th className="px-6 py-5 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" /> Loading customers...</td></tr>
              ) : currentDisplayedCustomers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400"><AlertCircle size={32} className="mx-auto mb-3 text-slate-300" /> No customers found.</td></tr>
              ) : (
                currentDisplayedCustomers.map((customer) => {
                  const name = customer.user?.first_name ? `${customer.user.first_name} ${customer.user.last_name || ''}` : customer.user?.username || `Unknown User`;
                  
                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 font-extrabold text-slate-700 text-center">#{customer.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{name}</p>
                            <p className="text-xs text-slate-500 font-medium">User ID: {customer.user_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <p className="text-slate-600 flex items-center gap-2"><Mail size={12} className="text-slate-400"/> {customer.user?.email || "N/A"}</p>
                        <p className="text-slate-500 text-xs flex items-center gap-2"><Phone size={12} className="text-slate-400"/> {customer.phone || "N/A"}</p>
                      </td>
                      <td className="px-6 py-4">{renderMembershipBadge(customer.membership)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setSelectedCustomer(customer); setIsDetailsOpen(true); }} 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors border border-emerald-200 cursor-pointer"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button 
                            onClick={() => handleDelete(customer.id)} 
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-center gap-6 bg-slate-50/50">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 text-slate-600 transition-all shadow-sm"><ChevronLeft size={18} /></button>
            <span className="text-sm font-bold tracking-wide text-slate-600">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 text-slate-600 transition-all shadow-sm"><ChevronRight size={18} /></button>
          </div>
        )}
      </div>

      {/* Details/Edit Modal */}
      <CustomerDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        customer={selectedCustomer} 
        onUpdate={handleCustomerUpdated} 
      />

      {/* 🟢 Create Customer Modal */}
      <CreateCustomerModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={fetchCustomers} 
      />
    </div>
  );
}