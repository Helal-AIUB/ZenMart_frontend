"use client";

import { motion } from "framer-motion";
import { Star, CheckCircle2, Quote } from "lucide-react";

interface Review {
  id: number;
  product_id?: number;
  user_name?: string; 
  rating: number;
  comment: string;
  created_at: string;
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-purple-100 text-purple-600",
  "bg-rose-100 text-rose-600",
  "bg-amber-100 text-amber-600",
];

export default function TopReviewsMarquee({ reviews }: { reviews: Review[] }) {
  const duplicatedReviews = [...reviews, ...reviews, ...reviews, ...reviews].slice(0, 12); 

  return (
    <div 
      className="relative flex overflow-hidden group"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <motion.div
        className="flex gap-4 sm:gap-6 md:gap-8 px-3 sm:px-4 w-max"
        animate={{ x: ["0%", "-50%"] }} 
        transition={{
          ease: "linear",
          duration: duplicatedReviews.length * 4, 
          repeat: Infinity,
        }}
        whileHover={{ animationPlayState: "paused" }} 
      >
        {duplicatedReviews.map((review, idx) => {
          const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
          const displayName = review.user_name || "Verified Customer";
          const initial = displayName.charAt(0).toUpperCase();

          return (
            <div
              key={`${review.id}-${idx}`}
              // 🟢 Fix: Mobile a width 260px kora hoyeche, Tobe Desktop e original 380px e thakbe
              className="w-[260px] md:w-[380px] bg-white rounded-[2rem] p-6 sm:p-8 border border-card-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 relative flex flex-col shrink-0"
            >
              <Quote 
                size={40} 
                className="absolute top-6 right-6 text-slate-100 rotate-180" 
              />
              
              <div className="flex items-center gap-1 mb-4 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < review.rating ? "currentColor" : "none"} 
                    className={i < review.rating ? "text-yellow-400" : "text-slate-200"}
                  />
                ))}
              </div>

              {/* 🟢 Fix: Text size slightly adjusted for mobile to fit nicely inside 260px */}
              <p className="text-sm md:text-base text-slate-700 leading-relaxed font-medium mb-6 flex-1 relative z-10 line-clamp-4">
                "{review.comment}"
              </p>

              <div className="flex items-center gap-4 mt-auto pt-5 border-t border-slate-50">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shrink-0 ${colorClass}`}>
                  {initial}
                </div>
                <div>
                  <h4 className="font-bold text-primary text-sm sm:text-base flex items-center gap-1.5 line-clamp-1">
                    {displayName}
                    <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                  </h4>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                    Petora BD Shopper
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}