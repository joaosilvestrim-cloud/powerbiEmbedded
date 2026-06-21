"use client";

import { useEffect, useState } from "react";
import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";
import type { EmbedConfig } from "@/lib/types";

export default function ReportViewer({ relatorioId }: { relatorioId: string }) {
  const [config, setConfig] = useState<EmbedConfig | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
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
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [relatorioId]);

  if (erro) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {erro}
      </div>
    );
  }

  if (!config) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        Carregando relatório...
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
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
        cssClassName="w-full h-[80vh]"
      />
    </div>
  );
}
