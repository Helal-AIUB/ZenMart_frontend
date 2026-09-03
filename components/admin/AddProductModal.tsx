"use client";

import { useState, useRef, useEffect } from "react";
import { apiClient } from "@/services/apiClient";
import { X, Loader2, Save, ImagePlus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

interface Collection {
  id: number;
  title: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  onSuccess: (newProduct: any) => void;
}

export default function AddProductModal({ isOpen, onClose, collections, onSuccess }: AddProductModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({
    title: "",
    slug: "",
    description: "",
    unit_price: "",
    inventory: "",
    collection: "",
  });

  // --- Expandable Image Upload States ---
  const [isImageSectionOpen, setIsImageSectionOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, [previews]);

  if (!isOpen) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setNewData({ ...newData, title, slug });
  };

  // --- Local File Selection Logic ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 2MB Validation
    const validFiles = files.filter(f => f.size <= 2 * 1024 * 1024);
    if (validFiles.length < files.length) {
       toast.error("Some files were larger than 2MB and were skipped.");
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    

    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
       URL.revokeObjectURL(prev[index]);
       return prev.filter((_, i) => i !== index);
    });
  };

  // --- Final Submit Logic (Product + Images) ---
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const payload = {
        title: newData.title,
        slug: newData.slug,
        description: newData.description,
        unit_price: parseFloat(newData.unit_price),
        inventory: parseInt(newData.inventory),
        collection: parseInt(newData.collection),
        collection_id: parseInt(newData.collection), 
      };

      const res = await apiClient.post(`/store/products/`, payload);
      const newProduct = res.data;

      const uploadedImages = [];
      if (selectedFiles.length > 0) {
         for (const file of selectedFiles) {
            const formData = new FormData();
            formData.append("image", file);
            try {
               const imgRes = await apiClient.post(`/store/products/${newProduct.id}/images/`, formData, {
                  headers: { "Content-Type": "multipart/form-data" }
               });
               uploadedImages.push(imgRes.data);
            } catch (imgErr) {
               console.error("Failed to upload an image:", imgErr);
               toast.error(`Failed to upload ${file.name}`);
            }
         }
      }

      newProduct.images = uploadedImages;

      toast.success("Product and images saved successfully!");
      onSuccess(newProduct);
      
      setNewData({ title: "", slug: "", description: "", unit_price: "", inventory: "", collection: "" });
      setSelectedFiles([]);
      setPreviews([]);
      setIsImageSectionOpen(false);

    } catch (error: any) {
      console.error("Add error:", error);
      if (error.response?.status === 500) {
         toast.error("Server Error (500). Please check your Django terminal for details.");
      } else {
         const errorMsg = error.response?.data?.slug?.[0] || error.response?.data?.detail || "Failed to create product.";
         toast.error(errorMsg);
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-all overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Add New Product</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="addForm" onSubmit={handleAddSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1">Product ID</label>
                 <input type="text" value="Auto-generated" readOnly className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 outline-none cursor-not-allowed italic" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category / Collection <span className="text-rose-500">*</span></label>
                <select required value={newData.collection} onChange={(e) => setNewData({ ...newData, collection: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white">
                  <option value="" disabled>Select a collection</option>
                  {collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Product Title <span className="text-rose-500">*</span></label>
                  <input type="text" required placeholder="e.g. Premium Dog Food" value={newData.title} onChange={handleTitleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Auto-generated Slug</label>
                  <input type="text" required readOnly value={newData.slug} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 focus:outline-none" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Unit Price ($) <span className="text-rose-500">*</span></label>
                <input type="number" step="0.01" required placeholder="0.00" value={newData.unit_price} onChange={(e) => setNewData({ ...newData, unit_price: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Initial Stock <span className="text-rose-500">*</span></label>
                <input type="number" required placeholder="10" value={newData.inventory} onChange={(e) => setNewData({ ...newData, inventory: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <textarea rows={3} placeholder="Describe the product..." value={newData.description} onChange={(e) => setNewData({ ...newData, description: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none custom-scrollbar"></textarea>
            </div>

            {/* --- Premium Expandable Image Section --- */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 mt-4 transition-all duration-300">
              <div 
                 onClick={() => setIsImageSectionOpen(!isImageSectionOpen)}
                 className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                      <ImagePlus size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Add Product Images</h3>
                      <p className="text-xs text-slate-500">Upload multiple photos (Max 2MB each)</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    {selectedFiles.length > 0 && (
                      <span className="text-xs font-semibold bg-emerald-600 text-white px-2.5 py-1 rounded-full shadow-sm">
                         {selectedFiles.length} Selected
                      </span>
                    )}
                    {isImageSectionOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                 </div>
              </div>

              {isImageSectionOpen && (
                 <div className="p-5 border-t border-slate-200 bg-white">
                    <input 
                      type="file" multiple accept="image/*" className="hidden" 
                      ref={fileInputRef} onChange={handleFileSelect} 
                    />
                    
                    {previews.length > 0 ? (
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-4">
                        {previews.map((preview, index) => (
                          <div key={index} className="relative group aspect-square rounded-xl border border-slate-200 overflow-hidden">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                type="button" onClick={() => removeFile(index)} 
                                className="bg-white p-1.5 rounded-full text-rose-600 hover:bg-rose-50 hover:scale-110 transition-all shadow-sm"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {/* Add More Images Button */}
                        <button 
                          type="button" onClick={() => fileInputRef.current?.click()}
                          className="aspect-square flex flex-col items-center justify-center gap-1 border-2 border-dashed border-emerald-200 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                        >
                          <ImagePlus size={20} />
                          <span className="text-xs font-medium">Add More</span>
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                      >
                        <ImagePlus size={32} className="mx-auto mb-3 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        <p className="text-sm font-medium text-slate-700 mb-1">Click to browse or drag & drop</p>
                        <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 2MB</p>
                      </div>
                    )}
                 </div>
              )}
            </div>

          </form>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button form="addForm" type="submit" disabled={isAdding} className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2">
            {isAdding ? <><Loader2 size={16} className="animate-spin" /> Saving all data...</> : <><Save size={16} /> Save Product & Images</>}
          </button>
        </div>
      </div>
    </div>
  );
}