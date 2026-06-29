"use client";

import Link from "next/link";
import { useState } from "react";
import { FolderKanban, ArrowRight, Inbox } from "lucide-react";
import { cor } from "@/lib/cores";
import SearchInput from "@/components/SearchInput";
import type { Area } from "@/lib/types";

type AreaComContagem = Area & { paineis: number };

export default function UserAreasGrid({
  areas,
  isAdmin,
}: {
  areas: AreaComContagem[];
  isAdmin: boolean;
}) {
  const [q, setQ] = useState("");
  const termo = q.trim().toLowerCase();
  const filtradas = termo
    ? areas.filter(
        (a) =>
          a.nome.toLowerCase().includes(termo) ||
          a.descricao.toLowerCase().includes(termo)
      )
    : areas;

  if (areas.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <Inbox className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-slate-600 font-medium">
          Nenhuma área liberada para você ainda.
        </p>
        {isAdmin ? (
          <Link
            href="/admin/areas"
            className="mt-4 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
          >
            Criar áreas <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <p className="mt-1 text-sm text-slate-400">
            Peça liberação ao administrador.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {areas.length > 3 && (
        <SearchInput value={q} onChange={setQ} placeholder="Buscar área…" />
      )}

      {filtradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Nenhuma área encontrada para “{q}”.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
          {filtradas.map((a) => {
            const c = cor(a.cor);
            return (
              <Link
                key={a.id}
                href={`/area/${a.id}`}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-400 hover:shadow-lg card-lift press"
              >
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}
                >
                  <FolderKanban className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-semibold text-slate-800">{a.nome}</h2>
                {a.descricao && (
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                    {a.descricao}
                  </p>
                )}
                <span className="mt-3 text-xs text-slate-400">
                  {a.paineis} painel(is)
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                  Abrir área
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
