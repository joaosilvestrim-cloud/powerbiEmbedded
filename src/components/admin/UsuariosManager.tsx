"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  ChevronDown,
  MoreVertical,
  KeyRound,
  Ban,
  CheckCircle2,
  Trash2,
  Copy,
  X,
} from "lucide-react";
import {
  criarUsuario,
  definirRole,
  definirPermissaoArea,
  definirAreas,
  definirAtivo,
  definirIdentidadeRls,
  redefinirSenha,
  removerUsuario,
} from "@/app/admin/actions";
import { cor } from "@/lib/cores";
import { useToast } from "@/components/Toast";
import SearchInput from "@/components/SearchInput";
import type { Profile, Area, PermissaoArea } from "@/lib/types";

type RoleFiltro = "todos" | "admin" | "user";
type StatusFiltro = "todos" | "ativos" | "inativos";

export default function UsuariosManager({
  usuarios,
  areas,
  permissoes,
}: {
  usuarios: Profile[];
  areas: Area[];
  permissoes: PermissaoArea[];
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [roleF, setRoleF] = useState<RoleFiltro>("todos");
  const [statusF, setStatusF] = useState<StatusFiltro>("todos");
  const [senhaGerada, setSenhaGerada] = useState<{
    nome: string;
    senha: string;
  } | null>(null);

  const permsPorUser = useMemo(() => {
    const m = new Map<string, Set<string>>();
    permissoes.forEach((p) => {
      if (!m.has(p.user_id)) m.set(p.user_id, new Set());
      m.get(p.user_id)!.add(p.area_id);
    });
    return m;
  }, [permissoes]);

  const termo = q.trim().toLowerCase();
  const filtrados = usuarios.filter((u) => {
    if (roleF !== "todos" && u.role !== roleF) return false;
    if (statusF === "ativos" && !u.ativo) return false;
    if (statusF === "inativos" && u.ativo) return false;
    if (
      termo &&
      !(u.nome || "").toLowerCase().includes(termo) &&
      !u.email.toLowerCase().includes(termo)
    )
      return false;
    return true;
  });

  const totalAdmins = usuarios.filter((u) => u.role === "admin").length;

  function acaoSenha(u: Profile) {
    setMenu(null);
    startTransition(async () => {
      try {
        const senha = await redefinirSenha(u.id);
        setSenhaGerada({ nome: u.nome || u.email, senha });
      } catch {
        toast("Erro ao redefinir senha", "erro");
      }
    });
  }

  function acaoAtivo(u: Profile) {
    setMenu(null);
    startTransition(async () => {
      await definirAtivo(u.id, !u.ativo);
      toast(u.ativo ? "Usuário desativado" : "Usuário ativado");
    });
  }

  function acaoRemover(u: Profile) {
    setMenu(null);
    if (!confirm(`Remover ${u.nome || u.email}? Esta ação é definitiva.`))
      return;
    startTransition(async () => {
      try {
        await removerUsuario(u.id);
        toast("Usuário removido");
      } catch {
        toast("Erro ao remover", "erro");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Banner da senha gerada */}
      {senhaGerada && (
        <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 p-3 animate-slide-down">
          <KeyRound className="h-5 w-5 text-brand-600 shrink-0" />
          <div className="flex-1 text-sm text-slate-700">
            Senha temporária de <b>{senhaGerada.nome}</b>:{" "}
            <code className="font-mono bg-white px-2 py-0.5 rounded border border-brand-200">
              {senhaGerada.senha}
            </code>{" "}
            <span className="text-slate-500">— repasse e peça para trocar.</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(senhaGerada.senha);
              toast("Senha copiada");
            }}
            className="rounded-lg p-1.5 text-brand-600 hover:bg-white press"
            title="Copiar"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSenhaGerada(null)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Barra de ferramentas */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Buscar por nome ou e-mail…"
        />
        <div className="flex items-center gap-2">
          <select
            value={roleF}
            onChange={(e) => setRoleF(e.target.value as RoleFiltro)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="todos">Todos os papéis</option>
            <option value="admin">Administradores</option>
            <option value="user">Usuários</option>
          </select>
          <select
            value={statusF}
            onChange={(e) => setStatusF(e.target.value as StatusFiltro)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="todos">Todos os status</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </select>
        </div>
        <button
          onClick={() => setAberto((v) => !v)}
          className="lg:ml-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700 press"
        >
          <Plus className="h-4 w-4" /> Novo usuário
        </button>
      </div>

      <p className="text-xs text-slate-400">
        {filtrados.length} de {usuarios.length} usuário(s) • {totalAdmins}{" "}
        administrador(es)
      </p>

      {aberto && (
        <form
          action={(fd) => {
            setErro(null);
            startTransition(async () => {
              try {
                await criarUsuario(fd);
                setAberto(false);
                toast("Usuário criado");
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
              className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm hover:bg-brand-700 disabled:opacity-60 press"
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
        {filtrados.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-400 text-sm">
            Nenhum usuário encontrado.
          </p>
        )}
        {filtrados.map((u) => {
          const isAdmin = u.role === "admin";
          const liberadas = permsPorUser.get(u.id) ?? new Set<string>();
          const exp = expandido === u.id;
          return (
            <div key={u.id} className={u.ativo ? "" : "bg-slate-50/60"}>
              <div className="flex items-center gap-3 px-4 py-3">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold ${
                    u.ativo
                      ? "bg-slate-100 text-slate-600"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {(u.nome || u.email).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800 truncate">
                      {u.nome || "—"}
                    </span>
                    {!u.ativo && (
                      <span className="rounded-full bg-slate-200 text-slate-500 px-2 py-0.5 text-[11px]">
                        inativo
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {u.email}
                  </div>
                </div>

                <select
                  defaultValue={u.role}
                  disabled={pending}
                  onChange={(e) =>
                    startTransition(async () => {
                      await definirRole(
                        u.id,
                        e.target.value as "admin" | "user"
                      );
                      toast("Papel atualizado");
                    })
                  }
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>

                {isAdmin ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs text-brand-600 w-32 justify-end">
                    <ShieldCheck className="h-4 w-4" /> todas as áreas
                  </span>
                ) : (
                  <button
                    onClick={() => setExpandido(exp ? null : u.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 w-32 justify-center press"
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

                {/* Menu de ações */}
                <div className="relative">
                  <button
                    onClick={() => setMenu(menu === u.id ? null : u.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 press"
                    title="Ações"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {menu === u.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenu(null)}
                      />
                      <div className="absolute right-0 mt-1 w-52 rounded-xl border border-slate-200 bg-white shadow-lg p-1 z-20 animate-scale-in origin-top-right">
                        <button
                          onClick={() => acaoSenha(u)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                          <KeyRound className="h-4 w-4" /> Redefinir senha
                        </button>
                        <button
                          onClick={() => acaoAtivo(u)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                          {u.ativo ? (
                            <>
                              <Ban className="h-4 w-4" /> Desativar acesso
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" /> Reativar acesso
                            </>
                          )}
                        </button>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          onClick={() => acaoRemover(u)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" /> Remover usuário
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {exp && !isAdmin && (
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 animate-slide-down overflow-hidden space-y-3">
                  <label className="block text-xs text-slate-500">
                    Identidade RLS (filtro de dados — usado no RLS dinâmico do
                    Power BI)
                    <input
                      defaultValue={u.rls_identity ?? ""}
                      placeholder="Ex.: 123 / cnpj do cliente / e-mail"
                      onBlur={(e) => {
                        const v = e.target.value;
                        if (v !== (u.rls_identity ?? ""))
                          startTransition(async () => {
                            await definirIdentidadeRls(u.id, v);
                            toast("Identidade RLS salva");
                          });
                      }}
                      className="mt-1 w-full sm:max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                    />
                  </label>

                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-slate-500">
                      Áreas liberadas para {u.nome || u.email}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          startTransition(async () => {
                            await definirAreas(
                              u.id,
                              areas.map((a) => a.id)
                            );
                            toast("Todas as áreas liberadas");
                          })
                        }
                        className="text-xs text-brand-600 hover:underline"
                      >
                        Marcar todas
                      </button>
                      <button
                        onClick={() =>
                          startTransition(async () => {
                            await definirAreas(u.id, []);
                            toast("Áreas removidas");
                          })
                        }
                        className="text-xs text-slate-500 hover:underline"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>
                  {areas.length === 0 ? (
                    <p className="text-xs text-slate-400">Crie áreas primeiro.</p>
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
                                startTransition(async () => {
                                  await definirPermissaoArea(
                                    u.id,
                                    a.id,
                                    e.target.checked
                                  );
                                  toast(
                                    e.target.checked
                                      ? "Área liberada"
                                      : "Acesso removido"
                                  );
                                })
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
