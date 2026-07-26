import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="min-w-[200px] w-[200px] bg-white rounded-lg border border-gray-100 p-4 flex flex-col h-[280px] animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-32 bg-gray-200 rounded-md mb-4"></div>
      
      {/* Title Skeleton */}
      <div className="w-full h-4 bg-gray-200 rounded-full mb-2"></div>
      <div className="w-2/3 h-4 bg-gray-200 rounded-full mb-4"></div>
      
      {/* Price Skeleton */}
      <div className="mt-auto w-1/2 h-5 bg-gray-200 rounded-full"></div>
    </div>
  );
}