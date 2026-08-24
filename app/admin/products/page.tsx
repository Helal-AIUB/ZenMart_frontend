"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { Edit, Trash2, Plus, Search, ChevronLeft, ChevronRight, AlertCircle, ImagePlus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// Import Modals (আপনার ফাইলের পাথ অনুযায়ী আপডেট করে নিতে পারেন)
import AddProductModal from "@/components/admin/AddProductModal";
import EditProductModal from "@/components/admin/EditProductModal";

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
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterId, setFilterId] = useState("");
  const [filterPrice, setFilterPrice] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await apiClient.get("/store/collections/");
        setCollections(res.data.results || res.data);
      } catch (error) {
        console.error("Failed to fetch collections", error);
      }
    };
    fetchCollections();
  }, []);

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
    const delayDebounceFn = setTimeout(() => fetchProducts(), 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterId, filterPrice, filterCategory, currentPage]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiClient.delete(`/store/products/${id}/`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error: any) {
      if (error.response?.status === 405) {
        toast.error("Cannot delete: Product is associated with an order item.");
      } else {
        toast.error("Failed to delete product");
      }
    }
  };

  // --- Callback Functions for Modals ---
  const handleProductAdded = (newProduct: Product) => {
    setProducts([newProduct, ...products]);
    setTotalItems((prev) => prev + 1);
    setIsAddModalOpen(false);
    
    // Auto-open Edit modal so user can upload images immediately
    setSelectedProduct(newProduct);
    setIsEditModalOpen(true);
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => p.id === updatedProduct.id ? updatedProduct : p));
  };

  return (
    <div className="space-y-6 pb-10">
      {/* --- Header Section --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage inventory, prices, and catalog ({totalItems} total)</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
        >
          <Plus size={18} /> <span>Add New</span>
        </button>
      </div>

      {/* --- Toolbar / Filters --- */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap lg:flex-nowrap items-center gap-3">
        <div className="relative flex-grow min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search name..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
        </div>
        <input type="number" placeholder="ID (e.g. 30)" value={filterId} onChange={(e) => { setFilterId(e.target.value); setCurrentPage(1); }} className="w-full sm:w-28 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
        <input type="number" placeholder="Max Price $" value={filterPrice} onChange={(e) => { setFilterPrice(e.target.value); setCurrentPage(1); }} className="w-full sm:w-32 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="w-full sm:w-48 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500/20 cursor-pointer">
          <option value="">All Categories</option>
          {collections.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {/* --- Data Table --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
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
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto mb-2" /> Loading...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <AlertCircle size={24} className="mx-auto mb-2 text-slate-300" /> No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-500">#{product.id}</td>
                    <td className="px-6 py-4">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0].image.startsWith("http") ? product.images[0].image : `http://localhost:8000${product.images[0].image}`} alt={product.title} className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-white" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                          <ImagePlus size={16} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 line-clamp-1">{product.title}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">${product.unit_price}</td>
                    <td className="px-6 py-4">{product.inventory}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${product.inventory > 10 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : product.inventory > 0 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
                        {product.inventory > 10 ? "In Stock" : product.inventory > 0 ? "Low Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelectedProduct(product); setIsEditModalOpen(true); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-center gap-6 bg-slate-50/30">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 text-slate-600 transition-all">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-semibold tracking-wide text-slate-600">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 text-slate-600 transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* --- External Modals --- */}
      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        collections={collections}
        onSuccess={handleProductAdded}
      />

      <EditProductModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        product={selectedProduct}
        onUpdate={handleProductUpdated}
      />
    </div>
  );
}