"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReceiptText, LayoutDashboard, Settings, LogOut, ShieldAlert } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", label: "Supervision Admin", icon: LayoutDashboard, role: "admin" },
    { href: "/prestations", label: "Prestations & Paiements", icon: ReceiptText, role: "employee" },
    { href: "/settings", label: "Configuration API", icon: Settings, role: "any" },
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
        
        {menuItems.map((item) => {
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
        })}
      </nav>

      {/* Role Banner Badge (Mock UI helper) */}
      <div className="px-4 py-3 mx-4 my-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
        <ShieldAlert className="w-4 h-4 text-[#1062FE] animate-pulse" />
        <span>Mode Démo : Rôles combinés</span>
      </div>

      <div className="p-4 border-t border-slate-100/80 relative z-10">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-300">
          <LogOut className="w-4.5 h-4.5 text-slate-400 group-hover:text-rose-600" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
