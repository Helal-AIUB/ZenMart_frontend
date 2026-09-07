'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { Product } from '@/types/product';

import HeroCarousel from '@/components/home/HeroCarousel';
import TrustBadges from '@/components/home/TrustBadges';
import FlashSale from '@/components/home/FlashSale';
import NewArrivals from '@/components/home/NewArrivals';
import BlogSection from '@/components/home/BlogSection';

export default function Home() {
  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => apiClient.get('store/products/').then((res) => res.data),
    // 🟢 Magic of SWR (Stale-While-Revalidate)
    staleTime: 10 * 60 * 1000,       // 10 minutes instant cache (No loading spinner)
    refetchInterval: 10 * 60 * 1000, // Auto-update in the background every 10 minutes
  });

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 min-h-screen font-sans">
      
      {/* Hero Section */}
      <HeroCarousel />

      {/* Main Content Area */}
      <section className="w-full mt-6">
        
        {/* Flash Sale Dynamic Section */}
        <FlashSale products={products || []} isLoading={loadingProducts} />

        {/* New Arrivals Section */}
        <NewArrivals />

      </section>

      {/* Trust Badges Area */}
      <BlogSection />
      <TrustBadges />

    </main>
  );
}