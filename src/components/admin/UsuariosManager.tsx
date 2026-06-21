"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, ShieldCheck, SlidersHorizontal, ChevronDown } from "lucide-react";
import {
  criarUsuario,
  definirRole,
  definirPermissaoArea,
} from "@/app/admin/actions";
import { cor } from "@/lib/cores";
import type { Profile, Area, PermissaoArea } from "@/lib/types";

export default function UsuariosManager({
  usuarios,
  areas,
  permissoes,
}: {
  usuarios: Profile[];
  areas: Area[];
  permissoes: PermissaoArea[];
}) {
  const [pending, startTransition] = useTransition();
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);

  const permsPorUser = useMemo(() => {
    const m = new Map<string, Set<string>>();
    permissoes.forEach((p) => {
      if (!m.has(p.user_id)) m.set(p.user_id, new Set());
      m.get(p.user_id)!.add(p.area_id);
    });
    return m;
  }, [permissoes]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setAberto((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700 press"
        >
          <Plus className="h-4 w-4" /> Novo usuário
        </button>
      </div>

      {aberto && (
        <form
          action={(fd) => {
            setErro(null);
            startTransition(async () => {
              try {
                await criarUsuario(fd);
                setAberto(false);
              } catch (e) {
                setErro(e instanceof Error ? e.message : "Erro ao criar usuário");
              }
            });
          }}
          className="rounded-2xl border border-slate-200 bg-white p-5 grid gap-4 sm:grid-cols-3 animate-slide-down overflow-hidden"
        >
          <label className="text-sm">
            <span className="block text-slate-700 mb-1">Nome</span>
            <input
              name="nome"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="block text-slate-700 mb-1">E-mail</span>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="block text-slate-700 mb-1">Senha temporária</span>
            <input
              name="senha"
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          {erro && <p className="sm:col-span-3 text-sm text-red-600">{erro}</p>}
          <div className="sm:col-span-3 flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm hover:bg-brand-700 disabled:opacity-60"
            >
              Criar usuário
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

      <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
        {usuarios.map((u) => {
          const isAdmin = u.role === "admin";
          const liberadas = permsPorUser.get(u.id) ?? new Set<string>();
          const exp = expandido === u.id;
          return (
            <div key={u.id}>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold">
                  {(u.nome || u.email).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-800 truncate">
                    {u.nome || "—"}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {u.email}
                  </div>
                </div>

                <select
                  defaultValue={u.role}
                  disabled={pending}
                  onChange={(e) =>
                    startTransition(() =>
                      definirRole(u.id, e.target.value as "admin" | "user")
                    )
                  }
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>

                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 text-xs text-brand-600 w-36 justify-end">
                    <ShieldCheck className="h-4 w-4" /> vê todas as áreas
                  </span>
                ) : (
                  <button
                    onClick={() => setExpandido(exp ? null : u.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 w-36 justify-center"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {liberadas.size} área(s)
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition ${
                        exp ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

              {exp && !isAdmin && (
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 animate-slide-down overflow-hidden">
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    Áreas liberadas para {u.nome || u.email}
                  </p>
                  {areas.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      Crie áreas primeiro.
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-1">
                      {areas.map((a) => {
                        const c = cor(a.cor);
                        return (
                          <label
                            key={a.id}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={liberadas.has(a.id)}
                              disabled={pending}
                              onChange={(e) =>
                                startTransition(() =>
                                  definirPermissaoArea(
                                    u.id,
                                    a.id,
                                    e.target.checked
                                  )
                                )
                              }
                              className="h-4 w-4 rounded border-slate-300 text-brand-600"
                            />
                            <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                            <span className="text-sm text-slate-700">
                              {a.nome}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
