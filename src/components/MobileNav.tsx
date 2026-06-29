"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { NavLinks } from "@/components/navItems";

export default function MobileNav({ isAdmin }: { isAdmin: boolean }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setAberto(true)}
        aria-label="Abrir menu"
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 press"
      >
        <Menu className="h-5 w-5" />
      </button>

      {aberto && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-slate-900/40 animate-fade-in"
            onClick={() => setAberto(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl flex flex-col animate-slide-in">
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <BrandLogo size={28} />
                <span className="font-semibold text-slate-800">
                  DriveData BI
                </span>
              </div>
              <button
                onClick={() => setAberto(false)}
                aria-label="Fechar menu"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              <NavLinks isAdmin={isAdmin} onNavigate={() => setAberto(false)} />
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
