"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, ShieldAlert, ShieldCheck, Key, CreditCard, LayoutTemplate } from 'lucide-react';

interface Profile {
  full_name: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUserEmail(user.email || '');

        const { data } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single();
          
        if (data) setProfile(data as Profile);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-8">
        <div className="h-10 bg-slate-800 rounded w-1/4"></div>
        <div className="h-64 bg-slate-800/50 rounded-2xl"></div>
      </div>
    );
  }

  const isAdmin = profile?.role === 'ADMIN';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 border border-indigo-500/20">
              <User className="w-6 h-6 text-indigo-400" />
            </div>
            Mon Compte
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Gérez votre profil et vos accès système.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500"></div>
            
            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-3xl shadow-[0_0_20px_rgba(99,102,241,0.2)] mb-4">
                {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="text-xl font-bold text-white">{profile?.full_name}</h2>
              <p className="text-sm text-slate-400 mb-4">{userEmail}</p>

              {isAdmin ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                  <ShieldCheck className="w-4 h-4" /> Administrateur Système
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                  <User className="w-4 h-4" /> Compte Employé
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/50">
              <p className="text-xs text-slate-500 text-center">
                Membre Invoicify actif
              </p>
            </div>
          </div>
        </div>

        {/* Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Info */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <LayoutTemplate className="w-5 h-5 text-indigo-400" /> Informations Personnelles
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2">Nom Complet</label>
                <input 
                  type="text" 
                  defaultValue={profile?.full_name}
                  disabled
                  className="w-full bg-slate-800/40 border border-slate-700/50 text-slate-300 py-3 px-4 rounded-xl opacity-70 cursor-not-allowed text-sm font-medium"
                />
                <p className="text-xs text-slate-500 mt-1.5">Géré par l'administrateur système.</p>
              </div>
            </div>
          </div>

          {/* NotchPay Integration (Admin Only) */}
          {isAdmin ? (
            <div className="glass rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.04] rounded-full filter blur-[40px] pointer-events-none"></div>
              
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6 relative z-10">
                <CreditCard className="w-5 h-5 text-indigo-400" /> Configuration NotchPay
              </h3>
              
              <div className="space-y-4 relative z-10">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                    <Key className="w-3 h-3" /> Public Key
                  </label>
                  <input 
                    type="text" 
                    placeholder="pk.xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-slate-800/60 border border-slate-700/50 text-white py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                    <Key className="w-3 h-3" /> Secret Key
                  </label>
                  <input 
                    type="password" 
                    placeholder="sk.xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-slate-800/60 border border-slate-700/50 text-white py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all text-sm font-medium"
                  />
                </div>
                <button className="w-full mt-2 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 font-bold py-3 px-4 rounded-xl hover:bg-indigo-500/25 transition-all text-sm">
                  Sauvegarder les clés
                </button>
                <p className="text-[10px] text-slate-500 text-center mt-2">
                  Ces clés remplaceront les variables d'environnement locales une fois cette fonctionnalité finalisée.
                </p>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center py-12 border border-dashed border-slate-700/40">
              <ShieldAlert className="w-8 h-8 text-slate-600 mb-3" />
              <h3 className="text-white font-bold mb-1">Accès Restreint</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Seul l'administrateur système peut configurer les intégrations bancaires et clés API.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
