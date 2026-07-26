// frontend/src/components/home/TrendingProducts.tsx
'use client';
import { useRef } from 'react';
import Link from 'next/link';
import ProductSkeleton from '../ui/ProductSkeleton';

export default function TrendingProducts({ products, isLoading }: { products: any[], isLoading: boolean }) {
  const trendingScrollRef = useRef<HTMLDivElement>(null);

  const scrollTrending = (direction: 'left' | 'right') => {
    if (trendingScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      trendingScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-16">
      {/* Section Header */}
      <div className="mb-8 flex justify-between items-end pb-4 border-b border-card-border">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Trending Now</h2>
          <div className="h-1 w-12 bg-primary mt-2 rounded-full"></div>
        </div>
        <Link href="/products" className="text-primary text-sm font-bold hover:opacity-85 transition-colors flex items-center gap-2 group-hover:translate-x-1 duration-300">
          Explore All <span className="text-lg leading-none">&rarr;</span>
        </Link>
      </div>

      {/* Trending Slider with Arrows */}
      <div className="relative group">
        <button 
          onClick={() => scrollTrending('left')} 
          className="absolute left-[-15px] top-1/2 -translate-y-1/2 w-12 h-12 bg-card/90 backdrop-blur-md border border-card-border rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 shadow-xl"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <div ref={trendingScrollRef} className="flex overflow-x-auto gap-6 pb-8 snap-x custom-scrollbar scroll-smooth hide-scroll-bar px-1">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <ProductSkeleton key={i} />)
          ) : (
            products?.map((product) => {
              const currentPrice = Math.round(Number(product.unit_price));
              const originalPrice = Math.round(Number(product.unit_price) * 1.35);

              return (
                <div key={product.id} className="min-w-[220px] max-w-[240px]">
                  <div className="group relative bg-card rounded-[1.5rem] border border-card-border hover:border-card-hoverBorder shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(20,184,166,0.15)] transition-all duration-500 overflow-hidden flex flex-col h-full">
                    
                    {/* Top -27% Discount Badge & Wishlist */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
                      <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider shadow-md shadow-rose-500/20">
                        -27%
                      </span>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('Wishlist clicked');
                        }}
                        className="w-7 h-7 rounded-full bg-card/80 backdrop-blur-md border border-card-border flex items-center justify-center text-muted hover:text-rose-500 hover:scale-110 transition-all shadow-xs"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>

                    {/* Product Image Area with Link */}
                    <Link href={`/products/${product.id}`} className="w-full h-44 bg-[#f8f9fa] flex items-center justify-center text-5xl relative overflow-hidden transition-all duration-500 group-hover:bg-primary-light block">
                      <span className="transform transition-transform duration-700 group-hover:scale-110 group-hover:-translate-y-2">📦</span>
                    </Link>

                    {/* Product Info */}
                    <div className="p-4 flex flex-col flex-grow bg-card z-0">
                      <Link href={`/products/${product.id}`} className="block mb-1.5">
                        <h2 className="text-xs font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {product.title}
                        </h2>
                      </Link>

                      {/* Rating & Sold Info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-yellow-400 text-[10px] gap-0.5">
                          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                        </div>
                        <span className="text-[10px] font-medium text-muted">1,420 sold</span>
                      </div>

                      {/* Price & Add to Cart Button */}
                      <div className="mt-auto flex flex-col gap-2.5 pt-2 border-t border-card-border/60">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-primary tracking-tight">
                            ${currentPrice}
                          </span>
                          <span className="text-xs text-muted line-through font-medium">
                            ${originalPrice}
                          </span>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            console.log(`Added ${product.title} to cart!`);
                          }}
                          className="w-full bg-primary text-white py-2 rounded-xl font-bold text-xs shadow-md hover:bg-primary-hover transition-transform hover:scale-[1.02] active:scale-95 text-center"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button 
          onClick={() => scrollTrending('right')} 
          className="absolute right-[-15px] top-1/2 -translate-y-1/2 w-12 h-12 bg-card/90 backdrop-blur-md border border-card-border rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 shadow-xl"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}