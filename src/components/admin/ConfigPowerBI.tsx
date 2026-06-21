"use client";

import { useState, useTransition } from "react";
import { salvarConfigPowerBI } from "@/app/admin/actions";

export default function ConfigPowerBI({
  tenantId,
  clientId,
  secretDefinido,
}: {
  tenantId: string;
  clientId: string;
  secretDefinido: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [salvo, setSalvo] = useState(false);

  return (
    <form
      action={(fd) => {
        setSalvo(false);
        startTransition(async () => {
          await salvarConfigPowerBI(fd);
          setSalvo(true);
        });
      }}
      className="rounded-xl border border-slate-200 bg-white p-4 grid gap-3 max-w-xl"
    >
      <p className="text-sm text-slate-500">
        Credenciais do service principal (Azure AD). O secret fica guardado no
        servidor e nunca é exibido de volta.
      </p>

      <label className="text-sm">
        <span className="block text-slate-700 mb-1">Tenant ID</span>
        <input
          name="tenant_id"
          defaultValue={tenantId}
          placeholder="00000000-0000-0000-0000-000000000000"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
        />
      </label>

      <label className="text-sm">
        <span className="block text-slate-700 mb-1">Client ID</span>
        <input
          name="client_id"
          defaultValue={clientId}
          placeholder="00000000-0000-0000-0000-000000000000"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
        />
      </label>

      <label className="text-sm">
        <span className="block text-slate-700 mb-1">
          Client Secret{" "}
          {secretDefinido && (
            <span className="text-green-600 text-xs">
              (já configurado — deixe em branco para manter)
            </span>
          )}
        </span>
        <input
          name="client_secret"
          type="password"
          placeholder={secretDefinido ? "••••••••" : "cole o secret aqui"}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar configuração"}
        </button>
        {salvo && <span className="text-sm text-green-600">Salvo ✓</span>}
      </div>
    </form>
  );
}
