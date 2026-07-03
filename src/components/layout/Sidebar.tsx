"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ReceiptText, LayoutDashboard, Settings, LogOut, ShieldAlert } from "lucide-react";

interface Profile {
  full_name: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single();
          
        if (data) {
          setProfile(data as Profile);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        router.push('/login');
      } else if (event === 'SIGNED_IN' && session) {
        loadProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = profile?.role === 'ADMIN';

  // Si on est dans l'environnement de démo (pas de clés Supabase valides)
  // on affiche tout pour ne pas bloquer les tests visuels
  const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-url' || !profile;

  const menuItems = [
    ...((isAdmin || isDemoMode) ? [{ href: "/dashboard", label: "Supervision Admin", icon: LayoutDashboard }] : []),
    { href: "/prestations", label: "Prestations & Paiements", icon: ReceiptText },
    { href: "/settings", label: "Configuration API", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white/70 backdrop-blur-xl border-r border-slate-200/50 flex flex-col min-h-screen sticky top-0 relative z-20">
      {/* Glow Effect behind logo */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-100/50 rounded-full filter blur-2xl opacity-70 pointer-events-none"></div>

      <div className="p-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1062FE] flex items-center justify-center text-white font-bold text-lg shadow-[0_4px_12px_rgba(16,98,254,0.3)]">
            I
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Invoicify<span className="text-[#1062FE]">.</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 relative z-10">
        <p className="px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Menu</p>
        
        {!loading ? (
          menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative ${
                  isActive
                    ? "text-[#1062FE] bg-[#1062FE]/5 shadow-[inset_0_0_0_1px_rgba(16,98,254,0.08)]"
                    : "text-slate-600 hover:text-[#1062FE] hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 transition-transform duration-300 ${
                    isActive ? "text-[#1062FE]" : "text-slate-400 group-hover:text-[#1062FE] group-hover:scale-105"
                  }`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#1062FE] rounded-r-full"></span>
                )}
              </Link>
            );
          })
        ) : (
          <div className="px-4 py-3 space-y-3">
            <div className="h-4 bg-slate-100 rounded-md w-3/4 animate-pulse"></div>
            <div className="h-4 bg-slate-100 rounded-md w-5/6 animate-pulse"></div>
          </div>
        )}
      </nav>

      {/* Profile info on bottom */}
      {profile && (
        <div className="px-4 py-3 mx-4 my-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-0.5 text-xs text-slate-600 font-medium">
          <span className="font-bold text-slate-800">{profile.full_name}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">{profile.role}</span>
        </div>
      )}

      {isDemoMode && (
        <div className="px-4 py-3 mx-4 my-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldAlert className="w-4 h-4 text-[#1062FE] animate-pulse" />
          <span>Mode Démo activé</span>
        </div>
      )}

      <div className="p-4 border-t border-slate-100/80 relative z-10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-300 cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5 text-slate-400 group-hover:text-rose-600" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
