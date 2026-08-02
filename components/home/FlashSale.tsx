'use client';
import { useState, useEffect, useRef } from 'react';
import ProductSkeleton from '../ui/ProductSkeleton';
import Link from 'next/link';

export default function FlashSale({ products, isLoading }: { products: any, isLoading: boolean }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const validProducts = Array.isArray(products) 
    ? products 
    : products?.results || products?.data || [];

  return (
    <section className="my-12 bg-card rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden relative border border-card-border group font-sans">
      {/* Subtle Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-28 bg-primary/5 blur-[90px] pointer-events-none"></div>

      {/* Header */}
      <div className="px-8 pt-8 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between text-foreground relative z-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl text-primary shadow-xs">
            <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" /></svg>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              Flash Sale
            </h2>
            <p className="text-muted text-xs sm:text-sm font-normal tracking-wide mt-0.5">
              Limited time offers on handpicked premium choices
            </p>
          </div>
        </div>
        
        {/* Sleek Timer & View All Link */}
        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-3 bg-card-border/30 border border-card-border px-4 py-2 rounded-2xl">
            <span className="font-bold text-[11px] text-muted uppercase tracking-widest">Ends in</span>
            <div className="flex items-center gap-1.5 text-foreground font-black text-sm">
              <div className="bg-card px-2 py-1 rounded-md min-w-[32px] text-center border border-card-border shadow-2xs">{String(timeLeft.hours).padStart(2, '0')}</div>
              <span className="text-primary font-bold">:</span>
              <div className="bg-card px-2 py-1 rounded-md min-w-[32px] text-center border border-card-border shadow-2xs">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <span className="text-primary font-bold">:</span>
              <div className="bg-primary text-white px-2 py-1 rounded-md min-w-[32px] text-center shadow-xs">{String(timeLeft.seconds).padStart(2, '0')}</div>
            </div>
          </div>

          <Link href="/products" className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-all group/link">
            <span>View All Deals</span>
            <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>

      {/* Products Area with Navigation Arrows */}
      <div className="px-6 sm:px-8 pb-8 pt-2 relative z-10">
        
        {/* Left Arrow */}
        <button onClick={() => scroll('left')} className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-card/90 backdrop-blur-md border border-card-border rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <div ref={scrollRef} className="flex overflow-x-auto gap-5 pb-4 snap-x custom-scrollbar scroll-smooth hide-scroll-bar">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <ProductSkeleton key={i} />)
          ) : (
            validProducts?.slice(0, 10).map((product: any) => {
              const currentPrice = Math.round(Number(product.unit_price));
              const originalPrice = Math.round(Number(product.unit_price) * 2);

              return (
                <div 
                  key={product.id} 
                  className="group/card relative bg-card rounded-[1.75rem] border border-card-border hover:border-card-hoverBorder shadow-2xs hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full min-w-[220px] max-w-[235px] shrink-0"
                >
                  {/* Top -50% Discount Badge & Wishlist */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-20">
                    <span className="bg-badge-red text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider shadow-sm uppercase">
                      -50%
                    </span>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('Wishlist clicked');
                      }}
                      className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-md border border-card-border flex items-center justify-center text-muted hover:text-badge-red hover:scale-110 transition-all shadow-xs cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Product Image Area with Link */}
                  <Link href={`/products/${product.id}`} className="w-full h-44 bg-[#fafbfc] flex items-center justify-center text-5xl relative overflow-hidden transition-all duration-500 group-hover/card:bg-primary-light/60 block">
                    <span className="transform transition-transform duration-700 group-hover/card:scale-110 group-hover/card:-translate-y-2">📦</span>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4 flex flex-col flex-grow bg-card z-0">
                    <Link href={`/products/${product.id}`} className="block mb-2">
                      <h3 className="text-xs font-semibold text-foreground line-clamp-2 leading-relaxed tracking-tight group-hover/card:text-primary transition-colors">
                        {product.title}
                      </h3>
                    </Link>

                    {/* Rating & Sold Info */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center text-yellow-400 text-[10px] gap-0.5">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                      </div>
                      <span className="text-[10px] font-medium text-muted tracking-tight">
                        {product.inventory > 0 ? `${product.inventory * 15} sold` : 'Hot Deal'}
                      </span>
                    </div>

                    {/* Price & Add to Cart Button */}
                    <div className="mt-auto flex flex-col gap-3 pt-2.5 border-t border-card-border/60">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-extrabold text-primary tracking-tight">
                          ${currentPrice}
                        </span>
                        <span className="text-xs text-muted line-through font-normal">
                          ${originalPrice}
                        </span>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          console.log(`Added ${product.title} to cart!`);
                        }}
                        className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-primary-hover transition-all duration-300 hover:scale-[1.02] active:scale-95 text-center cursor-pointer tracking-wide"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Arrow */}
        <button onClick={() => scroll('right')} className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-card/90 backdrop-blur-md border border-card-border rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  );
}