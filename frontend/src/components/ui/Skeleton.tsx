import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-[#E9EAF3]/70 rounded-xl ${className}`} />
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-[#E9EAF3] p-5 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="space-y-2 flex-1">
        <Skeleton className="w-1/2 h-4" />
        <Skeleton className="w-1/4 h-3" />
      </div>
    </div>
    <Skeleton className="w-full h-12 rounded-lg" />
    <div className="flex items-center justify-between pt-2">
      <Skeleton className="w-20 h-6" />
      <Skeleton className="w-16 h-8 rounded-lg" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E9EAF3]"
      >
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-36 h-4" />
        <Skeleton className="w-24 h-4 ml-auto" />
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
    ))}
  </div>
);
