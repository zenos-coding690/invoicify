import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastNotificationProps {
  title: string;
  message: string;
  invoiceId?: string;
  onClose?: () => void;
}

export function ToastNotification({ title, message, invoiceId, onClose }: ToastNotificationProps) {
  return (
    <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
      <div className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-xl border-l-4 border-emerald-500 min-w-[320px]">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mt-1">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="text-sm text-slate-500 mt-1">
            {message} {invoiceId && <span className="font-bold">{invoiceId}</span>}
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        )}
      </div>
    </div>
  );
}
