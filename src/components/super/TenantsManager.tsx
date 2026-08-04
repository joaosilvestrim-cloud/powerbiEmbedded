"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Building2,
  Pencil,
  Globe,
  Users,
  FolderKanban,
  Power,
  ExternalLink,
} from "lucide-react";
import {
  criarTenant,
  atualizarTenant,
  toggleTenant,
} from "@/app/super/actions";
import { useToast } from "@/components/Toast";
import SearchInput from "@/components/SearchInput";
import type { Tenant } from "@/lib/tenant";

const ROOT = "embeddedbi.drivedata.com.br";

type TenantRow = Tenant & { usuarios: number; areas: number };
type FormState = { modo: "criar" } | { modo: "editar"; t: TenantRow } | null;

function urlDoTenant(slug: string, dominio: string | null): string {
  if (dominio) return dominio;
  if (slug === "app") return ROOT;
  return `${slug}.${ROOT}`;
}

export default function TenantsManager({ tenants }: { tenants: TenantRow[] }) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(null);
  const [q, setQ] = useState("");

  const termo = q.trim().toLowerCase();
  const filtrados = termo
    ? tenants.filter(
        (t) =>
          t.nome.toLowerCase().includes(termo) ||
          t.slug.toLowerCase().includes(termo) ||
          (t.dominio ?? "").toLowerCase().includes(termo)
      )
    : tenants;

  const editando = form?.modo === "editar" ? form.t : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Buscar cliente…" />
        <button
          onClick={() => setForm({ modo: "criar" })}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 text-[#ffffff] px-4 py-2 text-sm font-medium hover:bg-brand-700 press"
        >
          <Plus className="h-4 w-4" /> Novo cliente
        </button>
      </div>

      {form && (
        <form
          action={(fd) => {
            startTransition(async () => {
              try {
                if (form.modo === "criar") {
                  await criarTenant(fd);
                  toast("Cliente criado");
                } else {
                  await atualizarTenant(form.t.id, fd);
                  toast("Cliente atualizado");
                }
                setForm(null);
              } catch (e) {
                toast(e instanceof Error ? e.message : "Erro ao salvar");
              }
            });
          }}
          className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 animate-slide-down overflow-hidden"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="block text-slate-700 mb-1">Nome do cliente *</span>
              <input
                name="nome"
                required
                defaultValue={editando?.nome ?? ""}
                placeholder="Ex.: Acme Ltda"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="block text-slate-700 mb-1">
                Slug (subdomínio) *
              </span>
              <input
                name="slug"
                required
                defaultValue={editando?.slug ?? ""}
                placeholder="acme"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
              />
              <span className="mt-1 block text-xs text-slate-400">
                Vira <code>slug.{ROOT}</code>
              </span>
            </label>
          </div>

          <label className="text-sm block">
            <span className="block text-slate-700 mb-1">
              Domínio próprio (opcional)
            </span>
            <input
              name="dominio"
              defaultValue={editando?.dominio ?? ""}
              placeholder="bi.cliente.com.br"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
            />
            <span className="mt-1 block text-xs text-slate-400">
              Se preenchido, o cliente acessa por esse domínio. O apontamento de
              DNS é feito internamente pela DriveData.
            </span>
          </label>

          <label className="text-sm block">
            <span className="block text-slate-700 mb-1">Logo (URL, opcional)</span>
            <input
              name="logo_url"
              defaultValue={editando?.logo_url ?? ""}
              placeholder="https://…/logo.png"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="block text-slate-700 mb-1">Cor primária</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="cor_primaria"
                  defaultValue={editando?.cor_primaria ?? "#0284c7"}
                  className="h-9 w-12 rounded border border-slate-300 bg-white"
                />
                <span className="text-xs text-slate-400">
                  Botões e destaques
                </span>
              </div>
            </label>
            <label className="text-sm">
              <span className="block text-slate-700 mb-1">Cor secundária</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="cor_secundaria"
                  defaultValue={editando?.cor_secundaria ?? "#22c55e"}
                  className="h-9 w-12 rounded border border-slate-300 bg-white"
                />
                <span className="text-xs text-slate-400">Gradiente</span>
              </div>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-brand-600 text-[#ffffff] px-4 py-2 text-sm hover:bg-brand-700 disabled:opacity-60 press"
            >
              {form.modo === "criar" ? "Criar cliente" : "Salvar alterações"}
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

      {tenants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Nenhum cliente ainda. Crie o primeiro para gerar a URL dedicada.
        </div>
      ) : filtrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Nenhum cliente encontrado para “{q}”.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
          {filtrados.map((t) => {
            const url = urlDoTenant(t.slug, t.dominio);
            return (
              <div
                key={t.id}
                className={`group relative overflow-hidden rounded-2xl border bg-white p-5 flex flex-col card-lift ${
                  t.ativo
                    ? "border-slate-200 hover:border-brand-400"
                    : "border-slate-200 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center ring-1 ring-inset ring-white/10 text-[#ffffff]"
                    style={{
                      background: `linear-gradient(135deg, ${t.cor_primaria}, ${t.cor_secundaria})`,
                    }}
                  >
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setForm({ modo: "editar", t })}
                      className="text-slate-500 hover:text-sky-500 p-1 press"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      disabled={pending || t.slug === "app"}
                      onClick={() =>
                        startTransition(async () => {
                          await toggleTenant(t.id, !t.ativo);
                          toast(t.ativo ? "Cliente desativado" : "Cliente ativado");
                        })
                      }
                      className="text-slate-500 hover:text-amber-500 p-1 press disabled:opacity-30"
                      title={t.slug === "app" ? "Tenant padrão" : "Ativar/desativar"}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="mt-4 font-semibold text-lg text-slate-800">
                  {t.nome}
                  {t.slug === "app" && (
                    <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-normal text-slate-500 align-middle">
                      padrão
                    </span>
                  )}
                </h3>

                <a
                  href={`https://${url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-mono truncate"
                >
                  {t.dominio ? (
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="truncate">{url}</span>
                </a>

                <div className="mt-auto pt-4 flex items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {t.usuarios}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FolderKanban className="h-3.5 w-3.5" /> {t.areas}
                  </span>
                  {!t.ativo && (
                    <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-red-600">
                      inativo
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
