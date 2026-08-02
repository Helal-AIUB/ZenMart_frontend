'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import Link from 'next/link';

export default function ProductsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['all_products_page'],
    queryFn: async () => {
      const res = await apiClient.get('/products/');
      return res.data;
    },
  });

  const products = Array.isArray(data) ? data : data?.results || [];

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-28 min-h-screen font-sans">
      <h1 className="text-3xl font-black text-foreground mb-8">All Products</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {products.map((product: any) => {
          const currentPrice = Math.round(Number(product.unit_price));
          return (
            <Link 
              key={product.id} 
              href={`/products/${product.id}`} 
              className="bg-card rounded-2xl border border-card-border p-4 shadow-2xs hover:shadow-xl transition-all block group"
            >
              <div className="w-full h-36 bg-gray-50 rounded-xl flex items-center justify-center text-3xl mb-3 group-hover:scale-105 transition-transform">
                📦
              </div>
              <h3 className="text-xs font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {product.title}
              </h3>
              <p className="text-primary font-black text-sm">${currentPrice}</p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}