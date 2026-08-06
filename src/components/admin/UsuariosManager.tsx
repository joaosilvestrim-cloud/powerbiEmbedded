"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Plus,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown,
  MoreVertical,
  KeyRound,
  Ban,
  CheckCircle2,
  Trash2,
  Copy,
  X,
  Pencil,
  Save,
} from "lucide-react";
import {
  criarUsuario,
  editarUsuario,
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
  areasComRls = [],
}: {
  usuarios: Profile[];
  areas: Area[];
  permissoes: PermissaoArea[];
  areasComRls?: string[];
}) {
  const rlsSet = useMemo(() => new Set(areasComRls), [areasComRls]);
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

  // Edição de dados do usuário (modal)
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Rascunho do painel expandido (salvar explícito, não mais no blur)
  const [rlsDraft, setRlsDraft] = useState("");
  const [areasDraft, setAreasDraft] = useState<Set<string>>(new Set());

  // Seleção em massa
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [bulkArea, setBulkArea] = useState("");
  const [bulkRls, setBulkRls] = useState("");

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

  // Abre o painel de um usuário e carrega os rascunhos (identidade + áreas).
  function abrir(u: Profile) {
    if (expandido === u.id) {
      setExpandido(null);
      return;
    }
    setExpandido(u.id);
    setRlsDraft(u.rls_identity ?? "");
    setAreasDraft(new Set(permsPorUser.get(u.id) ?? []));
  }

  function salvarPainel(u: Profile) {
    startTransition(async () => {
      try {
        await definirIdentidadeRls(u.id, rlsDraft);
        if (!isAdminOf(u)) await definirAreas(u.id, [...areasDraft]);
        toast("Alterações salvas");
        setExpandido(null);
      } catch {
        toast("Erro ao salvar", "erro");
      }
    });
  }

  const isAdminOf = (u: Profile) => u.role === "admin";

  // Rascunho difere do salvo? (habilita o botão Salvar)
  function painelSujo(u: Profile) {
    if (rlsDraft !== (u.rls_identity ?? "")) return true;
    const atual = permsPorUser.get(u.id) ?? new Set<string>();
    if (isAdminOf(u)) return false;
    if (atual.size !== areasDraft.size) return true;
    for (const id of areasDraft) if (!atual.has(id)) return true;
    return false;
  }

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

  function abrirEdicao(u: Profile) {
    setMenu(null);
    setEditUser(u);
    setEditNome(u.nome || "");
    setEditEmail(u.email || "");
  }

  function salvarEdicao() {
    if (!editUser) return;
    startTransition(async () => {
      try {
        await editarUsuario(editUser.id, editNome, editEmail);
        toast("Dados atualizados");
        setEditUser(null);
      } catch (e) {
        toast(e instanceof Error ? e.message : "Erro ao editar", "erro");
      }
    });
  }

  // ── Ações em massa ──
  const selCount = selecionados.size;
  function toggleSel(id: string) {
    setSelecionados((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function toggleSelTodos() {
    setSelecionados((s) =>
      s.size === filtrados.length ? new Set() : new Set(filtrados.map((u) => u.id))
    );
  }
  function bulkAtivo(ativo: boolean) {
    const ids = [...selecionados];
    startTransition(async () => {
      for (const id of ids) await definirAtivo(id, ativo);
      toast(`${ids.length} usuário(s) ${ativo ? "ativados" : "desativados"}`);
      setSelecionados(new Set());
    });
  }
  function bulkLiberarArea() {
    if (!bulkArea) return;
    const ids = [...selecionados];
    startTransition(async () => {
      for (const id of ids) await definirPermissaoArea(id, bulkArea, true);
      toast(`Área liberada para ${ids.length} usuário(s)`);
      setBulkArea("");
      setSelecionados(new Set());
    });
  }
  function bulkIdentidade() {
    const v = bulkRls.trim();
    if (!v) return;
    const ids = [...selecionados];
    startTransition(async () => {
      for (const id of ids) await definirIdentidadeRls(id, v);
      toast(`Identidade RLS aplicada a ${ids.length} usuário(s)`);
      setBulkRls("");
      setSelecionados(new Set());
    });
  }

  // Limpa a seleção quando o filtro muda (evita agir em quem sumiu da lista)
  useEffect(() => {
    setSelecionados(new Set());
  }, [q, roleF, statusF]);

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
          className="lg:ml-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 text-[#ffffff] px-4 py-2 text-sm font-medium hover:bg-brand-700 press"
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
          <label className="text-sm sm:col-span-3">
            <span className="block text-slate-700 mb-1">
              Identidade RLS{" "}
              <span className="text-slate-400 font-normal">
                (opcional — obrigatória se o usuário vai ver painel com RLS)
              </span>
            </span>
            <input
              name="rls_identity"
              placeholder="Ex.: código/CNPJ do cliente — igual ao valor no modelo do Power BI"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
            />
            <span className="mt-1 block text-xs text-slate-400">
              É o valor que a Microsoft usa para filtrar os dados. Sem ele, um
              painel com RLS aparece vazio. Você também pode definir depois.
            </span>
          </label>
          {erro && <p className="sm:col-span-3 text-sm text-red-400">{erro}</p>}
          <div className="sm:col-span-3 flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-brand-600 text-[#ffffff] px-4 py-2 text-sm hover:bg-brand-700 disabled:opacity-60 press"
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

      {/* Barra de ações em massa */}
      {selCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 animate-slide-down">
          <span className="text-sm font-medium text-slate-700">
            {selCount} selecionado(s)
          </span>
          <div className="mx-1 h-4 w-px bg-slate-300" />
          <button
            onClick={() => bulkAtivo(true)}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 press"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Ativar
          </button>
          <button
            onClick={() => bulkAtivo(false)}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 press"
          >
            <Ban className="h-3.5 w-3.5" /> Desativar
          </button>
          <div className="flex items-center gap-1">
            <select
              value={bulkArea}
              onChange={(e) => setBulkArea(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
            >
              <option value="">Liberar área…</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
            <button
              onClick={bulkLiberarArea}
              disabled={pending || !bulkArea}
              className="rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs text-[#ffffff] hover:bg-brand-700 disabled:opacity-50 press"
            >
              Aplicar
            </button>
          </div>
          <div className="flex items-center gap-1">
            <input
              value={bulkRls}
              onChange={(e) => setBulkRls(e.target.value)}
              placeholder="Identidade RLS…"
              className="w-40 rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono"
            />
            <button
              onClick={bulkIdentidade}
              disabled={pending || !bulkRls.trim()}
              className="rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs text-[#ffffff] hover:bg-brand-700 disabled:opacity-50 press"
            >
              Aplicar
            </button>
          </div>
          <button
            onClick={() => setSelecionados(new Set())}
            className="ml-auto rounded-lg px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800"
          >
            Limpar seleção
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white">
        {/* Cabeçalho com selecionar todos */}
        {filtrados.length > 0 && (
          <label className="flex items-center gap-2 border-b border-slate-100 px-4 py-2 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={selCount > 0 && selCount === filtrados.length}
              ref={(el) => {
                if (el) el.indeterminate = selCount > 0 && selCount < filtrados.length;
              }}
              onChange={toggleSelTodos}
              className="h-4 w-4 rounded border-slate-300 text-brand-600"
            />
            Selecionar todos
          </label>
        )}

        <div className="divide-y divide-slate-100">
          {filtrados.length === 0 && (
            <p className="px-4 py-8 text-center text-slate-400 text-sm">
              Nenhum usuário encontrado.
            </p>
          )}
          {filtrados.map((u) => {
            const isAdmin = u.role === "admin";
            const liberadas = permsPorUser.get(u.id) ?? new Set<string>();
            const exp = expandido === u.id;
            const precisaRls =
              !isAdmin &&
              !u.rls_identity &&
              [...liberadas].some((id) => rlsSet.has(id));
            const sel = selecionados.has(u.id);
            return (
              <div
                key={u.id}
                className={`${u.ativo ? "" : "bg-slate-50/60"} ${sel ? "bg-brand-50/40" : ""}`}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={sel}
                    onChange={() => toggleSel(u.id)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600"
                  />
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
                      {precisaRls && (
                        <button
                          onClick={() => abrir(u)}
                          title="Este usuário tem acesso a painel com RLS mas está sem Identidade RLS"
                          className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 hover:bg-amber-100 transition"
                        >
                          <ShieldAlert className="h-3 w-3" /> sem identidade RLS
                        </button>
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
                      onClick={() => abrir(u)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 w-32 justify-center press"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      {liberadas.size} área(s)
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition ${exp ? "rotate-180" : ""}`}
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
                            onClick={() => abrirEdicao(u)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                          >
                            <Pencil className="h-4 w-4" /> Editar dados
                          </button>
                          <button
                            onClick={() => {
                              setMenu(null);
                              abrir(u);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                          >
                            <ShieldCheck className="h-4 w-4" /> Identidade & áreas
                          </button>
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
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" /> Remover usuário
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {exp && (
                  <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 animate-slide-down overflow-hidden space-y-3">
                    {/* Identidade RLS */}
                    <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-3.5">
                      <div className="mb-2 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-violet-700" />
                        <span className="text-sm font-semibold text-slate-800">
                          Identidade RLS
                        </span>
                      </div>
                      <p className="mb-2 text-xs leading-relaxed text-slate-500">
                        O valor que a Microsoft usa para filtrar os dados desta
                        pessoa nos painéis com RLS. Igual ao que está no modelo
                        (e-mail, CNPJ ou código).
                      </p>
                      <input
                        value={rlsDraft}
                        onChange={(e) => setRlsDraft(e.target.value)}
                        placeholder="Ex.: joao@empresa.com"
                        className="w-full sm:max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                      />
                      {!isAdmin && precisaRls && !rlsDraft.trim() && (
                        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700">
                          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                          Este usuário acessa painel com RLS. Sem preencher, ele
                          verá vazio.
                        </p>
                      )}
                    </div>

                    {isAdmin && (
                      <p className="text-xs text-slate-400">
                        Admin vê todas as áreas. A Identidade RLS acima só é usada
                        quando o próprio admin abre um painel com RLS.
                      </p>
                    )}

                    {!isAdmin && (
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-medium text-slate-500">
                            Áreas liberadas para {u.nome || u.email}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setAreasDraft(new Set(areas.map((a) => a.id)))
                              }
                              className="text-xs text-brand-600 hover:underline"
                            >
                              Marcar todas
                            </button>
                            <button
                              onClick={() => setAreasDraft(new Set())}
                              className="text-xs text-slate-500 hover:underline"
                            >
                              Limpar
                            </button>
                          </div>
                        </div>
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
                                    checked={areasDraft.has(a.id)}
                                    onChange={(e) =>
                                      setAreasDraft((prev) => {
                                        const n = new Set(prev);
                                        if (e.target.checked) n.add(a.id);
                                        else n.delete(a.id);
                                        return n;
                                      })
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-brand-600"
                                  />
                                  <span
                                    className={`h-2.5 w-2.5 rounded-full ${c.dot}`}
                                  />
                                  <span className="text-sm text-slate-700">
                                    {a.nome}
                                  </span>
                                  {rlsSet.has(a.id) && (
                                    <span
                                      title="Área com painel que usa RLS"
                                      className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700"
                                    >
                                      <ShieldCheck className="h-3 w-3" /> RLS
                                    </span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Botão de salvar explícito */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => salvarPainel(u)}
                        disabled={pending || !painelSujo(u)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-[#ffffff] hover:bg-brand-700 disabled:opacity-50 press"
                      >
                        <Save className="h-4 w-4" /> Salvar alterações
                      </button>
                      <button
                        onClick={() => setExpandido(null)}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-white"
                      >
                        Fechar
                      </button>
                      {painelSujo(u) && (
                        <span className="text-xs text-amber-600">
                          alterações não salvas
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de edição de dados */}
      {editUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setEditUser(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">
                Editar dados do usuário
              </h3>
              <button
                onClick={() => setEditUser(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-slate-700">Nome</span>
                <input
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-700">E-mail</span>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <span className="mt-1 block text-xs text-slate-400">
                  Mudar o e-mail altera também o login do usuário.
                </span>
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={salvarEdicao}
                disabled={pending || !editNome.trim() || !editEmail.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-[#ffffff] hover:bg-brand-700 disabled:opacity-50 press"
              >
                <Save className="h-4 w-4" /> Salvar
              </button>
              <button
                onClick={() => setEditUser(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
