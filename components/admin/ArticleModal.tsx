"use client";

import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/services/apiClient";
import { X, Loader2, UploadCloud, Search } from "lucide-react";
import toast from "react-hot-toast";
import RichTextEditor from "./RichTextEditor"; // 🟢 Import our custom TipTap Editor

interface Category {
  id: number;
  name: string;
}

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: any | null;
  categories: Category[];
  onSuccess: () => void;
}

export default function ArticleModal({ isOpen, onClose, article, categories, onSuccess }: ArticleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    status: "Draft",
    meta_title: "",
    meta_description: "",
    image: null as File | null,
  });

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || "",
        excerpt: article.excerpt || "",
        content: article.content || "",
        category: article.category?.toString() || "",
        status: article.status || "Draft",
        meta_title: article.meta_title || "",
        meta_description: article.meta_description || "",
        image: null,
      });
      setImagePreview(article.image || null);
    } else {
      setFormData({ title: "", excerpt: "", content: "", category: "", status: "Draft", meta_title: "", meta_description: "", image: null });
      setImagePreview(null);
    }
  }, [article, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("excerpt", formData.excerpt);
    submitData.append("content", formData.content);
    submitData.append("status", formData.status);
    submitData.append("meta_title", formData.meta_title);
    submitData.append("meta_description", formData.meta_description);
    if (formData.category) submitData.append("category", formData.category);
    if (formData.image) submitData.append("image", formData.image);

    try {
      if (article) {
        await apiClient.patch(`/store/articles/${article.id}/`, submitData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Article updated successfully!");
      } else {
        await apiClient.post(`/store/articles/`, submitData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Article created successfully!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl my-auto flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl shrink-0">
          <h2 className="text-lg font-bold text-slate-800">{article ? 'Edit Article' : 'Create New Article'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          <form id="articleForm" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cover Image</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-emerald-300 transition-all overflow-hidden group relative"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">Change Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <UploadCloud size={32} className="mx-auto text-slate-300 mb-2 group-hover:text-emerald-500 transition-colors" />
                      <p className="text-xs font-bold text-slate-500">Click to upload</p>
                      <p className="text-[10px] text-slate-400 mt-1">JPEG, PNG, WEBP</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Article Title</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. 5 Tips for Dog Training" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-semibold text-slate-800" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                    <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white cursor-pointer">
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white cursor-pointer">
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Scheduled">Scheduled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Short Excerpt (For Cards)</label>
                  <textarea required value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} placeholder="A brief summary of the article..." rows={2} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none custom-scrollbar" />
                </div>
              </div>
            </div>

            {/* 🟢 Our New TipTap Rich Text Editor */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Content</label>
              <RichTextEditor 
                content={formData.content} 
                onChange={(content) => setFormData({ ...formData, content })} 
              />
            </div>

            {/* Premium SEO Optimization Section */}
            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Search size={16} className="text-blue-500" />
                <h3 className="text-sm font-bold text-slate-800">Search Engine Optimization (SEO)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Meta Title</label>
                  <input type="text" value={formData.meta_title} onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} placeholder="Leave blank to use article title" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Meta Description</label>
                  <textarea value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} placeholder="Write a compelling snippet for Google..." rows={1} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none custom-scrollbar bg-white" />
                </div>
              </div>

              {/* Live Preview Google Snippet */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Google Preview</p>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 flex items-center gap-1">petorabd.com <span className="text-[10px]">› blog</span></p>
                  <h4 className="text-[15px] font-medium text-[#1a0dab] line-clamp-1">{formData.meta_title || formData.title || "Your Article Title Will Appear Here"}</h4>
                  <p className="text-xs text-[#4d5156] line-clamp-2">{formData.meta_description || formData.excerpt || "Provide a meta description to see how it looks on search engines. This helps increase your click-through rate."}</p>
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3 rounded-b-2xl shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" form="articleForm" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-xl shadow-sm transition-all flex items-center gap-2 active:scale-95">
            {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Article'}
          </button>
        </div>

      </div>
    </div>
  );
}