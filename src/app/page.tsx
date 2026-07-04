"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HudLoader } from '@/components/ui/HudLoader';
import { ChevronRight, Shield, Zap, Globe, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 3800);
    return () => clearTimeout(timer);
  }, []);

  if (isInitializing) {
    return <HudLoader />;
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 overflow-hidden relative font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/15 via-[#030712] to-[#030712] z-0"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.02)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>

      {/* Ambient orbs */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-indigo-500/[0.04] rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-cyan-500/[0.03] rounded-full filter blur-[100px] pointer-events-none"></div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-extrabold tracking-tighter text-white flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center">
              <span className="text-white text-sm font-bold">I</span>
            </div>
          </div>
          Invoicify
        </div>
        <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors px-5 py-2.5 glass rounded-full hover:border-indigo-500/30">
          Connexion
        </Link>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-indigo-400 text-xs font-bold mb-10">
          <Sparkles className="w-3.5 h-3.5" />
          Plateforme de Facturation v2.0
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
          Facturez avec une
          <br />
          <span className="text-gradient">Précision Absolue</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Générez des liens de paiement dynamiques, encaissez dans le monde entier et supervisez votre chiffre d'affaires en temps réel.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            href="/login" 
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-full overflow-hidden hover:scale-105 transition-all duration-500 shadow-[0_0_40px_rgba(99,102,241,0.3)]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
            <span className="relative z-10">Accéder au système</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-28 w-full">
          {[
            { icon: Globe, title: "Réseau Mondial", desc: "Acceptez XAF, XOF, EUR, USD. Paiements mobiles et cartes bancaires." },
            { icon: Zap, title: "Temps Réel", desc: "Vos factures se mettent à jour instantanément dès le paiement confirmé." },
            { icon: Shield, title: "Sécurité Totale", desc: "Signatures HMAC cryptographiques et Row Level Security Supabase." }
          ].map((feat, i) => (
            <div key={i} className="glass rounded-2xl p-6 text-left hover:border-indigo-500/25 transition-all duration-500 group">
              <div className="w-12 h-12 bg-slate-800/80 border border-slate-700/50 rounded-xl flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all duration-500">
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
