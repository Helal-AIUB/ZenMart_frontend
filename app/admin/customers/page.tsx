"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { Search, AlertCircle, Eye, Trash2, Users, Award, ChevronLeft, ChevronRight, Mail, Phone, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import CustomerDetailsModal from "@/components/admin/CustomerDetailsModal";
import CreateCustomerModal from "@/components/admin/CreateCustomerModal";

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
  const queryClient = useQueryClient();

  // 🟢 Fetch Customers using React Query for Instant Caching & Performance
  const { data: customers = [], isLoading: loading } = useQuery<Customer[]>({
    queryKey: ["admin_customers"],
    queryFn: async () => {
      const res = await apiClient.get('/store/customers/');
      return res.data.results || res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMembership, setFilterMembership] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

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

  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentDisplayedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalGold = useMemo(() => customers.filter(c => c.membership === 'G').length, [customers]);
  const totalSilver = useMemo(() => customers.filter(c => c.membership === 'S').length, [customers]);
  const totalBronze = useMemo(() => customers.filter(c => c.membership === 'B').length, [customers]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently remove this customer? This might delete their orders as well.")) return;
    
    // Optimistic UI Update
    queryClient.setQueryData(["admin_customers"], (old: Customer[] = []) => old.filter(c => c.id !== id));

    try {
      await apiClient.delete(`/store/customers/${id}/`);
      toast.success("Customer removed successfully");
      queryClient.invalidateQueries({ queryKey: ["admin_customers"] });
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ["admin_customers"] });
      toast.error("Failed to remove customer. They might have active orders.");
    }
  };

  const handleCustomerUpdated = (updatedCustomer: Customer) => {
    queryClient.setQueryData(["admin_customers"], (old: Customer[] = []) => 
      old.map((c) => c.id === updatedCustomer.id ? updatedCustomer : c)
    );
  };

  const renderMembershipBadge = (type: string) => {
    switch (type) {
      case 'G': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-[10px] sm:text-xs font-bold shadow-sm whitespace-nowrap"><Award size={12} /> Gold</span>;
      case 'S': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-[10px] sm:text-xs font-bold shadow-sm whitespace-nowrap"><Award size={12} /> Silver</span>;
      case 'B': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-full text-[10px] sm:text-xs font-bold shadow-sm whitespace-nowrap"><Award size={12} /> Bronze</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-10 font-sans max-w-[1600px] mx-auto mt-4 sm:mt-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Customer Management</h1>
          <p className="text-[11px] sm:text-sm text-slate-500 mt-1 font-medium">Manage users, view profiles, and upgrade memberships</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus size={18} className="sm:w-5 sm:h-5" /> Add Customer
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0"><Users size={20} className="sm:w-6 sm:h-6" /></div>
          <div className="min-w-0"><p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider truncate">Total Customers</p><p className="text-lg sm:text-xl font-black text-slate-800">{customers.length}</p></div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center border border-amber-100 shrink-0"><Award size={20} className="sm:w-6 sm:h-6" /></div>
          <div className="min-w-0"><p className="text-[10px] sm:text-xs text-amber-600/70 font-bold uppercase tracking-wider truncate">Gold Members</p><p className="text-lg sm:text-xl font-black text-slate-800">{totalGold}</p></div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center border border-slate-200 shrink-0"><Award size={20} className="sm:w-6 sm:h-6" /></div>
          <div className="min-w-0"><p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider truncate">Silver Members</p><p className="text-lg sm:text-xl font-black text-slate-800">{totalSilver}</p></div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center border border-orange-100 shrink-0"><Award size={20} className="sm:w-6 sm:h-6" /></div>
          <div className="min-w-0"><p className="text-[10px] sm:text-xs text-orange-600/70 font-bold uppercase tracking-wider truncate">Bronze Members</p><p className="text-lg sm:text-xl font-black text-slate-800">{totalBronze}</p></div>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <div className="relative w-full sm:w-3/4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" placeholder="Search by name, email, phone or ID..." 
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full pl-9 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-slate-50 focus:bg-white" 
          />
        </div>
        <div className="w-full sm:w-1/4">
          <select value={filterMembership} onChange={(e) => setFilterMembership(e.target.value)} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer bg-slate-50 focus:bg-white">
            <option value="">All Memberships</option>
            <option value="G">Gold Members</option>
            <option value="S">Silver Members</option>
            <option value="B">Bronze Members</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px] md:min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-4 sm:px-6 py-3 sm:py-4 w-16 text-center">ID</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4">Customer Profile</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4">Contact Info</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 w-28 sm:w-32">Membership</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right w-28 sm:w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 sm:px-6 py-4"><div className="h-4 bg-slate-200 rounded w-8 mx-auto"></div></td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
                        <div className="space-y-1.5 w-32"><div className="h-3.5 bg-slate-200 rounded w-full"></div><div className="h-3 bg-slate-200 rounded w-2/3"></div></div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4"><div className="h-3.5 bg-slate-200 rounded w-32 mb-1.5"></div><div className="h-3 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-4 sm:px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-16"></div></td>
                    <td className="px-4 sm:px-6 py-4"><div className="h-8 bg-slate-200 rounded-lg w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : currentDisplayedCustomers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400"><AlertCircle size={32} className="mx-auto mb-3 text-slate-300" /> No customers found.</td></tr>
              ) : (
                currentDisplayedCustomers.map((customer) => {
                  const name = customer.user?.first_name ? `${customer.user.first_name} ${customer.user.last_name || ''}` : customer.user?.username || `Unknown User`;
                  
                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-extrabold text-slate-700 text-center">#{customer.id}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shadow-sm text-xs sm:text-sm shrink-0">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate max-w-[130px] sm:max-w-xs">{name}</p>
                            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">User ID: {customer.user_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 space-y-1">
                        <p className="text-slate-600 flex items-center gap-1.5 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-xs"><Mail size={12} className="text-slate-400 shrink-0"/> {customer.user?.email || "N/A"}</p>
                        <p className="text-slate-500 text-[11px] sm:text-xs flex items-center gap-1.5"><Phone size={12} className="text-slate-400 shrink-0"/> {customer.phone || "N/A"}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">{renderMembershipBadge(customer.membership)}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => { setSelectedCustomer(customer); setIsDetailsOpen(true); }} className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors border border-emerald-200 cursor-pointer">
                            <Eye size={14} /> <span className="hidden sm:inline">View</span>
                          </button>
                          <button onClick={() => handleDelete(customer.id)} className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
                            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
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
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 flex items-center justify-between sm:justify-center gap-4 sm:gap-6 bg-slate-50/50">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 sm:p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 text-slate-600 transition-all shadow-sm"><ChevronLeft size={16} /></button>
            <span className="text-xs sm:text-sm font-bold tracking-wide text-slate-600">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 sm:p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 text-slate-600 transition-all shadow-sm"><ChevronRight size={16} /></button>
          </div>
        )}
      </div>

      <CustomerDetailsModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} customer={selectedCustomer} onUpdate={handleCustomerUpdated} />
      <CreateCustomerModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin_customers"] })} />
    </div>
  );
}