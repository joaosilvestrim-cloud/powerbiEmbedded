"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, ChevronDown, UserCog } from "lucide-react";
import type { Profile } from "@/lib/types";

export default function UserMenu({ profile }: { profile: Profile }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setAberto(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const iniciais = (profile.nome || profile.email)
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAberto((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
      >
        <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
          {iniciais}
        </div>
        <span className="hidden sm:block text-sm text-slate-700 max-w-[160px] truncate">
          {profile.nome || profile.email}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {aberto && (
        <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white shadow-lg p-2 z-20 origin-top-right animate-scale-in">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-slate-800 truncate">
              {profile.nome || "—"}
            </p>
            <p className="text-xs text-slate-500 truncate">{profile.email}</p>
            <span
              className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${
                profile.role === "admin"
                  ? "bg-brand-100 text-brand-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {profile.role === "admin" ? "Administrador" : "Usuário"}
            </span>
          </div>
          <div className="my-1 border-t border-slate-100" />
          <Link
            href="/conta"
            onClick={() => setAberto(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <UserCog className="h-4 w-4" />
            Minha conta
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
