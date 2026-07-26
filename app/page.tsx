
'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { Collection } from '@/types/collection';
import { Product } from '@/types/product';
import Link from 'next/link';

import HeroCarousel from '@/components/home/HeroCarousel';
import TrustBadges from '@/components/home/TrustBadges';
import FlashSale from '@/components/home/FlashSale';
import TrendingProducts from '@/components/home/TrendingProducts';

export default function Home() {
  const { data: collections, isLoading: loadingCollections } = useQuery<Collection[]>({
    queryKey: ['collections'],
    queryFn: () => apiClient.get('/collections/').then((res) => res.data),
  });

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => apiClient.get('/products/').then((res) => res.data),
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
      
      <HeroCarousel />

      <div className="flex flex-col md:flex-row gap-8 mt-10">
        
        {/* Left Sidebar: Ultra-Modern Categories */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-card rounded-[2rem] border border-card-border shadow-sm sticky top-28 overflow-hidden">
            
            {/* Header with Global Primary Tint */}
            <div className="px-6 pt-6 pb-4 bg-primary-light/50 border-b border-card-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" /></svg>
                  </div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
                    Categories
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary-light px-2.5 py-0.5 rounded-full">
                  {collections?.length || 0} Total
                </span>
              </div>
            </div>

            {/* List Container */}
            <div className="p-3 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
              {loadingCollections ? (
                <div className="space-y-3 p-3">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-11 bg-card-border/40 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {collections?.map((collection) => (
                    <li key={collection.id}>
                      <Link 
                        href={`/collections/${collection.id}`}
                        className="group relative flex justify-between items-center py-3 px-4 rounded-2xl hover:bg-primary-light text-muted hover:text-foreground transition-all duration-300 border border-transparent hover:border-card-hoverBorder"
                      >
                        {/* Active Indicator Line on Left */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-primary rounded-r-full group-hover:h-6 transition-all duration-300"></div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold group-hover:translate-x-1 transition-transform duration-300">
                            {collection.title}
                          </span>
                        </div>

                        {/* Sleek Pill Badge */}
                        <span className="text-[10px] font-black bg-card-border/50 text-muted py-1 px-2.5 rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-xs">
                          {collection.products_count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </aside>

        {/* Right Content Area */}
        <section className="flex-1 overflow-hidden">
          
          <FlashSale products={products || []} isLoading={loadingProducts} />

          <TrendingProducts products={products || []} isLoading={loadingProducts} />

        </section>
      </div>

      <TrustBadges />

    </main>
  );
}