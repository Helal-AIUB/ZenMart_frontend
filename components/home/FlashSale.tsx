
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
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const validProducts = Array.isArray(products) 
    ? products 
    : products?.results || products?.data || [];

  return (
    <section className="my-14 bg-card rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-card-border group">
      {/* Glow Effect using Global Primary */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-primary/10 blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="px-8 pt-8 pb-6 flex flex-col md:flex-row items-center justify-between text-foreground relative z-10">
        <div className="flex items-center gap-4 mb-6 md:mb-0">
          <div className="bg-primary p-3 rounded-2xl shadow-[0_0_20px_rgba(13,148,136,0.3)] text-white">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" /></svg>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground mb-1">Flash Sale</h2>
            <p className="text-primary text-sm font-medium">Hurry, offers end soon!</p>
          </div>
        </div>
        
        {/* Sleek Timer */}
        <div className="flex items-center gap-3 bg-card-border/50 border border-card-border px-6 py-3 rounded-2xl backdrop-blur-md">
          <span className="font-bold text-sm text-muted uppercase tracking-widest mr-2">Ends in</span>
          <div className="flex gap-2 text-foreground font-black text-xl">
            <div className="bg-card px-3 py-1.5 rounded-lg min-w-[45px] text-center border border-card-border">{String(timeLeft.hours).padStart(2, '0')}</div>
            <span className="text-primary animate-pulse">:</span>
            <div className="bg-card px-3 py-1.5 rounded-lg min-w-[45px] text-center border border-card-border">{String(timeLeft.minutes).padStart(2, '0')}</div>
            <span className="text-primary animate-pulse">:</span>
            <div className="bg-primary text-white px-3 py-1.5 rounded-lg min-w-[45px] text-center shadow-[0_0_15px_rgba(13,148,136,0.3)]">{String(timeLeft.seconds).padStart(2, '0')}</div>
          </div>
        </div>
      </div>

      {/* Products Area with Navigation Arrows */}
      <div className="p-8 pt-2 relative z-10">
        
        {/* Left Arrow */}
        <button onClick={() => scroll('left')} className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-card/80 backdrop-blur-md border border-card-border rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 shadow-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <div ref={scrollRef} className="flex overflow-x-auto gap-6 pb-6 snap-x custom-scrollbar scroll-smooth hide-scroll-bar">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <ProductSkeleton key={i} />)
          ) : (
            validProducts?.slice(0, 8).map((product: any) => {
              const currentPrice = Math.round(Number(product.unit_price));
              const originalPrice = Math.round(Number(product.unit_price) * 2);

              return (
                <div 
                  key={product.id} 
                  className="group relative bg-card rounded-[1.5rem] border border-card-border hover:border-card-hoverBorder shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(20,184,166,0.15)] transition-all duration-500 overflow-hidden flex flex-col h-full min-w-[220px] max-w-[240px]"
                >
                  {/* Top -50% Discount Badge & Wishlist */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider shadow-md shadow-rose-500/20">
                      -50%
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
                      <span className="text-[10px] font-medium text-muted">
                        {product.inventory > 0 ? `${product.inventory * 15} sold` : 'Hot Deal'}
                      </span>
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
              );
            })
          )}
        </div>

        {/* Right Arrow */}
        <button onClick={() => scroll('right')} className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-card/80 backdrop-blur-md border border-card-border rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 shadow-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  );
}