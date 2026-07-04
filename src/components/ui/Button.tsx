import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function GenerateButton({ children = "Générer le lien", className, ...props }: ButtonProps) {
  return (
    <button 
      className={`group relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-3.5 font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl hover:shadow-[0_0_30px_rgba(99,102,241,0.35)] transition-all duration-500 active:scale-[0.98] cursor-pointer ${className || ''}`}
      {...props}
    >
      {/* Shimmer */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
      
      <span className="relative z-10">{children}</span>
      <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}
