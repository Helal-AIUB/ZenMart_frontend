"use client";

import { useState } from "react";
import useSWR from "swr";
import { apiClient } from "@/services/apiClient";
import { Search, Plus, LayoutGrid, List as ListIcon, Edit3, Trash2, Eye, FileText, BarChart3, Clock, CheckCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import ArticleModal from "@/components/admin/ArticleModal";

const fetcher = (url: string) => apiClient.get(url).then(res => res.data.results || res.data);

export default function PetContentDashboard() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  // 🟢 Ultra-fast Data Fetching with SWR
  const { data: articles = [], mutate, isLoading } = useSWR('/store/articles/', fetcher);
  const { data: categories = [] } = useSWR('/store/article-categories/', fetcher);

  const filteredArticles = articles.filter((article: any) => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (article.category_name && article.category_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    
    mutate(articles.filter((a: any) => a.id !== id), false); // Optimistic Update
    try {
      await apiClient.delete(`/store/articles/${id}/`);
      toast.success("Article deleted");
      mutate();
    } catch (error) {
      toast.error("Failed to delete article");
      mutate();
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'Published': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold"><CheckCircle size={12} /> Published</span>;
      case 'Draft': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"><FileText size={12} /> Draft</span>;
      case 'Scheduled': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold"><Clock size={12} /> Scheduled</span>;
      default: return null;
    }
  };

  const totalViews = articles.reduce((sum: number, art: any) => sum + (art.views || 0), 0);
  const publishedCount = articles.filter((a: any) => a.status === 'Published').length;

  return (
    <div className="space-y-6 pb-10 font-sans px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto mt-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Pet Content</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage articles, guides, and educational content for your customers.</p>
        </div>
        <button 
          onClick={() => { setSelectedArticle(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus size={18} /> Create Article
        </button>
      </div>

      {/* Top Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><FileText size={24} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Content</p><p className="text-2xl font-black text-slate-800">{articles.length}</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><CheckCircle size={24} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Published</p><p className="text-2xl font-black text-slate-800">{publishedCount}</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0"><Edit3 size={24} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Drafts</p><p className="text-2xl font-black text-slate-800">{articles.length - publishedCount}</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><BarChart3 size={24} /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Views</p><p className="text-2xl font-black text-slate-800">{totalViews > 999 ? (totalViews/1000).toFixed(1)+'k' : totalViews}</p></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search articles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none bg-slate-50 focus:bg-white transition-all" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto p-1 bg-slate-100 rounded-xl">
          <button onClick={() => setViewMode('grid')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><LayoutGrid size={16} /> <span className="hidden sm:inline">Grid</span></button>
          <button onClick={() => setViewMode('list')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><ListIcon size={16} /> <span className="hidden sm:inline">List</span></button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-20 text-center text-slate-400">
          <FileText size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-bold text-slate-600">No articles found.</p>
          <p className="text-sm mt-1">Create your first pet care guide to educate customers.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArticles.map((article: any) => (
            <div key={article.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col">
              <div className="relative h-48 overflow-hidden bg-slate-100">
                {article.image ? (
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={48} /></div>
                )}
                <div className="absolute top-3 right-3"><StatusBadge status={article.status} /></div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-wider">{article.category_name || 'Uncategorized'}</div>
                <h3 className="text-base font-bold text-slate-800 leading-tight mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{article.excerpt}</p>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1"><Eye size={14} /> {article.views}</span>
                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setSelectedArticle(article); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(article.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="px-6 py-4 w-16">Image</th>
                  <th className="px-6 py-4">Title & Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Views</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredArticles.map((article: any) => (
                  <tr key={article.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden">
                        {article.image ? <img src={article.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="m-auto mt-3 text-slate-300" size={24}/>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 line-clamp-1">{article.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(article.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">{article.category_name || '-'}</td>
                    <td className="px-6 py-4"><StatusBadge status={article.status} /></td>
                    <td className="px-6 py-4 font-medium text-slate-600">{article.views}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelectedArticle(article); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"><Edit3 size={18} /></button>
                        <button onClick={() => handleDelete(article.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reusable Modal */}
      <ArticleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        article={selectedArticle} 
        categories={categories}
        onSuccess={() => mutate()} // Refresh data after save
      />
    </div>
  );
}