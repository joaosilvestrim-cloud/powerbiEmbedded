"use client";

import { useEffect, useRef, useState } from "react";
import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";
import { Maximize2, RefreshCw, AlertTriangle } from "lucide-react";
import type { EmbedConfig } from "@/lib/types";

export default function ReportViewer({ relatorioId }: { relatorioId: string }) {
  const [config, setConfig] = useState<EmbedConfig | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ativo = true;
    setConfig(null);
    setErro(null);

    (async () => {
      try {
        const res = await fetch("/api/embed-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ relatorioId }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || "Falha ao carregar relatório");
        }
        const data = (await res.json()) as EmbedConfig;
        if (ativo) setConfig(data);
      } catch (e) {
        if (ativo) setErro(e instanceof Error ? e.message : "Erro inesperado");
      }
    })();

    return () => {
      ativo = false;
    };
  }, [relatorioId, tentativa]);

  function fullscreen() {
    wrapRef.current?.requestFullscreen?.();
  }

  if (erro) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
        <p className="mt-3 font-medium text-amber-800">{erro}</p>
        <button
          onClick={() => setTentativa((t) => t + 1)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm text-amber-700 hover:bg-amber-100"
        >
          <RefreshCw className="h-4 w-4" /> Tentar novamente
        </button>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="h-[78vh] w-full animate-pulse bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
          <span className="text-sm text-slate-400">Carregando relatório…</span>
        </div>
      </div>
    );
  }

  return (
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
          id: config.reportId,
          embedUrl: config.embedUrl,
          accessToken: config.accessToken,
          tokenType: models.TokenType.Embed,
          settings: {
            panes: {
              filters: { visible: false },
              pageNavigation: { visible: true },
            },
            background: models.BackgroundType.Transparent,
          },
        }}
        cssClassName="w-full h-[78vh]"
      />
    </div>
  );
}
