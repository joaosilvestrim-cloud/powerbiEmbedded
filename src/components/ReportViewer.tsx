"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PowerBIEmbed } from "powerbi-client-react";
import { models, service } from "powerbi-client";
import { Maximize2, RefreshCw, AlertTriangle, ShieldAlert } from "lucide-react";
import { registrarEventoPainel } from "@/lib/perf-client";
import type { EmbedConfig } from "@/lib/types";

interface Estado {
  key: string;
  config?: EmbedConfig;
  erro?: string;
}

export default function ReportViewer({
  relatorioId,
  avisoSemIdentidade,
}: {
  relatorioId: string;
  avisoSemIdentidade?: boolean;
}) {
  const [tentativa, setTentativa] = useState(0);
  const [estado, setEstado] = useState<Estado>({ key: "" });
  const wrapRef = useRef<HTMLDivElement>(null);
  const inicioRef = useRef(0);
  const carregadoRef = useRef(false);

  const reqKey = `${relatorioId}:${tentativa}`;

  // Telemetria: registra a abertura uma vez ao abrir o painel.
  useEffect(() => {
    registrarEventoPainel({ relatorioId, tipo: "abertura" });
    inicioRef.current =
      typeof performance !== "undefined" ? performance.now() : 0;
    carregadoRef.current = false;
  }, [relatorioId]);

  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        const res = await fetch("/api/embed-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ relatorioId }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(
            j.detalhe ? `${j.error} — ${j.detalhe}` : j.error || "Falha ao carregar relatório"
          );
        }
        const data = (await res.json()) as EmbedConfig;
        if (ativo) setEstado({ key: reqKey, config: data });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erro inesperado";
        registrarEventoPainel({ relatorioId, tipo: "erro", detalhe: msg });
        if (ativo) setEstado({ key: reqKey, erro: msg });
      }
    })();

    return () => {
      ativo = false;
    };
  }, [relatorioId, reqKey]);

  // Handlers do Power BI (telemetria). Em useCallback: só rodam em runtime.
  const onRendered = useCallback(() => {
    if (carregadoRef.current) return;
    carregadoRef.current = true;
    const dur =
      typeof performance !== "undefined" && inicioRef.current
        ? performance.now() - inicioRef.current
        : undefined;
    registrarEventoPainel({ relatorioId, tipo: "carregado", duracaoMs: dur });
  }, [relatorioId]);

  const onError = useCallback(
    (event?: service.ICustomEvent<unknown>) => {
      const d = event?.detail as
        | { message?: string; detailedMessage?: string }
        | undefined;
      registrarEventoPainel({
        relatorioId,
        tipo: "erro",
        detalhe: (d && (d.message || d.detailedMessage)) || "Erro no Power BI",
      });
    },
    [relatorioId]
  );

  /* eslint-disable react-hooks/refs -- refs só são lidos dentro dos handlers, em runtime */
  const eventos = useMemo(
    () =>
      new Map<string, (event?: service.ICustomEvent<unknown>) => void>([
        ["rendered", onRendered],
        ["error", onError],
      ]),
    [onRendered, onError]
  );
  /* eslint-enable react-hooks/refs */

  function fullscreen() {
    wrapRef.current?.requestFullscreen?.();
  }

  // Enquanto o resultado não corresponde à requisição atual → carregando.
  const pronto = estado.key === reqKey;

  if (pronto && estado.erro) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
        <p className="mt-3 font-medium text-amber-300">{estado.erro}</p>
        <button
          onClick={() => setTentativa((t) => t + 1)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm text-amber-300 hover:bg-amber-500/15"
        >
          <RefreshCw className="h-4 w-4" /> Tentar novamente
        </button>
      </div>
    );
  }

  if (!pronto || !estado.config) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="h-[78vh] w-full animate-pulse bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
          <span className="text-sm text-slate-400">Carregando relatório…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {avisoSemIdentidade && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
          <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Este painel aplica <b>RLS</b> e seu usuário está{" "}
            <b>sem Identidade RLS</b>. Os dados podem aparecer vazios — peça ao
            administrador para definir sua identidade.
          </span>
        </div>
      )}
      <div
        ref={wrapRef}
        className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
      >
      <div className="flex items-center justify-end gap-2 border-b border-slate-100 px-3 py-2">
        <button
          onClick={() => setTentativa((t) => t + 1)}
          title="Recarregar"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <button
          onClick={fullscreen}
          title="Tela cheia"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      <PowerBIEmbed
        embedConfig={{
          type: "report",
          id: estado.config.reportId,
          embedUrl: estado.config.embedUrl,
          accessToken: estado.config.accessToken,
          tokenType: models.TokenType.Embed,
          settings: {
            panes: {
              filters: { visible: false },
              pageNavigation: { visible: true },
            },
            // Mostra o relatório com o fundo/wallpaper original (layout completo).
            background: models.BackgroundType.Default,
          },
        }}
        eventHandlers={eventos}
        cssClassName="w-full h-[82vh]"
      />
      </div>
    </div>
  );
}
