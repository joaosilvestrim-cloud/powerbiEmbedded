"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Plus, FolderKanban, Trash2, ArrowRight } from "lucide-react";
import { criarArea, removerArea } from "@/app/admin/actions";
import { CORES, cor } from "@/lib/cores";
import type { Area } from "@/lib/types";

type AreaComContagem = Area & { paineis: number };

export default function AreasManager({
  areas,
}: {
  areas: AreaComContagem[];
}) {
  const [pending, startTransition] = useTransition();
  const [aberto, setAberto] = useState(false);
  const [corSel, setCorSel] = useState("brand");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setAberto((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Nova área
        </button>
      </div>

      {aberto && (
        <form
          action={(fd) => {
            fd.set("cor", corSel);
            startTransition(async () => {
              await criarArea(fd);
              setAberto(false);
              setCorSel("brand");
            });
          }}
          className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="block text-slate-700 mb-1">Nome *</span>
              <input
                name="nome"
                required
                placeholder="Ex.: Financeiro"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="block text-slate-700 mb-1">Descrição</span>
              <input
                name="descricao"
                placeholder="Opcional"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div>
            <span className="block text-sm text-slate-700 mb-2">Cor</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CORES).map(([chave, c]) => (
                <button
                  type="button"
                  key={chave}
                  onClick={() => setCorSel(chave)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                    corSel === chave
                      ? "border-slate-800"
                      : "border-slate-200"
                  }`}
                >
                  <span className={`h-3 w-3 rounded-full ${c.dot}`} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm hover:bg-brand-700 disabled:opacity-60"
            >
              Salvar área
            </button>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {areas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Nenhuma área criada ainda. Comece criando “Operações”, “RH” ou
          “Financeiro”.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((a) => {
            const c = cor(a.cor);
            return (
              <div
                key={a.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}
                  >
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <button
                    disabled={pending}
                    onClick={() => {
                      if (
                        confirm(
                          `Remover a área "${a.nome}"? Os painéis dela também serão removidos.`
                        )
                      )
                        startTransition(() => removerArea(a.id));
                    }}
                    className="text-slate-300 hover:text-red-600"
                    title="Remover área"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="mt-4 font-semibold text-slate-800">{a.nome}</h3>
                {a.descricao && (
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {a.descricao}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  {a.paineis} painel(is)
                </p>
                <Link
                  href={`/admin/areas/${a.id}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
                >
                  Gerenciar painéis <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
