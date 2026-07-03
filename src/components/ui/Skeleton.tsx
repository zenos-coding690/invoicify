import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-slate-200 rounded w-3/4"></div>
    </div>
  );
}
