"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, Mail, Lock, User, ShieldCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  total_generated: number;
}

export default function EmployeesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form state
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if admin
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

      // Fetch all employees and their generated invoices
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, full_name, role, created_at')
        .eq('role', 'EMPLOYEE')
        .order('created_at', { ascending: false });

      if (profError) throw profError;

      const { data: invoices, error: invError } = await supabase
        .from('invoices')
        .select('user_id, amount, status, total_amount');

      if (invError) throw invError;

      if (profiles) {
        const formattedEmployees = await Promise.all(profiles.map(async (p: any) => {
          // get email using auth admin is not possible client-side, 
          // we only have profile data. We might not have email directly in profiles unless we added it.
          // For now we'll just display a placeholder or if we add email to profiles we can use it.
          
          const employeeInvoices = invoices?.filter((inv: any) => inv.user_id === p.id && inv.status === 'PAID') || [];
          const totalGenerated = employeeInvoices.reduce((acc: number, inv: any) => acc + Number(inv.total_amount), 0);

          return {
            id: p.id,
            full_name: p.full_name,
            email: "Employé sécurisé", // On cache l'email ou on l'ajoute plus tard au profil
            role: p.role,
            created_at: new Date(p.created_at).toLocaleDateString('fr-FR'),
            total_generated: totalGenerated
          };
        }));
        setEmployees(formattedEmployees);
      }
    } catch (err: any) {
      console.error("Error loading employees:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setFormError('');
    setFormSuccess('');

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          full_name: newName
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création.");
      }

      setFormSuccess(`Le compte de ${newName} a été créé avec succès.`);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      loadEmployees(); // Reload list
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-8">
        <div className="h-10 bg-slate-800 rounded w-1/4"></div>
        <div className="h-64 bg-slate-800/50 rounded-2xl"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mb-4 border border-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Accès Réservé</h2>
        <p className="text-slate-500 mt-2 max-w-md text-sm">
          Seul l'administrateur système peut accéder à la gestion de l'équipe.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 border border-indigo-500/20">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            Équipe
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Gérez vos employés et suivez leurs performances.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Employee List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Liste des Employés <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs">{employees.length}</span>
          </h2>
          
          <div className="space-y-3">
            {employees.length > 0 ? (
              employees.map((emp) => (
                <div key={emp.id} className="glass-light rounded-xl p-5 hover:border-indigo-500/20 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 group">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-lg text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-105 transition-all">
                      {emp.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{emp.full_name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">Créé le {emp.created_at}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">CA Généré</p>
                      <p className="text-sm font-extrabold text-white">
                        {new Intl.NumberFormat('fr-FR').format(emp.total_generated)} <span className="text-[10px] text-slate-400">XAF</span>
                      </p>
                    </div>
                    <div className="hidden sm:block w-px h-8 bg-slate-800"></div>
                    <StatusBadge status="ACTIVE" customText="Actif" customColor="text-emerald-400" customBg="bg-emerald-500/10" customBorder="border-emerald-500/20" />
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-light rounded-xl py-14 text-center text-slate-500 text-sm font-medium">
                Aucun employé pour le moment. Créez-en un via le formulaire.
              </div>
            )}
          </div>
        </div>

        {/* Creation Form */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 relative overflow-hidden sticky top-24">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.04] rounded-full filter blur-[40px] pointer-events-none"></div>
            
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6 relative z-10">
              <UserPlus className="w-5 h-5 text-indigo-400" /> Nouvel Employé
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}
            
            {formSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateEmployee} className="space-y-4 relative z-10">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Nom complet
                </label>
                <input 
                  type="text" 
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="w-full bg-slate-800/60 border border-slate-700/50 text-white py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </label>
                <input 
                  type="email" 
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="jean.dupont@entreprise.com"
                  className="w-full bg-slate-800/60 border border-slate-700/50 text-white py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Mot de passe
                </label>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-slate-800/60 border border-slate-700/50 text-white py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all text-sm font-medium"
                />
              </div>

              <button 
                type="submit"
                disabled={isCreating}
                className="w-full group relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300 disabled:opacity-50 mt-2"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                <span className="relative z-10">{isCreating ? "Création..." : "Créer le compte"}</span>
                {!isCreating && <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
