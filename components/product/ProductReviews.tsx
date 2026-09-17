"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, Loader2, Edit3, X, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ProductReviews({ productId }: { productId: number | string }) {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🟢 Fetch Reviews INSTANTLY using React Query
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["product_reviews", productId],
    queryFn: async () => {
      const res = await apiClient.get(`/store/products/${productId}/reviews/`);
      return res.data.results || res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) 
    : "0.0";

  // Handle Review Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error("Please write a comment.");
    
    setIsSubmitting(true);
    try {
      await apiClient.post(`/store/products/${productId}/reviews/`, {
        rating,
        comment: comment.trim()
      });
      
      toast.success("Review submitted successfully!", { icon: '🎉' });
      queryClient.invalidateQueries({ queryKey: ["product_reviews", productId] });
      setIsFormOpen(false);
      setComment("");
      setRating(5);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Failed to submit review. Have you purchased this item?";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-card-border p-5 sm:p-6 md:p-8 mt-6 md:mt-8 font-sans overflow-hidden">
      
      {/* 🟢 Header & Summary Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-8 pb-8 border-b border-card-border/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
          <div className="flex flex-col items-center justify-center bg-[#f8f9fa] w-24 h-24 sm:w-28 sm:h-28 rounded-[1.5rem] border border-card-border shrink-0 shadow-sm">
            <span className="text-3xl sm:text-4xl font-black text-primary tracking-tight">{avgRating}</span>
            <div className="flex items-center text-yellow-400 text-[10px] sm:text-xs mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < Math.round(Number(avgRating)) ? "currentColor" : "none"} className={i < Math.round(Number(avgRating)) ? "text-yellow-400" : "text-slate-300"} />
              ))}
            </div>
          </div>
          <div>
            {/* 🟢 Title changed to Primary Color */}
            <h3 className="text-lg sm:text-xl font-black text-primary mb-1 tracking-tight flex items-center gap-2">
              Customer Reviews <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{totalReviews}</span>
            </h3>
            <p className="text-xs sm:text-sm text-muted font-medium max-w-sm">
              Real reviews from verified buyers. See what others are saying about this product.
            </p>
          </div>
        </div>

        {/* 🟢 Button Fixed: Changed to Primary Color for better visibility */}
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="w-full md:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white shadow-primary/30 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          {isFormOpen ? <><X size={16}/> Cancel</> : <><Edit3 size={16}/> Write a Review</>}
        </button>
      </div>

      {/* 🟢 Interactive Review Form (Animated) */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-[#f8f9fa] p-5 sm:p-6 rounded-[1.5rem] border border-card-border shadow-inner">
              <h4 className="text-sm font-black text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare size={16} className="text-primary"/> Rate & Review
              </h4>
              
              <div className="mb-5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Overall Rating</label>
                <div className="flex items-center gap-1.5" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star} type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110 focus:outline-none cursor-pointer p-1"
                    >
                      <Star size={28} fill={(hoverRating || rating) >= star ? "currentColor" : "none"} className={`transition-colors ${(hoverRating || rating) >= star ? "text-yellow-400" : "text-slate-300"}`} />
                    </button>
                  ))}
                  <span className="ml-3 text-xs font-bold text-slate-400 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div className="mb-5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Your Feedback</label>
                <textarea 
                  required
                  rows={3} 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full px-4 py-3 bg-white border border-card-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none custom-scrollbar shadow-sm text-slate-700"
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white shadow-primary/30 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50">
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Submit Review"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🟢 Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12"><Loader2 className="animate-spin text-primary/50" size={32} /></div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center opacity-60">
            <MessageSquare size={48} className="text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-500">No reviews yet.</p>
            <p className="text-xs text-slate-400 mt-1">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <AnimatePresence>
              {reviews.map((review, idx) => (
                <motion.div 
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-5 rounded-[1.5rem] border border-card-border shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3 border-b border-slate-50 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm border border-emerald-100 shrink-0">
                        {review.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-primary text-sm flex items-center gap-1.5">
                          {review.user_name}
                          <CheckCircle2 size={12} className="text-blue-500" />
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-yellow-400" : "text-slate-200"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    "{review.comment}"
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      
    </div>
  );
}