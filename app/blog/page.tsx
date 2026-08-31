"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { apiClient } from "@/services/apiClient";
import { Search, Calendar, Eye, ArrowRight, BookOpen, Loader2 } from "lucide-react";

const fetcher = (url: string) => apiClient.get(url).then(res => res.data.results || res.data);

export default function PublicBlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch only Published articles using query params (fast & optimized)
  const { data: articles = [], isLoading: loadingArticles } = useSWR('/store/articles/?status=Published', fetcher);
  const { data: categories = [], isLoading: loadingCategories } = useSWR('/store/article-categories/', fetcher);

  // Client-side filtering for Search and Category
  const filteredArticles = articles.filter((article: any) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? article.category_name === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-20">
      
      {/* 🟢 Premium Hero Section */}
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Abstract Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-80 h-80 rounded-full bg-emerald-400 blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-100 text-sm font-bold tracking-wider uppercase mb-6 border border-emerald-400/30">
            <BookOpen size={16} /> Petora BD Blog
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
            Expert Pet Care Tips, <br /> Guides & Stories
          </h1>
          <p className="text-lg text-emerald-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover everything you need to know about keeping your furry, feathered, or finned friends happy and healthy.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto shadow-2xl">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for guides, tips, or articles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-slate-800 bg-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all font-medium"
            />
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        
        {/* 🟢 Category Filter Pills */}
        {!loadingCategories && categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-slate-200 w-fit mx-auto">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === null ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              All Articles
            </button>
            {categories.map((cat: any) => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === cat.name ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* 🟢 Articles Grid */}
        {loadingArticles ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
            <p className="text-slate-500 font-medium">Loading amazing content...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <BookOpen size={64} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-2xl font-bold text-slate-700 mb-2">No articles found</h3>
            <p className="text-slate-500">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article: any) => (
              <Link href={`/blog/${article.slug}`} key={article.id} className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                
                {/* Image Container */}
                <div className="relative h-60 overflow-hidden bg-slate-100">
                  {article.image ? (
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                      <BookOpen size={48} />
                    </div>
                  )}
                  {/* Category Badge overlay */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-black uppercase tracking-wider rounded-lg shadow-sm">
                      {article.category_name || "Pet Care"}
                    </span>
                  </div>
                </div>

                {/* Content Container */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-800 leading-tight mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} /> {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Eye size={14} /> {article.views > 999 ? (article.views/1000).toFixed(1)+'k' : article.views}
                      </span>
                    </div>
                    <span className="text-emerald-600 bg-emerald-50 p-2 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>

              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}