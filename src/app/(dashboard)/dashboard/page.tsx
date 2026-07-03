import React from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TrendingUp, Users, Wallet, Activity, ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const RECENT_ACTIVITY = [
  { id: 'INV-2026-003', user: 'Alice M.', title: 'Consulting architecture & dev', amount: 1200, currency: 'EUR', status: 'PAID' as const, date: 'Il y a 2h' },
  { id: 'INV-2026-002', user: 'Bob K.', title: 'App Mobile iOS & Android', amount: 3500000, currency: 'XAF', status: 'PENDING' as const, date: 'Il y a 4h' },
  { id: 'INV-2026-001', user: 'Charlie D.', title: 'Refonte identité visuelle', amount: 450, currency: 'USD', status: 'PAID' as const, date: 'Hier' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      {/* Decorative ambient light leaks in the background */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-blue-100/40 rounded-full filter blur-3xl opacity-50 pointer-events-none z-0"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-100/30 rounded-full filter blur-3xl opacity-40 pointer-events-none z-0"></div>

      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Supervision</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">KPIs et suivi du Chiffre d'Affaires en temps réel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {/* Metric 1 - CA */}
        <div className="bg-white rounded-2xl p-6 shadow-premium border border-slate-200/50 hover:shadow-lux hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chiffre d'Affaires</p>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight whitespace-nowrap font-sans">
                2 540 000 <span className="text-sm font-semibold text-slate-500">XAF</span>
              </h3>
            </div>
            <div className="p-3 bg-blue-50/70 border border-blue-100/50 rounded-xl text-[#1062FE]">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          
          {/* Sparkline (Visual mini chart) */}
          <div className="mt-6 h-12 w-full relative z-10">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient-ca" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1062FE" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1062FE" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,25 Q15,15 30,22 T60,5 T85,15 T100,2" fill="none" stroke="#1062FE" strokeWidth="2" strokeLinecap="round" />
              <path d="M0,25 Q15,15 30,22 T60,5 T85,15 T100,2 L100,30 L0,30 Z" fill="url(#gradient-ca)" />
            </svg>
          </div>

          <div className="relative z-10 mt-4 flex items-center justify-between text-xs border-t border-slate-100 pt-3">
            <span className="text-emerald-500 font-semibold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +12.4%
            </span>
            <span className="text-slate-400 font-medium">Ce mois-ci</span>
          </div>
        </div>

        {/* Metric 2 - Employees */}
        <div className="bg-white rounded-2xl p-6 shadow-premium border border-slate-200/50 hover:shadow-lux hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Effectif Actif</p>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
                14 <span className="text-sm font-semibold text-slate-500">employés</span>
              </h3>
            </div>
            <div className="p-3 bg-indigo-50/70 border border-indigo-100/50 rounded-xl text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Sparkline (Visual mini chart) */}
          <div className="mt-6 h-12 w-full relative z-10">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient-emp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,20 Q20,25 40,15 T80,10 T100,5" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
              <path d="M0,20 Q20,25 40,15 T80,10 T100,5 L100,30 L0,30 Z" fill="url(#gradient-emp)" />
            </svg>
          </div>

          <div className="relative z-10 mt-4 flex items-center justify-between text-xs border-t border-slate-100 pt-3">
            <span className="text-emerald-500 font-semibold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +2 nouveaux
            </span>
            <span className="text-slate-400 font-medium">Cette semaine</span>
          </div>
        </div>

        {/* Metric 3 - Conversion / Conversion Rate */}
        <div className="bg-white rounded-2xl p-6 shadow-premium border border-slate-200/50 hover:shadow-lux hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Facturation Directe</p>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
                85% <span className="text-sm font-semibold text-slate-500">de succès</span>
              </h3>
            </div>
            <div className="p-3 bg-emerald-50/70 border border-emerald-100/50 rounded-xl text-emerald-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          {/* Sparkline (Visual mini chart) */}
          <div className="mt-6 h-12 w-full relative z-10">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient-conv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,28 Q15,10 40,25 T80,5 T100,2" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
              <path d="M0,28 Q15,10 40,25 T80,5 T100,2 L100,30 L0,30 Z" fill="url(#gradient-conv)" />
            </svg>
          </div>

          <div className="relative z-10 mt-4 flex items-center justify-between text-xs border-t border-slate-100 pt-3">
            <span className="text-slate-400 font-medium">Factures payées dans les temps</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Activité Récente de l'Équipe</h2>
          <Link href="/prestations" className="flex items-center gap-1.5 text-xs font-semibold text-[#1062FE] hover:underline">
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Dribbble Style: Cards list representation for rows */}
        <div className="space-y-3">
          {RECENT_ACTIVITY.map((act) => (
            <div 
              key={act.id} 
              className="bg-white rounded-xl p-5 shadow-premium border border-slate-100 hover:border-slate-200/80 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center font-bold text-xs text-slate-500 border border-slate-100 group-hover:bg-[#1062FE]/5 group-hover:text-[#1062FE] group-hover:border-[#1062FE]/10 transition-colors">
                  {act.id.split('-').pop()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-850 text-sm">{act.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Par <span className="font-semibold text-slate-600">{act.user}</span> • {act.date}</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6">
                <StatusBadge status={act.status} />
                <div className="text-right">
                  <span className="font-bold text-slate-900 whitespace-nowrap text-sm">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: act.currency }).format(act.amount)}
                  </span>
                </div>
                <button className="hidden md:flex p-1.5 text-slate-400 hover:text-[#1062FE] hover:bg-slate-50 rounded-lg transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
