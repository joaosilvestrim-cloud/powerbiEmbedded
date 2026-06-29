"use client";

import { useRef } from "react";
import { Maximize2 } from "lucide-react";

// Viewer simples para painéis incorporados por link (iframe / Publicar na web).
// Não precisa de token: renderiza a URL diretamente.
export default function IframeViewer({
  embedUrl,
  titulo,
}: {
  embedUrl: string;
  titulo: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={wrapRef}
      className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
    >
      <div className="flex items-center justify-end border-b border-slate-100 px-3 py-2">
        <button
          onClick={() => wrapRef.current?.requestFullscreen?.()}
          title="Tela cheia"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 press"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      <iframe
        title={titulo}
        src={embedUrl}
        className="w-full h-[78vh] border-0"
        allowFullScreen
      />
    </div>
  );
}
