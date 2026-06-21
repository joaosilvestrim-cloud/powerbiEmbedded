import Link from "next/link";
import { BarChart3, ArrowRight, Inbox } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import type { Relatorio } from "@/lib/types";

export default async function HomePage() {
  const profile = await getProfile();
  const supabase = await createClient();

  // RLS já filtra para os relatórios que o usuário pode ver.
  const { data } = await supabase
    .from("relatorios")
    .select("*")
    .eq("ativo", true)
    .order("nome");

  const relatorios = (data ?? []) as Relatorio[];

  return (
    <AppShell
      profile={profile}
      title="Relatórios"
      subtitle={`${relatorios.length} relatório(s) disponível(is)`}
    >
      {relatorios.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-slate-600 font-medium">
            Nenhum relatório liberado para você ainda.
          </p>
          {profile.role === "admin" ? (
            <Link
              href="/admin/relatorios"
              className="mt-4 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
            >
              Cadastrar relatórios <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <p className="mt-1 text-sm text-slate-400">
              Peça liberação ao administrador.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relatorios.map((r) => (
            <Link
              key={r.id}
              href={`/relatorio/${r.id}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-400 hover:shadow-md transition"
            >
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-semibold text-slate-800">{r.nome}</h2>
              {r.descricao && (
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {r.descricao}
                </p>
              )}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
                Abrir
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
