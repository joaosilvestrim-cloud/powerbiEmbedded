"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Info } from "lucide-react";
import {
  criarRelatorio,
  toggleRelatorio,
  removerRelatorio,
} from "@/app/admin/actions";
import type { Relatorio } from "@/lib/types";

export default function RelatoriosAdmin({
  relatorios,
}: {
  relatorios: Relatorio[];
}) {
  const [pending, startTransition] = useTransition();
  const [aberto, setAberto] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setAberto((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Novo relatório
        </button>
      </div>

      {aberto && (
        <form
          action={(fd) => {
            startTransition(async () => {
              await criarRelatorio(fd);
              setAberto(false);
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
                placeholder="Ex.: Vendas — Diretoria"
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
            <label className="text-sm">
              <span className="block text-slate-700 mb-1">
                Workspace (group) ID *
              </span>
              <input
                name="workspace_id"
                required
                placeholder="00000000-0000-0000-0000-000000000000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </label>
            <label className="text-sm">
              <span className="block text-slate-700 mb-1">Report ID *</span>
              <input
                name="report_id"
                required
                placeholder="00000000-0000-0000-0000-000000000000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </label>
          </div>

          <div className="flex gap-3 items-start rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
            <div>
              Os dois IDs estão na URL do relatório no Power BI Service:
              <br />
              <code className="font-mono text-slate-500">
                app.powerbi.com/groups/
                <b className="text-indigo-600">WORKSPACE_ID</b>/reports/
                <b className="text-indigo-600">REPORT_ID</b>/…
              </code>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              Salvar
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

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nome</th>
              <th className="text-left px-4 py-3 font-medium">IDs Power BI</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {relatorios.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                  Nenhum relatório cadastrado ainda.
                </td>
              </tr>
            )}
            {relatorios.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{r.nome}</div>
                  {r.descricao && (
                    <div className="text-xs text-slate-400">{r.descricao}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                  <div>ws: {r.pbi_workspace_id.slice(0, 8)}…</div>
                  <div>rp: {r.pbi_report_id.slice(0, 8)}…</div>
                </td>
                <td className="px-4 py-3">
                  <button
                    disabled={pending}
                    onClick={() =>
                      startTransition(() => toggleRelatorio(r.id, !r.ativo))
                    }
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      r.ativo
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {r.ativo ? "ativo" : "inativo"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    disabled={pending}
                    onClick={() => {
                      if (confirm(`Remover "${r.nome}"?`))
                        startTransition(() => removerRelatorio(r.id));
                    }}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
