import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function GenerateButton({ children = "Générer le lien", className, ...props }: ButtonProps) {
  return (
    <button 
      className={`group relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-gradient-to-r from-[#1062FE] to-[#3B82F6] rounded-xl hover:shadow-[0_0_20px_rgba(16,98,254,0.3)] transition-all duration-300 active:scale-98 ${className || ''}`}
      {...props}
    >
      {/* Light glow reflection effect */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
      
      <span className="relative z-10">{children}</span>
      <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}

// Sparkle keyframe for globals.css style if not loaded automatically
// Added custom keyframe in CSS or using standard tailwind transition.
