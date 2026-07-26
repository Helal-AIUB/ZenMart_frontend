// frontend/src/components/ui/ProductCard.tsx
"use client";
import Link from "next/link";

interface ProductCardProps {
  product: any;
  isFlashSale?: boolean;
}

export default function ProductCard({
  product,
  isFlashSale = false,
}: ProductCardProps) {
  // Round figure price calculation (removing decimals and using dollar sign)
  const originalPrice = Math.round(Number(product.unit_price) * 1.2);
  const currentPrice = Math.round(Number(product.unit_price));

  return (
    <div className="group/card relative bg-card rounded-[1.5rem] border border-card-border hover:border-card-hoverBorder shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(20,184,166,0.15)] transition-all duration-500 overflow-hidden flex flex-col h-full min-w-[220px] max-w-[240px]">
      {isFlashSale && (
        <div className="absolute top-4 left-4 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full z-20 tracking-wider shadow-lg shadow-rose-500/30">
          -20% OFF
        </div>
      )}

      {/* Image Area */}
      <div className="w-full h-52 bg-[#f8f9fa] flex items-center justify-center text-7xl relative overflow-hidden transition-all duration-500 group-hover/card:bg-primary-light">
        {/* Product Emoji/Image */}
        <span className="transform transition-transform duration-700 group-hover/card:scale-110 group-hover/card:-translate-y-2">
          📦
        </span>

        {/* Backdrop Blur Overlay & Action Buttons */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] opacity-0 group-hover/card:opacity-100 transition-all duration-300 z-10 flex flex-col items-center justify-end p-4 gap-2">
          <button className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-xs shadow-lg hover:bg-primary-hover transition-transform hover:scale-[1.02] active:scale-95">
            Quick Add
          </button>
          <Link
            href={`/products/${product.id}`}
            className="w-full bg-card text-foreground border border-card-border py-2.5 rounded-xl font-bold text-xs shadow-lg hover:bg-gray-50 hover:text-primary transition-all text-center"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Details Area */}
      <div className="p-5 flex flex-col flex-grow bg-card z-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] uppercase font-bold text-primary tracking-[0.1em] bg-primary-light px-2 py-0.5 rounded-md">
            Premium
          </span>
          <span className="flex items-center text-yellow-400 text-xs font-bold gap-1">
            ★ 4.8
          </span>
        </div>

        <Link href={`/products/${product.id}`} className="block mb-3">
          <h3 className="text-base font-bold text-foreground line-clamp-2 leading-tight group-hover/card:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-primary tracking-tight">
                ${currentPrice}
              </span>
              {isFlashSale && (
                <span className="text-xs text-muted line-through font-medium">
                  ${originalPrice}
                </span>
              )}
            </div>

            <Link
              href={`/products/${product.id}`}
              className="w-9 h-9 rounded-full bg-card-border/50 flex items-center justify-center text-muted hover:bg-primary hover:text-white transition-all duration-300 hover:shadow-md hover:shadow-primary/30"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
