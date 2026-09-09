// components/ui/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";

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

  const isOutOfStock = product.inventory <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("This product is out of stock.");
      return;
    }

    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 1000);

    try {
      await addToCart(product, 1);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.quantity?.[0] ||
        error.response?.data?.detail ||
        "Failed to add to cart due to stock limits.";
      toast.error(errorMessage);
    }
  };

  return (
    <button
      disabled={isAdded || isOutOfStock}
      onClick={handleAddToCart}
      className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all duration-300 md:hover:scale-[1.02] active:scale-95 text-center cursor-pointer tracking-wide flex items-center justify-center gap-1.5 ${
        isOutOfStock
          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
          : isAdded
          ? "bg-emerald-500 text-white"
          : "bg-primary text-white md:hover:bg-primary-hover"
      } disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {isAdded ? (
        <>
          <svg
            className="w-3.5 h-3.5"
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
      ) : isOutOfStock ? (
        "Out of Stock"
      ) : (
        "Add to Cart"
      )}
    </button>
  );
}