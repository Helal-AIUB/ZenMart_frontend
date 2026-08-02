'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { Product } from '@/types/product';

import HeroCarousel from '@/components/home/HeroCarousel';
import TrustBadges from '@/components/home/TrustBadges';
import FlashSale from '@/components/home/FlashSale';
import TrendingProducts from '@/components/home/TrendingProducts';

export default function Home() {
  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => apiClient.get('/products/').then((res) => res.data),
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
      
      {/* Hero Section */}
      <HeroCarousel />

      {/* Main Content Area (Full Width without Sidebar) */}
      <section className="w-full mt-6">
        
        {/* Flash Sale Dynamic Section */}
        <FlashSale products={products || []} isLoading={loadingProducts} />

        {/* Trending Products Section */}
        <TrendingProducts products={products || []} isLoading={loadingProducts} />

      </section>

      {/* Trust Badges Footer Area */}
      <TrustBadges />

    </main>
  );
}