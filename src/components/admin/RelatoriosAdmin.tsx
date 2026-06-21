"use client";

import { useState, useTransition } from "react";
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
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Nome</th>
              <th className="text-left px-4 py-2 font-medium">Workspace ID</th>
              <th className="text-left px-4 py-2 font-medium">Report ID</th>
              <th className="text-left px-4 py-2 font-medium">Ativo</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {relatorios.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Nenhum relatório cadastrado.
                </td>
              </tr>
            )}
            {relatorios.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-2 text-slate-800">{r.nome}</td>
                <td className="px-4 py-2 text-slate-500 font-mono text-xs">
                  {r.pbi_workspace_id}
                </td>
                <td className="px-4 py-2 text-slate-500 font-mono text-xs">
                  {r.pbi_report_id}
                </td>
                <td className="px-4 py-2">
                  <button
                    disabled={pending}
                    onClick={() =>
                      startTransition(() => toggleRelatorio(r.id, !r.ativo))
                    }
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      r.ativo
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {r.ativo ? "ativo" : "inativo"}
                  </button>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    disabled={pending}
                    onClick={() => {
                      if (confirm(`Remover "${r.nome}"?`))
                        startTransition(() => removerRelatorio(r.id));
                    }}
                    className="text-red-600 hover:underline text-xs"
                  >
                    remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {aberto ? (
        <form
          action={(fd) => {
            startTransition(async () => {
              await criarRelatorio(fd);
              setAberto(false);
            });
          }}
          className="rounded-xl border border-slate-200 bg-white p-4 grid gap-3 sm:grid-cols-2"
        >
          <input
            name="nome"
            required
            placeholder="Nome do relatório"
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
            placeholder="Power BI Workspace (group) ID"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
          />
          <input
            name="report_id"
            required
            placeholder="Power BI Report ID"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
          />
          <div className="sm:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              Salvar relatório
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
          className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700"
        >
          + Novo relatório
        </button>
      )}
    </div>
  );
}
