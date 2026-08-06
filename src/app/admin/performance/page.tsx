import Link from "next/link";
import { Eye, Users, Timer, AlertTriangle } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

const PERIODOS = [
  { dias: 7, label: "7 dias" },
  { dias: 30, label: "30 dias" },
  { dias: 90, label: "90 dias" },
];

type Resumo = {
  total_aberturas: number;
  usuarios_ativos: number;
  tempo_medio_ms: number | null;
  erros: number;
};

type LinhaPainel = {
  relatorio_id: string | null;
  nome: string;
  aberturas: number;
  usuarios: number;
  tempo_medio_ms: number | null;
  erros: number;
  ultimo_acesso: string | null;
};

function fmtTempo(ms: number | null): string {
  if (ms == null) return "—";
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;
}

function fmtData(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}

export default async function PerformancePage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  const profile = await requireAdmin();
  const sp = await searchParams;
  const dias = [7, 30, 90].includes(Number(sp.dias)) ? Number(sp.dias) : 30;

  const supabase = await createClient();
  const [{ data: resumoData }, { data: painelData }] = await Promise.all([
    supabase.rpc("perf_resumo", { p_dias: dias }),
    supabase.rpc("perf_por_painel", { p_dias: dias }),
  ]);

  const resumo: Resumo = (Array.isArray(resumoData) ? resumoData[0] : null) ?? {
    total_aberturas: 0,
    usuarios_ativos: 0,
    tempo_medio_ms: null,
    erros: 0,
  };
  const paineis = (painelData ?? []) as LinhaPainel[];

  const cards = [
    {
      label: "Aberturas",
      valor: resumo.total_aberturas ?? 0,
      icon: Eye,
      cor: "bg-sky-500/15 text-sky-500",
    },
    {
      label: "Usuários ativos",
      valor: resumo.usuarios_ativos ?? 0,
      icon: Users,
      cor: "bg-violet-500/15 text-violet-500",
    },
    {
      label: "Tempo médio de carga",
      valor: fmtTempo(resumo.tempo_medio_ms),
      icon: Timer,
      cor: "bg-emerald-500/15 text-emerald-500",
    },
    {
      label: "Erros",
      valor: resumo.erros ?? 0,
      icon: AlertTriangle,
      cor: "bg-amber-500/15 text-amber-500",
    },
  ];

  return (
    <AppShell
      profile={profile}
      title="Desempenho"
      subtitle="Uso e velocidade dos painéis"
      actions={
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {PERIODOS.map((p) => (
            <Link
              key={p.dias}
              href={`/admin/performance?dias=${p.dias}`}
              className={`rounded-md px-3 py-1 text-sm press ${
                dias === p.dias
                  ? "bg-brand-600 text-[#ffffff]"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div
                className={`h-11 w-11 rounded-2xl flex items-center justify-center ring-1 ring-inset ring-white/10 ${c.cor}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-3xl font-bold text-brand-gradient leading-none">
                {c.valor}
              </p>
              <p className="mt-2 text-sm text-slate-500">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Por painel</h2>
          <p className="text-sm text-slate-500">
            Últimos {dias} dias
          </p>
        </div>

        {paineis.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            Ainda não há acessos registrados neste período. Os dados aparecem
            conforme os usuários abrem os painéis.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="px-5 py-3 font-medium">Painel</th>
                  <th className="px-5 py-3 font-medium text-right">Aberturas</th>
                  <th className="px-5 py-3 font-medium text-right">Usuários</th>
                  <th className="px-5 py-3 font-medium text-right">
                    Tempo médio
                  </th>
                  <th className="px-5 py-3 font-medium text-right">Erros</th>
                  <th className="px-5 py-3 font-medium text-right">
                    Último acesso
                  </th>
                </tr>
              </thead>
              <tbody>
                {paineis.map((p, i) => (
                  <tr
                    key={p.relatorio_id ?? `r-${i}`}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {p.relatorio_id ? (
                        <Link
                          href={`/relatorio/${p.relatorio_id}`}
                          className="hover:text-brand-600"
                        >
                          {p.nome}
                        </Link>
                      ) : (
                        p.nome
                      )}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {p.aberturas}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {p.usuarios}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {fmtTempo(p.tempo_medio_ms)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {p.erros > 0 ? (
                        <span className="text-amber-600 font-medium">
                          {p.erros}
                        </span>
                      ) : (
                        "0"
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-500">
                      {fmtData(p.ultimo_acesso)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
