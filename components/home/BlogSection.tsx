"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/services/apiClient";
import { ArrowRight, BookOpen, Calendar, PawPrint } from "lucide-react";

export default function HomeBlogSection() {
  // 🟢 Optimized: Switched from useSWR to useQuery for consistency and 0-second caching
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["home_articles"],
    queryFn: async () => {
      const res = await apiClient.get('/store/articles/?status=Published');
      return res.data.results || res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
  
  const latestArticles = articles.slice(0, 3);

  if (isLoading) {
    return (
      <section className="py-12 md:py-20 bg-slate-50/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12 animate-pulse">
            <div className="h-3 md:h-4 bg-slate-200 w-24 md:w-32 mx-auto rounded-full mb-3 md:mb-4"></div>
            <div className="h-8 md:h-10 bg-slate-200 w-48 md:w-64 mx-auto rounded-lg"></div>
          </div>
          {/* 🟢 Responsive Skeleton Grid: 2 columns on mobile, 3 on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl md:rounded-3xl h-[220px] md:h-[420px] border border-slate-100 shadow-sm animate-pulse flex flex-col">
                <div className="h-28 sm:h-40 md:h-56 bg-slate-200 rounded-t-2xl md:rounded-t-3xl"></div>
                <div className="p-3 sm:p-6 flex-1 flex flex-col">
                  <div className="h-3 md:h-4 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-3 md:h-4 bg-slate-200 rounded w-2/3 mb-2 md:mb-6"></div>
                  <div className="hidden md:block h-3 bg-slate-200 rounded w-full mb-1"></div>
                  <div className="hidden md:block h-3 bg-slate-200 rounded w-4/5 mb-4"></div>
                  <div className="mt-auto flex justify-between">
                    <div className="h-3 md:h-4 bg-slate-200 rounded w-1/2 md:w-1/4"></div>
                    <div className="hidden md:block h-8 bg-slate-200 rounded-full w-8"></div>
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
    <section className="py-12 md:py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="mb-8 md:mb-12 w-full flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 md:gap-3 w-full">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-green-700 tracking-tight whitespace-nowrap">
                Expert Tips
              </h2>
              <PawPrint className="w-5 h-5 md:w-7 md:h-7 text-green-500/60 shrink-0" strokeWidth={2.5} />
            </div>
            <p className="text-slate-500 text-[11px] sm:text-base md:text-lg font-medium mt-1 md:mt-2">
              Explore the latest pet care guides just for you
            </p>
          </div>
          
          <Link 
            href="/blog" 
            className="group flex items-center gap-1.5 text-xs sm:text-sm font-bold text-green-700 bg-green-50 px-3 py-1.5 md:px-4 md:py-2 rounded-full hover:bg-green-600 hover:text-white transition-all duration-300 w-fit shrink-0"
          >
            View All <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 🟢 Responsive Grid: 2 columns on mobile, 3 on large screens */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
          {latestArticles.map((article: any) => (
            <Link 
              href={`/blog/${article.slug}`} 
              key={article.id} 
              className="group flex flex-col bg-white rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-500"
            >
              
              <div className="relative h-28 sm:h-40 md:h-56 overflow-hidden bg-slate-100">
                {article.image ? (
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <BookOpen className="w-8 h-8 md:w-12 md:h-12" />
                  </div>
                )}
                <div className="absolute top-2 left-2 md:top-4 md:left-4">
                  <span className="px-2 py-1 md:px-3 md:py-1.5 bg-white/95 backdrop-blur-sm text-emerald-700 text-[8px] md:text-xs font-black uppercase tracking-wider rounded-md md:rounded-lg shadow-sm">
                    {article.category_name || "Pet Care"}
                  </span>
                </div>
              </div>

              <div className="p-3 sm:p-5 md:p-6 flex flex-col flex-1">
                <h3 className="text-[11px] sm:text-base md:text-xl font-bold text-slate-800 leading-tight md:leading-snug mb-1 md:mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                
                {/* 🟢 Excerpt hidden on mobile to save space, visible on tablet/desktop */}
                <p className="hidden sm:block text-slate-500 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 line-clamp-2 flex-1">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-slate-100 mt-auto">
                  <span className="flex items-center gap-1 md:gap-1.5 text-[9px] sm:text-xs font-bold text-slate-400">
                    <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" /> 
                    {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="hidden md:flex text-emerald-600 bg-emerald-50 p-1.5 md:p-2 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-[-45deg]">
                    <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
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