"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";

interface PainelMin {
  id: string;
  nome: string;
}

// Abas para alternar entre os painéis da mesma área sem voltar.
export default function PanelSwitcher({
  paineis,
  atualId,
}: {
  paineis: PainelMin[];
  atualId: string;
}) {
  if (paineis.length < 2) return null;

  return (
    <div className="mb-4 -mx-1 overflow-x-auto">
      <div className="flex gap-2 px-1 pb-1">
        {paineis.map((p) => {
          const ativo = p.id === atualId;
          return (
            <Link
              key={p.id}
              href={`/relatorio/${p.id}`}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-sm press ${
                ativo
                  ? "border-brand-300 bg-brand-50 text-brand-700 font-medium"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              {p.nome}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
