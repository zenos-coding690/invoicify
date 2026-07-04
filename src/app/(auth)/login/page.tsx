"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Mail, Lock, Fingerprint } from 'lucide-react';

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

    if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-url') {
      setTimeout(() => {
        setLoading(false);
        if (email.includes('admin')) {
          router.push('/dashboard');
        } else {
          router.push('/prestations');
        }
      }, 1000);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Get user role to redirect appropriately
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'ADMIN') {
          router.push('/dashboard');
        } else {
          router.push('/prestations');
        }
      }
    } catch (err: any) {
      setError("Une erreur est survenue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] px-4 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/[0.07] rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/[0.05] rounded-full filter blur-[100px] pointer-events-none"></div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>

      <div className="w-full max-w-md glass rounded-2xl p-8 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-500 shadow-[0_0_60px_rgba(99,102,241,0.08)]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)]">
              I
            </div>
            <div className="absolute inset-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 animate-ping opacity-15"></div>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Bienvenue</h2>
          <p className="text-sm text-slate-400 mt-1.5 font-medium">Connectez-vous à votre espace de facturation.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
            <Fingerprint className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Adresse email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full bg-slate-800/50 border border-slate-700/50 text-white py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-sm font-medium placeholder:text-slate-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Mot de passe
              </label>
              <a href="#" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Oublié ?</a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800/50 border border-slate-700/50 text-white py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-sm font-medium placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full group relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-3.5 font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl hover:shadow-[0_0_30px_rgba(99,102,241,0.35)] transition-all duration-500 active:scale-[0.98] disabled:opacity-50 mt-2 cursor-pointer"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
            <span className="relative z-10">{loading ? "Connexion..." : "Se connecter"}</span>
            {!loading && <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Utilisez les identifiants de votre compte Supabase Auth.
          </p>
        </div>
      </div>
    </div>
  );
}
