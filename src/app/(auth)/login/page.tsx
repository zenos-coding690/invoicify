"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Si les clés Supabase ne sont pas configurées, on simule une connexion démo
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-url') {
      setTimeout(() => {
        setLoading(false);
        // Simulation d'un compte de démo selon l'email
        if (email.includes('admin')) {
          router.push('/dashboard');
        } else {
          router.push('/prestations');
        }
      }, 1000);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError("Une erreur est survenue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FB] px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full filter blur-3xl opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-100/40 rounded-full filter blur-3xl opacity-50 pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-premium border border-slate-100 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#1062FE] flex items-center justify-center text-white font-bold text-2xl shadow-[0_4px_16px_rgba(16,98,254,0.35)] mb-4">
            I
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Bienvenue sur Invoicify</h2>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">Connectez-vous à votre espace financier.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Adresse email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: admin@invoicify.co ou employee@invoicify.co"
              className="w-full bg-slate-50/50 border border-slate-200/60 text-slate-900 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1062FE]/20 focus:border-[#1062FE] transition-all text-sm font-medium"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Mot de passe
              </label>
              <a href="#" className="text-xs font-semibold text-[#1062FE] hover:underline">Oublié ?</a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50/50 border border-slate-200/60 text-slate-900 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1062FE]/20 focus:border-[#1062FE] transition-all text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full group relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-gradient-to-r from-[#1062FE] to-[#3B82F6] rounded-xl hover:shadow-[0_0_20px_rgba(16,98,254,0.3)] transition-all duration-300 active:scale-98 disabled:opacity-50 mt-2 cursor-pointer"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
            <span className="relative z-10">{loading ? "Connexion..." : "Se connecter"}</span>
            {!loading && <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Accès démo : saisissez n'importe quel email contenant <span className="font-bold text-slate-600">"admin"</span> pour simuler le profil administrateur.
          </p>
        </div>
      </div>
    </div>
  );
}
