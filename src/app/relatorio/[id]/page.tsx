import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import ReportViewer from "@/components/ReportViewer";
import type { Relatorio } from "@/lib/types";

export default async function RelatorioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const supabase = await createClient();

  // RLS bloqueia o acesso se o usuário não tiver permissão → notFound.
  const { data } = await supabase
    .from("relatorios")
    .select("*")
    .eq("id", id)
    .eq("ativo", true)
    .single();

  if (!data) notFound();
  const relatorio = data as Relatorio;

  return (
    <AppShell
      profile={profile}
      title={relatorio.nome}
      subtitle={relatorio.descricao || undefined}
      actions={
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      }
    >
      <ReportViewer relatorioId={relatorio.id} />
    </AppShell>
  );
}
