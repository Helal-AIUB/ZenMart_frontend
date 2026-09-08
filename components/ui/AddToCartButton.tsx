// components/ui/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";

interface AddToCartButtonProps {
  product: any;
  className?: string;
}

export default function AddToCartButton({
  product,
  className = "",
}: AddToCartButtonProps) {
  const { addToCart } = useCartStore();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); 

    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 1000);

    addToCart(product, 1).catch((error) => {
      console.error("Failed to add to cart:", error);
    });
  };

  return (
    <button
      disabled={isAdded}
      onClick={handleAddToCart}
      className={`w-full py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs shadow-sm transition-all duration-300 md:hover:scale-[1.02] active:scale-95 text-center cursor-pointer tracking-wide flex items-center justify-center gap-1 sm:gap-1.5 ${
        isAdded
          ? "bg-emerald-500 text-white"
          : "bg-primary text-white md:hover:bg-primary-hover"
      } ${className}`}
    >
      {isAdded ? (
        <>
          <svg
            className="w-3 h-3 sm:w-3.5 sm:h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Added!
        </>
      ) : (
        "Add to Cart"
      )}
    </button>
  );
}
