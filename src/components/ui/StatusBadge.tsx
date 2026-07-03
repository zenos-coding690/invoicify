import React from 'react';

type Status = 'PENDING' | 'PAID' | 'DRAFT';

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStyles = (s: Status) => {
    switch (s) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'PENDING':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'DRAFT':
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

  const getDotStyles = (s: Status) => {
    switch (s) {
      case 'PAID':
        return 'bg-emerald-500';
      case 'PENDING':
        return 'bg-amber-500 animate-pulse';
      case 'DRAFT':
      default:
        return 'bg-slate-400';
    }
  };

  const getLabel = (s: Status) => {
    switch (s) {
      case 'PAID': return 'Payée';
      case 'PENDING': return 'En Attente';
      case 'DRAFT': return 'Brouillon';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs ${getStyles(status)}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${getDotStyles(status)}`}></span>
      {getLabel(status)}
    </span>
  );
}
