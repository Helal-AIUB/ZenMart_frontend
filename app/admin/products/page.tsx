"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { 
  Edit, Trash2, Plus, Search, ChevronLeft, ChevronRight, 
  AlertCircle, ImagePlus, Loader2, Package, Layers, FolderPlus, X 
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
  // 🟢 Core States
  const [activeTab, setActiveTab] = useState<"products" | "collections">("products");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // 🟢 Product Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterId, setFilterId] = useState("");
  const [filterPrice, setFilterPrice] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // 🟢 Modal States (Products)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 🟢 Modal States (Collections)
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [collectionTitle, setCollectionTitle] = useState("");
  const [isSubmittingCollection, setIsSubmittingCollection] = useState(false);

  // --- Fetch Data ---
  const fetchCollections = async () => {
    try {
      const res = await apiClient.get("/store/collections/");
      setCollections(res.data.results || res.data);
    } catch (error) {
      console.error("Failed to fetch collections", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = `/store/products/?page=${currentPage}`;
      if (searchTerm) query += `&search=${searchTerm}`;
      if (filterId) query += `&id=${filterId}`;
      if (filterPrice) query += `&unit_price__lte=${filterPrice}`;
      if (filterCategory) query += `&collection_id=${filterCategory}`;

      const res = await apiClient.get(query);
      setProducts(res.data.results);
      setTotalItems(res.data.count);
      setTotalPages(Math.ceil(res.data.count / 10));
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (activeTab === "products") {
      const delayDebounceFn = setTimeout(() => fetchProducts(), 500);
      return () => clearTimeout(delayDebounceFn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterId, filterPrice, filterCategory, currentPage, activeTab]);

  // --- Product Handlers ---
  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiClient.delete(`/store/products/${id}/`);
      toast.success("Product deleted successfully");
      fetchProducts();
      fetchCollections(); // Refresh counts
    } catch (error: any) {
      if (error.response?.status === 405) {
        toast.error("Cannot delete: Product is associated with an order item.");
      } else {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleProductAdded = (newProduct: Product) => {
    setProducts([newProduct, ...products]);
    setTotalItems((prev) => prev + 1);
    setIsAddModalOpen(false);
    fetchCollections(); // Refresh counts
    
    // Auto-open Edit modal so user can upload images immediately
    setSelectedProduct(newProduct);
    setIsEditModalOpen(true);
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => p.id === updatedProduct.id ? updatedProduct : p));
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
        // Update
        const res = await apiClient.patch(`/store/collections/${editingCollection.id}/`, { title: collectionTitle });
        setCollections(collections.map(c => c.id === editingCollection.id ? res.data : c));
        toast.success("Collection updated!");
      } else {
        // Create
        const res = await apiClient.post("/store/collections/", { title: collectionTitle });
        setCollections([...collections, res.data]);
        toast.success("Collection created!");
      }
      setIsCollectionModalOpen(false);
    } catch (error) {
      toast.error("Failed to save collection");
    } finally {
      setIsSubmittingCollection(false);
    }
  };

  const handleDeleteCollection = async (id: number, count: number) => {
    if (count > 0) {
      return toast.error("Cannot delete collection with existing products. Move or delete products first.");
    }
    if (!window.confirm("Are you sure you want to delete this collection?")) return;
    
    try {
      await apiClient.delete(`/store/collections/${id}/`);
      setCollections(collections.filter(c => c.id !== id));
      toast.success("Collection deleted successfully");
    } catch (error) {
      toast.error("Failed to delete collection");
    }
  };

  return (
    <div className="space-y-6 pb-10 max-w-[1600px] mx-auto">
      
      {/* --- Premium Header & Tabs --- */}
      <div className="flex flex-col gap-5 bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Catalog Management</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Control your products, inventory, and categories.</p>
          </div>
          
          {/* Action Button Changes Based on Tab */}
          {activeTab === "products" ? (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Plus size={18} /> <span>Add Product</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenCollectionModal()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <FolderPlus size={18} /> <span>Add Collection</span>
            </button>
          )}
        </div>

        {/* Custom Tabs */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === "products" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"}`}
          >
            <Package size={16} /> Products
          </button>
          <button 
            onClick={() => setActiveTab("collections")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === "collections" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"}`}
          >
            <Layers size={16} /> Collections
          </button>
        </div>
      </div>

      {/* =========================================
          TAB 1: PRODUCTS VIEW
      ========================================= */}
      {activeTab === "products" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Toolbar / Filters */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap lg:flex-nowrap items-center gap-3">
            <div className="relative flex-grow min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search name..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-4 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white transition-all" />
            </div>
            <input type="number" placeholder="ID (e.g. 30)" value={filterId} onChange={(e) => { setFilterId(e.target.value); setCurrentPage(1); }} className="w-full sm:w-28 px-4 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none bg-slate-50 focus:bg-white transition-all" />
            <input type="number" placeholder="Max Price $" value={filterPrice} onChange={(e) => { setFilterPrice(e.target.value); setCurrentPage(1); }} className="w-full sm:w-32 px-4 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none bg-slate-50 focus:bg-white transition-all" />
            <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="w-full sm:w-48 px-4 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer transition-all">
              <option value="">All Collections</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          {/* Products Data Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="px-6 py-4 w-16">ID</th>
                    <th className="px-6 py-4 w-16">Image</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4 w-32">Price</th>
                    <th className="px-6 py-4 w-32">Stock</th>
                    <th className="px-6 py-4 w-32">Status</th>
                    <th className="px-6 py-4 text-right w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading ? (
                    <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" /> Loading products...</td></tr>
                  ) : products.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400"><AlertCircle size={32} className="mx-auto mb-3 text-slate-300" /> No products found.</td></tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-500">#{product.id}</td>
                        <td className="px-6 py-4">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0].image.startsWith("http") ? product.images[0].image : `http://localhost:8000${product.images[0].image}`} alt={product.title} className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white shadow-sm" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300"><ImagePlus size={16} /></div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">{product.title}</td>
                        <td className="px-6 py-4 font-black text-slate-700">${product.unit_price}</td>
                        <td className="px-6 py-4 font-medium">{product.inventory}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${product.inventory > 10 ? "bg-emerald-50 text-emerald-700" : product.inventory > 0 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>
                            {product.inventory > 10 ? "In Stock" : product.inventory > 0 ? "Low Stock" : "Out of Stock"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => { setSelectedProduct(product); setIsEditModalOpen(true); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"><Edit size={16} /></button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-center gap-6 bg-slate-50/50">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-600 transition-all shadow-sm"><ChevronLeft size={18} /></button>
                <span className="text-sm font-bold tracking-wide text-slate-600">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-600 transition-all shadow-sm"><ChevronRight size={18} /></button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* =========================================
          TAB 2: COLLECTIONS VIEW
      ========================================= */}
      {activeTab === "collections" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Desktop Table View */}
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
                {collections.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-16 text-center text-slate-400"><FolderPlus size={32} className="mx-auto mb-3 text-slate-300" /> No collections created yet.</td></tr>
                ) : (
                  collections.map((col) => (
                    <tr key={col.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-500">#{col.id}</td>
                      <td className="px-6 py-4 font-black text-slate-800 text-base">{col.title}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-3 rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                          {col.products_count}
                        </span>
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

          {/* Mobile Card View (iPhone, Samsung) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {collections.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border border-slate-100 text-center shadow-sm text-slate-400">
                <FolderPlus size={32} className="mx-auto mb-3 text-slate-300" /> No collections yet.
              </div>
            ) : (
              collections.map((col) => (
                <div key={col.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                      <Layers size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800">{col.title}</h3>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">{col.products_count} Products Linked</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => handleOpenCollectionModal(col)} className="p-2 bg-slate-50 text-slate-500 hover:text-blue-600 rounded-lg transition-colors border border-slate-100"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteCollection(col.id, col.products_count)} className="p-2 bg-slate-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors border border-slate-100"><Trash2 size={16} /></button>
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
      
      {/* Products Modals */}
      <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} collections={collections} onSuccess={handleProductAdded} />
      <EditProductModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} product={selectedProduct} onUpdate={handleProductUpdated} />

      {/* Collection Add/Edit Modal (Inline for portability) */}
      <AnimatePresence>
        {isCollectionModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCollectionModalOpen(false)} className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <FolderPlus className="text-blue-600" size={20} />
                    {editingCollection ? "Edit Collection" : "New Collection"}
                  </h3>
                  <button onClick={() => setIsCollectionModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
                </div>
                
                <form onSubmit={handleSaveCollection} className="p-5 sm:p-6 flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Collection Title <span className="text-rose-500">*</span></label>
                    <input 
                      required autoFocus type="text" placeholder="e.g. Pet Toys" 
                      value={collectionTitle} onChange={(e) => setCollectionTitle(e.target.value)} 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 bg-slate-50 focus:bg-white" 
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={() => setIsCollectionModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer">Cancel</button>
                    <button type="submit" disabled={isSubmittingCollection || !collectionTitle.trim()} className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2">
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