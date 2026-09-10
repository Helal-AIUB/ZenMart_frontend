"use client";

import { useState, useRef, useEffect } from "react";
import { apiClient } from "@/services/apiClient";
import { X, ImagePlus, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

// ... (Types & Props remain identical)
interface Product { id: number; title: string; description?: string; unit_price: number; inventory: number; collection?: number; images?: { id: number; image: string }[]; }
interface EditProductModalProps { isOpen: boolean; onClose: () => void; product: Product | null; onUpdate: (updatedProduct: Product) => void; }

export default function EditProductModal({ isOpen, onClose, product, onUpdate }: EditProductModalProps) {
  const [editData, setEditData] = useState<Product | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) setEditData({ ...product });
  }, [product]);

  if (!isOpen || !editData) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await apiClient.patch(`/store/products/${editData.id}/`, {
        title: editData.title, description: editData.description, unit_price: editData.unit_price, inventory: editData.inventory,
      });
      const updatedProduct = { ...res.data, images: editData.images };
      onUpdate(updatedProduct);
      toast.success("Product updated instantly!");
      onClose();
    } catch (error) {
      toast.error("Failed to update product");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large! Maximum size allowed is 2MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    try {
      setUploadProgress(0);
      const res = await apiClient.post(`/store/products/${editData.id}/images/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          if (total) setUploadProgress(Math.round((loaded / total) * 100));
        },
      });
      const updatedProduct = { ...editData, images: [...(editData.images || []), res.data] };
      setEditData(updatedProduct);
      onUpdate(updatedProduct);
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.image?.[0] || "Failed to upload image");
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImageDelete = async (imageId: number) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await apiClient.delete(`/store/products/${editData.id}/images/${imageId}/`);
      const updatedProduct = { ...editData, images: editData.images?.filter((img) => img.id !== imageId) };
      setEditData(updatedProduct);
      onUpdate(updatedProduct);
      toast.success("Image deleted");
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm transition-all overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-800">Edit Product: #{editData.id}</h2>
          <button onClick={onClose} className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors">
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="editForm" onSubmit={handleUpdate} className="space-y-4 mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
               <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Product ID</label>
                  <input type="text" value={`#${editData.id}`} readOnly className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl bg-slate-50 text-slate-500 outline-none cursor-not-allowed text-xs sm:text-sm" />
               </div>
               <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Product Title</label>
                  <input type="text" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm" required />
               </div>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Description</label>
              <textarea rows={3} value={editData.description || ""} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none text-xs sm:text-sm"></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Unit Price ($)</label>
                <input type="number" step="0.01" value={editData.unit_price} onChange={(e) => setEditData({ ...editData, unit_price: parseFloat(e.target.value) || 0 })} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm" required />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Inventory</label>
                <input type="number" value={editData.inventory} onChange={(e) => setEditData({ ...editData, inventory: parseInt(e.target.value) || 0 })} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm" required />
              </div>
            </div>
          </form>

          {/* Image Upload Section */}
          <div className="border-t border-slate-100 pt-5 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">Product Images</h3>
              <div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadProgress !== null} className="w-full sm:w-auto justify-center text-[10px] sm:text-xs font-medium bg-emerald-50 text-emerald-600 px-3 py-1.5 sm:py-2 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center gap-1.5">
                  {uploadProgress !== null ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} className="sm:w-[16px] sm:h-[16px]"/>} Upload Photo
                </button>
              </div>
            </div>

            {uploadProgress !== null && (
              <div className="mb-4 bg-slate-100 rounded-full h-1.5 sm:h-2 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 sm:h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}

            {editData.images && editData.images.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
                {editData.images.map((img) => (
                  <div key={img.id} className="relative group aspect-square rounded-lg sm:rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                    <img src={img.image.startsWith('http') ? img.image : `${process.env.NEXT_PUBLIC_API_URL || 'https://zenmart-backend.onrender.com'}${img.image}`} alt="Variant" className="w-full h-full object-cover bg-white" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => handleImageDelete(img.id)} className="bg-white p-1.5 sm:p-2 rounded-full text-rose-600 hover:bg-rose-50 hover:scale-110 transition-all shadow-sm">
                        <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <ImagePlus size={24} className="mx-auto mb-2 text-slate-300 sm:w-[32px] sm:h-[32px]" />
                <p className="text-[10px] sm:text-xs text-slate-500">No images uploaded yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
          <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg sm:rounded-xl transition-colors">Done</button>
          <button type="submit" form="editForm" disabled={isUpdating} className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg sm:rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
            {isUpdating ? <><Loader2 size={14} className="animate-spin sm:w-4 sm:h-4" /> Saving...</> : 'Save Details'}
          </button>
        </div>
      </div>
    </div>
  );
}