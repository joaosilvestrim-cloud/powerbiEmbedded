"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, ArrowRight, Inbox, LayoutGrid, List } from "lucide-react";
import SearchInput from "@/components/SearchInput";
import type { Relatorio } from "@/lib/types";

type Visao = "grade" | "lista";
const STORAGE = "area-visao";

export default function AreaPaineisView({ paineis }: { paineis: Relatorio[] }) {
  const [q, setQ] = useState("");
  const [visao, setVisao] = useState<Visao>("grade");

  useEffect(() => {
    const v = localStorage.getItem(STORAGE);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (v === "lista" || v === "grade") setVisao(v);
  }, []);

  function mudarVisao(v: Visao) {
    setVisao(v);
    try {
      localStorage.setItem(STORAGE, v);
    } catch {}
  }

  const termo = q.trim().toLowerCase();
  const lista = termo
    ? paineis.filter(
        (p) =>
          p.nome.toLowerCase().includes(termo) ||
          p.descricao.toLowerCase().includes(termo)
      )
    : paineis;

  if (paineis.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <Inbox className="mx-auto h-10 w-10 text-slate-500" />
        <p className="mt-3 text-slate-500 font-medium">
          Nenhum painel disponível nesta área.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Buscar painel…" />
        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-xs text-slate-500 hidden sm:inline">
            {lista.length} painel(is)
          </span>
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              onClick={() => mudarVisao("grade")}
              className={`rounded-md p-1.5 press ${
                visao === "grade"
                  ? "bg-sky-500/15 text-sky-300"
                  : "text-slate-400 hover:text-slate-800"
              }`}
              title="Grade"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => mudarVisao("lista")}
              className={`rounded-md p-1.5 press ${
                visao === "lista"
                  ? "bg-sky-500/15 text-sky-300"
                  : "text-slate-400 hover:text-slate-800"
              }`}
              title="Lista"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
          Nenhum painel encontrado para “{q}”.
        </div>
      ) : visao === "grade" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
          {lista.map((p) => (
            <Link
              key={p.id}
              href={`/relatorio/${p.id}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-400 hover:shadow-lg card-lift press"
            >
              <div className="h-10 w-10 rounded-xl bg-sky-500/15 text-sky-300 flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-semibold text-slate-800">{p.nome}</h2>
              {p.descricao && (
                <p className="mt-1 text-sm text-slate-400 line-clamp-2">
                  {p.descricao}
                </p>
              )}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-sky-300">
                Abrir painel
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden stagger">
          {lista.map((p) => (
            <Link
              key={p.id}
              href={`/relatorio/${p.id}`}
              className="group flex items-center gap-3 px-4 py-3 hover:bg-sky-500/5 transition-colors"
            >
              <div className="h-9 w-9 shrink-0 rounded-lg bg-sky-500/15 text-sky-300 flex items-center justify-center">
                <BarChart3 className="h-[18px] w-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-800 truncate">
                  {p.nome}
                </div>
                {p.descricao && (
                  <div className="text-xs text-slate-400 truncate">
                    {p.descricao}
                  </div>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-sky-300 group-hover:translate-x-0.5 transition" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
