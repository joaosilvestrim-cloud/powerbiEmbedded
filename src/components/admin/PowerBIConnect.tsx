"use client";

import { useState, useTransition } from "react";
import {
  PlugZap,
  CheckCircle2,
  AlertTriangle,
  Download,
  Check,
  Loader2,
} from "lucide-react";
import { importarPainel } from "@/app/admin/actions";

interface Workspace {
  id: string;
  name: string;
}
interface Report {
  id: string;
  name: string;
}

// Se `areaId` for informado, mostra botões para importar cada relatório
// como painel daquela área. Sem `areaId`, funciona só como teste de conexão.
export default function PowerBIConnect({
  configurado,
  areaId,
}: {
  configurado: boolean;
  areaId?: string;
}) {
  const [testando, setTestando] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "erro">("idle");
  const [msg, setMsg] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [wsId, setWsId] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [carregandoRel, setCarregandoRel] = useState(false);
  const [importados, setImportados] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  async function testar() {
    setTestando(true);
    setStatus("idle");
    setMsg(null);
    setReports([]);
    setWsId("");
    try {
      const res = await fetch("/api/admin/pbi/test", { method: "POST" });
      const j = await res.json();
      if (j.ok) {
        setStatus("ok");
        setWorkspaces(j.workspaces ?? []);
        setMsg(`Conexão OK — ${j.workspaces?.length ?? 0} workspace(s).`);
      } else {
        setStatus("erro");
        setMsg(j.error || "Falha na conexão.");
      }
    } catch {
      setStatus("erro");
      setMsg("Erro de rede ao testar.");
    } finally {
      setTestando(false);
    }
  }

  async function carregarReports(id: string) {
    setWsId(id);
    setReports([]);
    if (!id) return;
    setCarregandoRel(true);
    try {
      const res = await fetch("/api/admin/pbi/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: id }),
      });
      const j = await res.json();
      setReports(j.reports ?? []);
    } finally {
      setCarregandoRel(false);
    }
  }

  function importar(r: Report) {
    if (!areaId) return;
    startTransition(async () => {
      await importarPainel(areaId, r.name, wsId, r.id);
      setImportados((s) => new Set(s).add(r.id));
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <button
        onClick={testar}
        disabled={!configurado || testando}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-800 text-white px-4 py-2 text-sm font-medium hover:bg-slate-900 disabled:opacity-50"
      >
        {testando ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PlugZap className="h-4 w-4" />
        )}
        {areaId ? "Buscar relatórios no Power BI" : "Testar conexão"}
      </button>

      {!configurado && (
        <p className="text-xs text-slate-400">
          Configure as credenciais em Administração → Power BI para habilitar.
        </p>
      )}

      {msg && (
        <div
          className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
            status === "ok"
              ? "bg-green-50 text-green-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {status === "ok" ? (
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <span className="break-all">{msg}</span>
        </div>
      )}

      {status === "ok" && workspaces.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-sm block">
            <span className="block text-slate-700 mb-1">Workspace</span>
            <select
              value={wsId}
              onChange={(e) => carregarReports(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Selecione…</option>
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>

          {carregandoRel && (
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> carregando relatórios…
            </p>
          )}

          {wsId && !carregandoRel && reports.length === 0 && (
            <p className="text-sm text-slate-400">
              Nenhum relatório neste workspace.
            </p>
          )}

          {reports.length > 0 && (
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {reports.map((r) => {
                const done = importados.has(r.id);
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between px-3 py-2"
                  >
                    <span className="text-sm text-slate-700 truncate">
                      {r.name}
                    </span>
                    {areaId ? (
                      <button
                        onClick={() => importar(r)}
                        disabled={pending || done}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
                          done
                            ? "bg-green-100 text-green-700"
                            : "bg-brand-600 text-white hover:bg-brand-700"
                        } disabled:opacity-70`}
                      >
                        {done ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> importado
                          </>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5" /> importar
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">
                        {r.id.slice(0, 8)}…
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
