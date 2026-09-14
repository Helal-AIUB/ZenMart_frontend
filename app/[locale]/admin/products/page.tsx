"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { 
  Edit, Trash2, Plus, Search, ChevronLeft, ChevronRight, 
  AlertCircle, ImagePlus, Package, Layers, FolderPlus, X, Loader2 
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import AddProductModal from "@/components/admin/AddProductModal";
import EditProductModal from "@/components/admin/EditProductModal";

// --- Types ---
interface Product {
  id: number;
  title: string;
  description?: string;
  unit_price: number;
  inventory: number;
  collection?: number;
  images?: { id: number; image: string }[];
}

interface Collection {
  id: number;
  title: string;
  products_count: number;
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();

  // 🟢 Core States
  const [activeTab, setActiveTab] = useState<"products" | "collections">("products");
  
  // 🟢 Product Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterId, setFilterId] = useState("");
  const [filterPrice, setFilterPrice] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 🟢 Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [collectionTitle, setCollectionTitle] = useState("");
  const [isSubmittingCollection, setIsSubmittingCollection] = useState(false);

  // 🟢 Fetch Collections (Cached)
  const { data: collections = [], isLoading: loadingCollections } = useQuery<Collection[]>({
    queryKey: ["admin_collections"],
    queryFn: async () => {
      const res = await apiClient.get("/store/collections/");
      return res.data.results || res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 🟢 Fetch Products (Cached & Dependent on filters)
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["admin_products", currentPage, searchTerm, filterId, filterPrice, filterCategory],
    queryFn: async () => {
      let query = `/store/products/?page=${currentPage}`;
      if (searchTerm) query += `&search=${searchTerm}`;
      if (filterId) query += `&id=${filterId}`;
      if (filterPrice) query += `&unit_price__lte=${filterPrice}`;
      if (filterCategory) query += `&collection_id=${filterCategory}`;

      const res = await apiClient.get(query);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const products: Product[] = productsData?.results || [];
  const totalItems = productsData?.count || 0;
  const totalPages = Math.ceil(totalItems / 10) || 1;

  // --- Product Handlers ---
  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiClient.delete(`/store/products/${id}/`);
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin_products"] });
      queryClient.invalidateQueries({ queryKey: ["admin_collections"] });
    } catch (error: any) {
      if (error.response?.status === 405) {
        toast.error("Cannot delete: Product is associated with an order item.");
      } else {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleProductAdded = (newProduct: Product) => {
    queryClient.invalidateQueries({ queryKey: ["admin_products"] });
    queryClient.invalidateQueries({ queryKey: ["admin_collections"] });
    setIsAddModalOpen(false);
    setSelectedProduct(newProduct);
    setIsEditModalOpen(true);
  };

  const handleProductUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["admin_products"] });
  };

  // --- Collection Handlers ---
  const handleOpenCollectionModal = (collection?: Collection) => {
    if (collection) {
      setEditingCollection(collection);
      setCollectionTitle(collection.title);
    } else {
      setEditingCollection(null);
      setCollectionTitle("");
    }
    setIsCollectionModalOpen(true);
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionTitle.trim()) return toast.error("Collection title is required");
    
    setIsSubmittingCollection(true);
    try {
      if (editingCollection) {
        await apiClient.patch(`/store/collections/${editingCollection.id}/`, { title: collectionTitle });
        toast.success("Collection updated!");
      } else {
        await apiClient.post("/store/collections/", { title: collectionTitle });
        toast.success("Collection created!");
      }
      queryClient.invalidateQueries({ queryKey: ["admin_collections"] });
      setIsCollectionModalOpen(false);
    } catch (error) {
      toast.error("Failed to save collection");
    } finally {
      setIsSubmittingCollection(false);
    }
  };

  const handleDeleteCollection = async (id: number, count: number) => {
    if (count > 0) return toast.error("Cannot delete collection with existing products.");
    if (!window.confirm("Are you sure you want to delete this collection?")) return;
    
    try {
      await apiClient.delete(`/store/collections/${id}/`);
      queryClient.invalidateQueries({ queryKey: ["admin_collections"] });
      toast.success("Collection deleted successfully");
    } catch (error) {
      toast.error("Failed to delete collection");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-10 max-w-[1600px] mx-auto mt-4 sm:mt-6">
      
      {/* --- Premium Header & Tabs --- */}
      <div className="flex flex-col gap-4 sm:gap-5 bg-white p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Catalog Management</h1>
            <p className="text-[11px] sm:text-sm text-slate-500 mt-1 font-medium">Control your products, inventory, and categories.</p>
          </div>
          
          {activeTab === "products" ? (
            <button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer shrink-0">
              <Plus size={18} className="sm:w-5 sm:h-5"/> <span>Add Product</span>
            </button>
          ) : (
            <button onClick={() => handleOpenCollectionModal()} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer shrink-0">
              <FolderPlus size={18} className="sm:w-5 sm:h-5"/> <span>Add Collection</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 bg-slate-50 p-1.5 rounded-2xl w-full sm:w-fit overflow-x-auto custom-scrollbar">
          <button onClick={() => setActiveTab("products")} className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === "products" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"}`}>
            <Package size={16} /> Products
          </button>
          <button onClick={() => setActiveTab("collections")} className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === "collections" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"}`}>
            <Layers size={16} /> Collections
          </button>
        </div>
      </div>

      {/* =========================================
          TAB 1: PRODUCTS VIEW
      ========================================= */}
      {activeTab === "products" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
          
          <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search name..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white transition-all" />
            </div>
            <input type="number" placeholder="ID (e.g. 30)" value={filterId} onChange={(e) => { setFilterId(e.target.value); setCurrentPage(1); }} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none bg-slate-50 focus:bg-white transition-all" />
            <input type="number" placeholder="Max Price $" value={filterPrice} onChange={(e) => { setFilterPrice(e.target.value); setCurrentPage(1); }} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none bg-slate-50 focus:bg-white transition-all" />
            <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-600 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer transition-all">
              <option value="">All Collections</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[700px] md:min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="px-4 sm:px-6 py-3 sm:py-4 w-16">ID</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 w-16">Image</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4">Product Name</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 w-28 sm:w-32">Price</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 w-24 sm:w-32">Stock</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 w-28 sm:w-32">Status</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-right w-24 sm:w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {loadingProducts ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 sm:px-6 py-3 sm:py-4"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4"><div className="h-10 w-10 bg-slate-200 rounded-xl"></div></td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4"><div className="h-4 bg-slate-200 rounded w-3/4"></div></td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4"><div className="h-4 bg-slate-200 rounded w-10"></div></td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4"><div className="h-6 bg-slate-200 rounded-md w-16"></div></td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4"><div className="h-8 bg-slate-200 rounded-lg w-16 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : products.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 sm:px-6 py-16 text-center text-slate-400"><AlertCircle size={32} className="mx-auto mb-3 text-slate-300" /> No products found.</td></tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-slate-500">#{product.id}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0].image.startsWith("http") ? product.images[0].image : `${process.env.NEXT_PUBLIC_API_URL || 'https://zenmart-backend.onrender.com'}${product.images[0].image}`} alt={product.title} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl object-cover border border-slate-200 bg-white shadow-sm" />
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300"><ImagePlus size={16} /></div>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-slate-800 truncate max-w-[150px] sm:max-w-xs">{product.title}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-black text-slate-700">${product.unit_price}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium">{product.inventory}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className={`inline-flex px-2 sm:px-2.5 py-1 rounded-md text-[9px] sm:text-[11px] font-bold uppercase tracking-wider ${product.inventory > 10 ? "bg-emerald-50 text-emerald-700" : product.inventory > 0 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>
                            {product.inventory > 10 ? "In Stock" : product.inventory > 0 ? "Low Stock" : "Out of Stock"}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                            <button onClick={() => { setSelectedProduct(product); setIsEditModalOpen(true); }} className="p-1.5 sm:p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"><Edit size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"><Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loadingProducts && totalPages > 1 && (
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 flex items-center justify-between sm:justify-center gap-4 sm:gap-6 bg-slate-50/50">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 sm:p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-600 transition-all shadow-sm"><ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                <span className="text-[11px] sm:text-sm font-bold tracking-wide text-slate-600">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 sm:p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-600 transition-all shadow-sm"><ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* =========================================
          TAB 2: COLLECTIONS VIEW
      ========================================= */}
      {activeTab === "collections" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
          
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="px-6 py-4 w-24">ID</th>
                  <th className="px-6 py-4">Collection Title</th>
                  <th className="px-6 py-4 w-48 text-center">Products Linked</th>
                  <th className="px-6 py-4 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loadingCollections ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-1/3"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded-full w-12 mx-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded-lg w-16 ml-auto"></div></td>
                    </tr>
                  ))
                ) : collections.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-16 text-center text-slate-400"><FolderPlus size={32} className="mx-auto mb-3 text-slate-300" /> No collections created yet.</td></tr>
                ) : (
                  collections.map((col) => (
                    <tr key={col.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-500">#{col.id}</td>
                      <td className="px-6 py-4 font-black text-slate-800 text-base">{col.title}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-3 rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">{col.products_count}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => handleOpenCollectionModal(col)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><Edit size={18} /></button>
                          <button onClick={() => handleDeleteCollection(col.id, col.products_count)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:hidden">
            {loadingCollections ? (
               [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3 sm:gap-4 w-full">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-200 shrink-0"></div>
                    <div className="space-y-2 w-full">
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
               ))
            ) : collections.length === 0 ? (
              <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-100 text-center shadow-sm text-slate-400">
                <FolderPlus size={32} className="mx-auto mb-3 text-slate-300" /> No collections yet.
              </div>
            ) : (
              collections.map((col) => (
                <div key={col.id} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                      <Layers size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-slate-800 text-sm sm:text-base truncate">{col.title}</h3>
                      <p className="text-[10px] sm:text-xs font-bold text-slate-500 mt-0.5">{col.products_count} Products Linked</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:gap-2 shrink-0 ml-2">
                    <button onClick={() => handleOpenCollectionModal(col)} className="p-1.5 sm:p-2 bg-slate-50 text-slate-500 hover:text-blue-600 rounded-lg transition-colors border border-slate-100"><Edit size={14} className="sm:w-[16px] sm:h-[16px]"/></button>
                    <button onClick={() => handleDeleteCollection(col.id, col.products_count)} className="p-1.5 sm:p-2 bg-slate-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors border border-slate-100"><Trash2 size={14} className="sm:w-[16px] sm:h-[16px]"/></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* =========================================
          MODALS
      ========================================= */}
      <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} collections={collections} onSuccess={handleProductAdded} />
      <EditProductModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} product={selectedProduct} onUpdate={handleProductUpdated} />

      <AnimatePresence>
        {isCollectionModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCollectionModalOpen(false)} className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                    <FolderPlus className="text-blue-600 sm:w-5 sm:h-5" size={18} />
                    {editingCollection ? "Edit Collection" : "New Collection"}
                  </h3>
                  <button onClick={() => setIsCollectionModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X size={18} className="sm:w-5 sm:h-5" /></button>
                </div>
                
                <form onSubmit={handleSaveCollection} className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700">Collection Title <span className="text-rose-500">*</span></label>
                    <input required autoFocus type="text" placeholder="e.g. Pet Toys" value={collectionTitle} onChange={(e) => setCollectionTitle(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 bg-slate-50 focus:bg-white" />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 pt-2">
                    <button type="button" onClick={() => setIsCollectionModalOpen(false)} className="w-full sm:w-1/2 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg sm:rounded-xl transition-all cursor-pointer">Cancel</button>
                    <button type="submit" disabled={isSubmittingCollection || !collectionTitle.trim()} className="w-full sm:w-1/2 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg sm:rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2">
                      {isSubmittingCollection ? <Loader2 size={16} className="animate-spin" /> : (editingCollection ? "Save Changes" : "Create")}
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