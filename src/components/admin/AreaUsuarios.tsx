"use client";

import { useMemo, useState, useTransition } from "react";
import { Users } from "lucide-react";
import { definirPermissaoArea } from "@/app/admin/actions";
import { useToast } from "@/components/Toast";
import SearchInput from "@/components/SearchInput";
import type { Profile } from "@/lib/types";

// Gerencia quem tem acesso a ESTA área (visão por área).
export default function AreaUsuarios({
  areaId,
  usuarios,
  comAcesso,
}: {
  areaId: string;
  usuarios: Profile[];
  comAcesso: string[];
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const acessoSet = useMemo(() => new Set(comAcesso), [comAcesso]);

  const termo = q.trim().toLowerCase();
  const filtrados = termo
    ? usuarios.filter(
        (u) =>
          (u.nome || "").toLowerCase().includes(termo) ||
          u.email.toLowerCase().includes(termo)
      )
    : usuarios;

  const naoAdmins = filtrados.filter((u) => u.role !== "admin");

  function toggle(userId: string, conceder: boolean) {
    startTransition(async () => {
      await definirPermissaoArea(userId, areaId, conceder);
      toast(conceder ? "Acesso concedido" : "Acesso removido");
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2 text-slate-700">
        <Users className="h-4 w-4 text-brand-600" />
        <h3 className="text-sm font-semibold">Quem vê esta área</h3>
        <span className="text-xs text-slate-400">
          ({acessoSet.size} liberado(s))
        </span>
      </div>

      <SearchInput value={q} onChange={setQ} placeholder="Buscar usuário…" />

      <div className="text-xs text-slate-400">
        Administradores veem todas as áreas automaticamente.
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-100">
        {naoAdmins.length === 0 && (
          <p className="px-3 py-6 text-center text-slate-400 text-sm">
            Nenhum usuário comum {termo ? "encontrado" : "cadastrado"}.
          </p>
        )}
        {naoAdmins.map((u) => (
          <label
            key={u.id}
            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={acessoSet.has(u.id)}
              disabled={pending}
              onChange={(e) => toggle(u.id, e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600"
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-slate-800 truncate">
                {u.nome || u.email}
              </div>
              {u.nome && (
                <div className="text-xs text-slate-400 truncate">{u.email}</div>
              )}
            </div>
            {!u.ativo && (
              <span className="text-[11px] text-slate-400">inativo</span>
            )}
          </label>
        ))}
      </div>

      {naoAdmins.length > 0 && (
        <div className="flex gap-3 text-xs">
          <button
            onClick={() =>
              startTransition(async () => {
                for (const u of naoAdmins)
                  await definirPermissaoArea(u.id, areaId, true);
                toast("Acesso concedido a todos");
              })
            }
            className="text-brand-600 hover:underline"
          >
            Liberar para todos
          </button>
          <button
            onClick={() =>
              startTransition(async () => {
                for (const u of naoAdmins)
                  await definirPermissaoArea(u.id, areaId, false);
                toast("Acesso removido de todos");
              })
            }
            className="text-slate-500 hover:underline"
          >
            Remover de todos
          </button>
        </div>
      )}
    </div>
  );
}
