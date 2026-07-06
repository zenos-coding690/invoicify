"use client";

import React, { useState, useEffect } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { createClient } from '@/lib/supabase/client';
import { TrendingUp, Users, Wallet, Activity, ArrowUpRight, Lock, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ActivityLog {
  id: string;
  user_name: string;
  action_type: string;
  details: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [totalCA, setTotalCA] = useState(0);
  const [employeesCount, setEmployeesCount] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile || profile.role !== 'ADMIN') {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setIsAdmin(true);

        const { data: invoices, error: invError } = await supabase
          .from('invoices')
          .select('*, profiles(full_name), invoice_items(title)')
          .order('created_at', { ascending: false });

        if (invError) throw invError;

        const { count: profilesCount, error: profError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (profError) throw profError;
        setEmployeesCount(profilesCount || 0);

        if (invoices) {
          const sumCA = invoices
            .filter((inv: any) => inv.status === 'PAID')
            .reduce((acc: number, inv: any) => acc + Number(inv.total_amount), 0);
          setTotalCA(sumCA);

          const paidCount = invoices.filter((inv: any) => inv.status === 'PAID').length;
          const pendingCount = invoices.filter((inv: any) => inv.status === 'PENDING').length;
          const totalRelevant = paidCount + pendingCount;
          const rate = totalRelevant > 0 ? Math.round((paidCount / totalRelevant) * 100) : 0;
          setConversionRate(rate);
        }

        const { data: logs, error: logsError } = await supabase
          .from('activity_logs')
          .select('*, profiles(full_name)')
          .order('created_at', { ascending: false })
          .limit(10);

        if (!logsError && logs) {
          const formattedLogs: ActivityLog[] = logs.map((log: any) => ({
            id: log.id,
            user_name: log.profiles?.full_name || 'Inconnu',
            action_type: log.action_type,
            details: log.details,
            created_at: new Date(log.created_at).toLocaleString('fr-FR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })
          }));
          setActivityLogs(formattedLogs);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-8">
        <div className="h-10 bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-slate-800/50 rounded-2xl border border-slate-700/30"></div>
          <div className="h-44 bg-slate-800/50 rounded-2xl border border-slate-700/30"></div>
          <div className="h-44 bg-slate-800/50 rounded-2xl border border-slate-700/30"></div>
        </div>
        <div className="h-64 bg-slate-800/50 rounded-2xl border border-slate-700/30"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mb-4 border border-rose-500/20">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Accès Administrateur Requis</h2>
        <p className="text-slate-500 mt-2 max-w-md text-sm">
          Cette section est réservée aux comptes disposant du rôle Administrateur.
        </p>
        <Link href="/prestations" className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white py-2.5 px-6 rounded-xl hover:shadow-[0_0_25px_rgba(99,102,241,0.3)] transition-all text-sm font-bold">
          Aller à la Facturation <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const metrics = [
    {
      label: "Chiffre d'Affaires",
      value: new Intl.NumberFormat('fr-FR').format(totalCA),
      unit: "XAF",
      icon: Wallet,
      color: "indigo",
      gradient: "from-indigo-500/15 to-indigo-500/5",
      borderColor: "border-indigo-500/20",
      iconBg: "bg-indigo-500/15",
      iconColor: "text-indigo-400",
      sparkColor: "#818CF8",
      sparkPath: "M0,25 Q15,15 30,22 T60,5 T85,15 T100,2"
    },
    {
      label: "Effectif Actif",
      value: String(employeesCount),
      unit: "employé(s)",
      icon: Users,
      color: "cyan",
      gradient: "from-cyan-500/15 to-cyan-500/5",
      borderColor: "border-cyan-500/20",
      iconBg: "bg-cyan-500/15",
      iconColor: "text-cyan-400",
      sparkColor: "#06B6D4",
      sparkPath: "M0,20 Q20,25 40,15 T80,10 T100,5"
    },
    {
      label: "Taux de Succès",
      value: `${conversionRate}%`,
      unit: "de conversion",
      icon: Activity,
      color: "emerald",
      gradient: "from-emerald-500/15 to-emerald-500/5",
      borderColor: "border-emerald-500/20",
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
      sparkColor: "#10B981",
      sparkPath: "M0,28 Q15,10 40,25 T80,5 T100,2"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 border border-indigo-500/20">
              <BarChart3 className="w-6 h-6 text-indigo-400" />
            </div>
            Supervision
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">KPIs et suivi du chiffre d'affaires en temps réel.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className={`glass rounded-2xl p-6 hover:shadow-glow hover:-translate-y-0.5 transition-all duration-500 relative group overflow-hidden`}>
            {/* Hover ambient glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{m.label}</p>
                <h3 className="text-3xl font-extrabold text-white tracking-tight whitespace-nowrap">
                  {m.value} <span className="text-sm font-semibold text-slate-500">{m.unit}</span>
                </h3>
              </div>
              <div className={`p-3 ${m.iconBg} ${m.iconColor} rounded-xl border ${m.borderColor}`}>
                <m.icon className="w-5 h-5" />
              </div>
            </div>
            
            {/* Sparkline */}
            <div className="mt-6 h-12 w-full relative z-10">
              <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={m.sparkColor} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={m.sparkColor} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={m.sparkPath} fill="none" stroke={m.sparkColor} strokeWidth="2" strokeLinecap="round" />
                <path d={`${m.sparkPath} L100,30 L0,30 Z`} fill={`url(#grad-${i})`} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Logs */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Journal d'Activité</h2>

        <div className="space-y-3">
          {activityLogs.map((log) => (
            <div 
              key={log.id} 
              className="glass-light rounded-xl p-5 hover:border-indigo-500/20 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center font-bold text-xs text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all">
                  {log.action_type === 'LOGIN' ? 'LOG' : 'INV'}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{log.user_name} <span className="text-slate-500 font-normal">a effectué une action :</span></h4>
                  <p className="text-xs text-slate-400 mt-0.5">{log.details}</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-5">
                <span className="text-xs text-slate-500">{log.created_at}</span>
              </div>
            </div>
          ))}
          {activityLogs.length === 0 && (
            <div className="glass-light rounded-xl py-14 text-center text-slate-500 text-sm font-medium">
              Aucune activité enregistrée.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
