"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ReceiptText, LayoutDashboard, Settings, LogOut, ShieldAlert, Sparkles, Users, Menu, X } from "lucide-react";

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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

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
  const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-url' || !profile;

  const menuItems = [
    ...((isAdmin || isDemoMode) ? [
      { href: "/dashboard", label: "Supervision", icon: LayoutDashboard },
      { href: "/employees", label: "Équipe", icon: Users }
    ] : []),
    { href: "/prestations", label: "Facturation", icon: ReceiptText },
    { href: "/settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 glass border-b border-slate-800 sticky top-0 z-40 w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
            I
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">Invoicify</span>
        </div>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-400 hover:text-white rounded-lg glass-light">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-72 glass flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg glass-light z-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 -right-10 w-32 h-32 bg-cyan-500/8 rounded-full filter blur-3xl pointer-events-none"></div>

        {/* Logo */}
        <div className="p-6 relative z-10 pt-16 md:pt-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                I
              </div>
              <div className="absolute inset-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 animate-ping opacity-20"></div>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Invoicify
              </span>
              <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Facturation Pro</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 relative z-10 overflow-y-auto">
          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-4">Navigation</p>
          
          {!loading ? (
            menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative ${
                    isActive
                      ? "text-white bg-gradient-to-r from-indigo-500/15 to-cyan-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] transition-all duration-300 ${
                    isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400"
                  }`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></span>
                  )}
                </Link>
              );
            })
          ) : (
            <div className="px-4 py-3 space-y-3">
              <div className="h-4 bg-slate-800 rounded-md w-3/4 animate-pulse"></div>
              <div className="h-4 bg-slate-800 rounded-md w-5/6 animate-pulse"></div>
            </div>
          )}
        </nav>

        {/* Profile Card */}
        {profile && (
          <div className="mx-4 mb-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{profile.full_name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{profile.role}</p>
              </div>
            </div>
          </div>
        )}

        {isDemoMode && (
          <div className="mx-4 mb-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2 text-[11px] text-indigo-400 font-semibold">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Mode Démo</span>
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-slate-800/80 relative z-10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-300 cursor-pointer"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
