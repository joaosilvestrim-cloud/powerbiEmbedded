"use client";

import { useMemo, useState, useTransition } from "react";
import { definirPermissao } from "@/app/admin/actions";
import type { Profile, Relatorio, Permissao } from "@/lib/types";

export default function PermissoesAdmin({
  usuarios,
  relatorios,
  permissoes,
}: {
  usuarios: Profile[];
  relatorios: Relatorio[];
  permissoes: Permissao[];
}) {
  const [pending, startTransition] = useTransition();
  const naoAdmins = usuarios.filter((u) => u.role !== "admin");
  const [userId, setUserId] = useState(naoAdmins[0]?.id ?? "");

  // Conjunto de relatórios já liberados para o usuário selecionado.
  const liberados = useMemo(() => {
    const set = new Set<string>();
    permissoes
      .filter((p) => p.user_id === userId)
      .forEach((p) => set.add(p.relatorio_id));
    return set;
  }, [permissoes, userId]);

  if (naoAdmins.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Cadastre usuários (papel “user”) para liberar relatórios. Admins já
        veem todos.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-600">Usuário:</label>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          {naoAdmins.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome || u.email}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        {relatorios.length === 0 && (
          <p className="px-4 py-6 text-center text-slate-400 text-sm">
            Nenhum relatório cadastrado.
          </p>
        )}
        {relatorios.map((r) => {
          const temAcesso = liberados.has(r.id);
          return (
            <label
              key={r.id}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={temAcesso}
                disabled={pending}
                onChange={(e) =>
                  startTransition(() =>
                    definirPermissao(userId, r.id, e.target.checked)
                  )
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              <span className="text-sm text-slate-800">{r.nome}</span>
              {!r.ativo && (
                <span className="text-xs text-slate-400">(inativo)</span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
