"use client";

import useSWR from "swr";
import Link from "next/link";
import { apiClient } from "@/services/apiClient";
import { ArrowRight, BookOpen, Calendar, PawPrint } from "lucide-react";

const fetcher = (url: string) => apiClient.get(url).then(res => res.data.results || res.data);

export default function HomeBlogSection() {
  const { data: articles = [], isLoading } = useSWR('/store/articles/?status=Published', fetcher);
  
  const latestArticles = articles.slice(0, 3);

  if (isLoading) {
    return (
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-pulse">
            <div className="h-4 bg-slate-200 w-32 mx-auto rounded-full mb-4"></div>
            <div className="h-10 bg-slate-200 w-64 mx-auto rounded-lg"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-[420px] border border-slate-100 shadow-sm animate-pulse flex flex-col">
                <div className="h-56 bg-slate-200 rounded-t-3xl"></div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                  <div className="h-6 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-6 bg-slate-200 rounded w-2/3 mb-6"></div>
                  <div className="mt-auto flex justify-between">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-8 bg-slate-200 rounded-full w-8"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (latestArticles.length === 0) return null;

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 🟢 New Premium Section Header */}
        <div className="mb-12 w-full">
          <div className="flex items-center gap-3 w-full">
            <h2 className="text-3xl md:text-4xl font-extrabold text-green-700 tracking-tight whitespace-nowrap">
              Expert Tips for Happy Pets
            </h2>
            <PawPrint size={28} strokeWidth={2.5} className="text-green-500/60 shrink-0" />
            {/* Dashed Line */}
            {/* <div className="flex-1 border-b-[2.5px] border-dashed border-green-300/70 translate-y-1"></div> */}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-4">
            <p className="text-slate-500 text-base md:text-lg font-medium">
              Explore the latest pet care guides just for you
            </p>
            <Link 
              href="/blog" 
              className="group flex items-center gap-1.5 text-sm font-bold text-green-700 bg-green-50 px-4 py-2 rounded-full hover:bg-green-600 hover:text-white transition-all duration-300 w-fit shrink-0"
            >
              View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 🟢 Premium Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestArticles.map((article: any) => (
            <Link 
              href={`/blog/${article.slug}`} 
              key={article.id} 
              className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
            >
              
              {/* Image Container with Smooth Zoom */}
              <div className="relative h-56 overflow-hidden bg-slate-100">
                {article.image ? (
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <BookOpen size={48} />
                  </div>
                )}
                {/* Category Badge overlay */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-emerald-700 text-xs font-black uppercase tracking-wider rounded-lg shadow-sm">
                    {article.category_name || "Pet Care"}
                  </span>
                </div>
              </div>

              {/* Content Container */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-slate-800 leading-snug mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2 flex-1">
                  {article.excerpt}
                </p>
                
                {/* Footer of Card */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <Calendar size={14} /> 
                    {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-emerald-600 bg-emerald-50 p-2 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-[-45deg]">
                    <ArrowRight size={16} />
                  </span>
                </div>
              </div>

            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}