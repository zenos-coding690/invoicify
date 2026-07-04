import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastNotificationProps {
  title: string;
  message: string;
  invoiceId?: string;
  onClose?: () => void;
}

export function ToastNotification({ title, message, invoiceId, onClose }: ToastNotificationProps) {
  return (
    <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
      <div className="flex items-start gap-4 glass rounded-2xl p-5 shadow-[0_0_40px_rgba(16,185,129,0.15)] border border-emerald-500/20 min-w-[340px]">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-white text-sm">{title}</p>
          <p className="text-sm text-slate-400 mt-0.5">
            {message} {invoiceId && <span className="font-bold text-emerald-400">{invoiceId}</span>}
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
