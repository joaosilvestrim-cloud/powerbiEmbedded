"use client";

import { useState, useTransition } from "react";
import { criarUsuario, definirRole } from "@/app/admin/actions";
import type { Profile } from "@/lib/types";

export default function UsuariosAdmin({ usuarios }: { usuarios: Profile[] }) {
  const [pending, startTransition] = useTransition();
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Nome</th>
              <th className="text-left px-4 py-2 font-medium">E-mail</th>
              <th className="text-left px-4 py-2 font-medium">Papel</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-2 text-slate-800">{u.nome || "—"}</td>
                <td className="px-4 py-2 text-slate-500">{u.email}</td>
                <td className="px-4 py-2">
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
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {aberto ? (
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
          className="rounded-xl border border-slate-200 bg-white p-4 grid gap-3 sm:grid-cols-3"
        >
          <input
            name="nome"
            required
            placeholder="Nome"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="E-mail"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="senha"
            required
            minLength={6}
            placeholder="Senha temporária"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          {erro && (
            <p className="sm:col-span-3 text-sm text-red-600">{erro}</p>
          )}
          <div className="sm:col-span-3 flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700 disabled:opacity-60"
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
      ) : (
        <button
          onClick={() => setAberto(true)}
          className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700"
        >
          + Novo usuário
        </button>
      )}
    </div>
  );
}
