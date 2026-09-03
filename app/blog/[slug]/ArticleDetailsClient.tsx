"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { apiClient } from "@/services/apiClient";
import { Calendar, Eye, ArrowLeft, Loader2, Share2, Tag } from "lucide-react";

const fetcher = (url: string) => apiClient.get(url).then(res => res.data.results || res.data);

export default function ArticleDetailsClient({ slug }: { slug: string }) {
  const [viewAdded, setViewAdded] = useState(false);

  // Fetch article by slug
  const { data: articles, isLoading } = useSWR(`/store/articles/?slug=${slug}`, fetcher);
  const article = articles?.[0]; // Since filtering returns an array

  // Automatically Increment View Count
  useEffect(() => {
    if (article && !viewAdded) {
      apiClient.post(`/store/articles/${article.id}/add_view/`)
        .then(() => setViewAdded(true))
        .catch(console.error);
    }
  }, [article, viewAdded]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
        <p className="text-slate-500 font-medium">Loading article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
        <h1 className="text-4xl font-black text-slate-800 mb-4">Article Not Found</h1>
        <p className="text-slate-500 mb-8">The guide you are looking for does not exist or has been removed.</p>
        <Link href="/blog" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-xl font-bold flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      
      {/* 🟢 Top Header Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft size={16} /> Back to all articles
        </Link>
      </div>

      {/* 🟢 Article Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider rounded-lg border border-emerald-100 flex items-center gap-1.5">
            <Tag size={12} /> {article.category_name || "Pet Care"}
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
          {article.title}
        </h1>
        
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            {new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-slate-400" />
            {article.views + (viewAdded ? 1 : 0)} Reads
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></div>
          <button className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors">
            <Share2 size={16} /> Share
          </button>
        </div>
      </header>

      {/* 🟢 Cover Image (Optimized with next/image) */}
      {article.image && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          {/* Added 'relative' class to make fill work */}
          <div className="w-full aspect-[21/9] sm:aspect-[2/1] rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-slate-100 relative">
            <Image 
              src={article.image} 
              alt={article.title} 
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
              className="object-cover" 
              priority
            />
          </div>
        </div>
      )}

      {/* 🟢 Rich Text Content Body */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <article 
          className="prose prose-slate prose-emerald lg:prose-lg max-w-none 
          prose-headings:font-bold prose-headings:text-slate-800 prose-headings:tracking-tight
          prose-a:text-emerald-600 hover:prose-a:text-emerald-700 prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        {/* Footer of the article */}
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Written for Petora BD
          </p>
          <button className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors flex items-center gap-2">
            <Share2 size={16} /> Share this article
          </button>
        </div>
      </main>

    </div>
  );
}