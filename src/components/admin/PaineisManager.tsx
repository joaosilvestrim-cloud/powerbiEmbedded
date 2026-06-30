"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Info, Link2, Pencil } from "lucide-react";
import {
  criarPainelLink,
  atualizarPainel,
  togglePainel,
  removerPainel,
} from "@/app/admin/actions";
import { useToast } from "@/components/Toast";
import type { Relatorio } from "@/lib/types";

export default function PaineisManager({
  areaId,
  paineis,
}: {
  areaId: string;
  paineis: Relatorio[];
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
        {paineis.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-400 text-sm">
            Nenhum painel nesta área ainda. Cole um link de incorporação
            abaixo.
          </p>
        )}
        {paineis.map((p) =>
          editando === p.id ? (
            <form
              key={p.id}
              action={(fd) => {
                startTransition(async () => {
                  await atualizarPainel(p.id, areaId, fd);
                  setEditando(null);
                  toast("Painel atualizado");
                });
              }}
              className="grid gap-2 sm:grid-cols-2 px-4 py-3 bg-slate-50 animate-slide-down overflow-hidden"
            >
              <input
                name="nome"
                required
                defaultValue={p.nome}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="descricao"
                defaultValue={p.descricao}
                placeholder="Descrição"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <label className="sm:col-span-2 text-xs text-slate-500">
                Role de RLS (opcional — só para painéis via service principal)
                <input
                  name="rls_role"
                  defaultValue={p.rls_role ?? ""}
                  placeholder="Ex.: Cliente (nome da role no .pbix)"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </label>
              <div className="sm:col-span-2 flex gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-brand-600 text-white px-3 py-1.5 text-sm hover:bg-brand-700 press"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-800 truncate">
                  {p.nome}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {p.embed_url ? (
                    <span className="inline-flex items-center gap-1">
                      <Link2 className="h-3 w-3" /> link de incorporação
                    </span>
                  ) : (
                    <span className="font-mono">
                      {p.pbi_report_id?.slice(0, 12)}…
                    </span>
                  )}
                </div>
              </div>
              <button
                disabled={pending}
                onClick={() =>
                  startTransition(() => togglePainel(p.id, areaId, !p.ativo))
                }
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium press ${
                  p.ativo
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {p.ativo ? "ativo" : "inativo"}
              </button>
              <button
                onClick={() => setEditando(p.id)}
                className="text-slate-300 hover:text-brand-600 press"
                title="Editar painel"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                disabled={pending}
                onClick={() => {
                  if (confirm(`Remover o painel "${p.nome}"?`))
                    startTransition(async () => {
                      await removerPainel(p.id, areaId);
                      toast("Painel removido");
                    });
                }}
                className="text-slate-300 hover:text-red-600 press"
                title="Remover painel"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        )}
      </div>

      {aberto ? (
        <form
          action={(fd) => {
            setErro(null);
            startTransition(async () => {
              try {
                await criarPainelLink(areaId, fd);
                setAberto(false);
                toast("Painel adicionado");
              } catch (e) {
                setErro(e instanceof Error ? e.message : "Erro ao salvar");
              }
            });
          }}
          className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 animate-slide-down overflow-hidden"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="nome"
              required
              placeholder="Nome do painel (ex.: 3D Porto)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="descricao"
              placeholder="Descrição (opcional)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <textarea
            name="embed"
            required
            rows={3}
            placeholder='Cole o link "Publicar na web" (https://app.powerbi.com/view?r=…) ou o código <iframe …> inteiro'
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
          />
          <div className="flex gap-3 items-start rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
            <span>
              No Power BI: <b>Arquivo → Incorporar relatório → Publicar na
              web (público)</b>. Copie o link ou o código <code>&lt;iframe&gt;</code>{" "}
              e cole acima — o portal extrai a URL automaticamente.
            </span>
          </div>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm hover:bg-brand-700 disabled:opacity-60 press"
            >
              Adicionar painel
            </button>
            <button
              type="button"
              onClick={() => {
                setAberto(false);
                setErro(null);
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAberto(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700 press"
        >
          <Plus className="h-4 w-4" /> Adicionar painel por link
        </button>
      )}
    </div>
  );
}
