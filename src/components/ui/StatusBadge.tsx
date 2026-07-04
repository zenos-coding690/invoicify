import React from 'react';

const statusConfig = {
  DRAFT: { label: 'Brouillon', bg: 'bg-slate-500/15', text: 'text-slate-400', dot: 'bg-slate-400' },
  PENDING: { label: 'En Attente', bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  PAID: { label: 'Payée', bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  CANCELLED: { label: 'Annulée', bg: 'bg-rose-500/15', text: 'text-rose-400', dot: 'bg-rose-400' },
  OVERDUE: { label: 'En Retard', bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400 animate-pulse' },
  ACTIVE: { label: 'Actif', bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
};

interface StatusBadgeProps {
  status: keyof typeof statusConfig | string;
  customText?: string;
  customColor?: string;
  customBg?: string;
  customBorder?: string;
}

export function StatusBadge({ status, customText, customColor, customBg, customBorder }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
  
  const bgClass = customBg || config.bg;
  const textClass = customColor || config.text;
  const borderClass = customBorder || 'border-current/10';
  const label = customText || config.label;
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${bgClass} ${textClass} border ${borderClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {label}
    </span>
  );
}
