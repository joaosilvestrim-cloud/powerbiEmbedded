"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Plus, FolderKanban, Trash2, ArrowRight, Pencil } from "lucide-react";
import { criarArea, atualizarArea, removerArea } from "@/app/admin/actions";
import { CORES, cor } from "@/lib/cores";
import { useToast } from "@/components/Toast";
import type { Area } from "@/lib/types";

type AreaComContagem = Area & { paineis: number };
type FormState =
  | { modo: "criar" }
  | { modo: "editar"; area: AreaComContagem }
  | null;

export default function AreasManager({
  areas,
}: {
  areas: AreaComContagem[];
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(null);
  const [corSel, setCorSel] = useState("brand");

  function abrirCriar() {
    setCorSel("brand");
    setForm({ modo: "criar" });
  }
  function abrirEditar(a: AreaComContagem) {
    setCorSel(a.cor);
    setForm({ modo: "editar", area: a });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={abrirCriar}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700 press"
        >
          <Plus className="h-4 w-4" /> Nova área
        </button>
      </div>

      {form && (
        <form
          action={(fd) => {
            fd.set("cor", corSel);
            startTransition(async () => {
              if (form.modo === "criar") {
                await criarArea(fd);
                toast("Área criada");
              } else {
                await atualizarArea(form.area.id, fd);
                toast("Área atualizada");
              }
              setForm(null);
            });
          }}
          className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 animate-slide-down overflow-hidden"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="block text-slate-700 mb-1">Nome *</span>
              <input
                name="nome"
                required
                defaultValue={form.modo === "editar" ? form.area.nome : ""}
                placeholder="Ex.: Financeiro"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="block text-slate-700 mb-1">Descrição</span>
              <input
                name="descricao"
                defaultValue={form.modo === "editar" ? form.area.descricao : ""}
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
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm press ${
                    corSel === chave ? "border-slate-800" : "border-slate-200"
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
              className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm hover:bg-brand-700 disabled:opacity-60 press"
            >
              {form.modo === "criar" ? "Salvar área" : "Salvar alterações"}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
          {areas.map((a) => {
            const c = cor(a.cor);
            return (
              <div
                key={a.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col hover:shadow-lg hover:border-brand-300 card-lift"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}
                  >
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => abrirEditar(a)}
                      className="text-slate-300 hover:text-brand-600 p-1 press"
                      title="Editar área"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      disabled={pending}
                      onClick={() => {
                        if (
                          confirm(
                            `Remover a área "${a.nome}"? Os painéis dela também serão removidos.`
                          )
                        )
                          startTransition(async () => {
                            await removerArea(a.id);
                            toast("Área removida");
                          });
                      }}
                      className="text-slate-300 hover:text-red-600 p-1 press"
                      title="Remover área"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
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
