import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3, ArrowRight, Inbox } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import type { Area, Relatorio } from "@/lib/types";

export default async function AreaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const supabase = await createClient();

  // RLS: só retorna a área se o usuário tiver permissão (ou for admin).
  const { data: area } = await supabase
    .from("areas")
    .select("*")
    .eq("id", id)
    .single();

  if (!area) notFound();

  const { data: paineis } = await supabase
    .from("relatorios")
    .select("*")
    .eq("area_id", id)
    .eq("ativo", true)
    .order("nome");

  const lista = (paineis ?? []) as Relatorio[];

  return (
    <AppShell
      profile={profile}
      title={(area as Area).nome}
      subtitle={(area as Area).descricao || "Painéis da área"}
      actions={
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" /> Áreas
        </Link>
      }
    >
      {lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-slate-600 font-medium">
            Nenhum painel disponível nesta área.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((p) => (
            <Link
              key={p.id}
              href={`/relatorio/${p.id}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-400 hover:shadow-md transition"
            >
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-semibold text-slate-800">{p.nome}</h2>
              {p.descricao && (
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {p.descricao}
                </p>
              )}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                Abrir painel
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
