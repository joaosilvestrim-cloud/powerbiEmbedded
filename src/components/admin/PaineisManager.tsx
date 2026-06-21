"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Info } from "lucide-react";
import {
  criarPainel,
  togglePainel,
  removerPainel,
} from "@/app/admin/actions";
import type { Relatorio } from "@/lib/types";

export default function PaineisManager({
  areaId,
  paineis,
}: {
  areaId: string;
  paineis: Relatorio[];
}) {
  const [pending, startTransition] = useTransition();
  const [aberto, setAberto] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
        {paineis.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-400 text-sm">
            Nenhum painel nesta área ainda. Importe do Power BI ao lado ou
            adicione manualmente.
          </p>
        )}
        {paineis.map((p) => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-slate-800 truncate">
                {p.nome}
              </div>
              <div className="text-xs text-slate-400 font-mono truncate">
                {p.pbi_report_id.slice(0, 12)}…
              </div>
            </div>
            <button
              disabled={pending}
              onClick={() =>
                startTransition(() => togglePainel(p.id, areaId, !p.ativo))
              }
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                p.ativo
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {p.ativo ? "ativo" : "inativo"}
            </button>
            <button
              disabled={pending}
              onClick={() => {
                if (confirm(`Remover o painel "${p.nome}"?`))
                  startTransition(() => removerPainel(p.id, areaId));
              }}
              className="text-slate-300 hover:text-red-600"
              title="Remover painel"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {aberto ? (
        <form
          action={(fd) => {
            startTransition(async () => {
              await criarPainel(areaId, fd);
              setAberto(false);
            });
          }}
          className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="nome"
              required
              placeholder="Nome do painel"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="descricao"
              placeholder="Descrição (opcional)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="workspace_id"
              required
              placeholder="Workspace (group) ID"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
            />
            <input
              name="report_id"
              required
              placeholder="Report ID"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
            />
          </div>
          <div className="flex gap-3 items-start rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
            <span>
              Os IDs estão na URL do relatório:{" "}
              <code className="font-mono">
                app.powerbi.com/groups/<b>WORKSPACE</b>/reports/<b>REPORT</b>
              </code>
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm hover:bg-brand-700 disabled:opacity-60"
            >
              Adicionar painel
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
      ) : (
        <button
          onClick={() => setAberto(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" /> Adicionar painel manualmente
        </button>
      )}
    </div>
  );
}
