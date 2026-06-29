import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import ReportViewer from "@/components/ReportViewer";
import IframeViewer from "@/components/IframeViewer";
import PanelSwitcher from "@/components/PanelSwitcher";
import type { Area, Relatorio } from "@/lib/types";

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

  // Área (para breadcrumb) e painéis irmãos (para a troca rápida).
  const [{ data: area }, { data: irmaos }] = await Promise.all([
    relatorio.area_id
      ? supabase.from("areas").select("id, nome").eq("id", relatorio.area_id).single()
      : Promise.resolve({ data: null }),
    relatorio.area_id
      ? supabase
          .from("relatorios")
          .select("id, nome")
          .eq("area_id", relatorio.area_id)
          .eq("ativo", true)
          .order("nome")
      : Promise.resolve({ data: [] }),
  ]);

  const a = area as Pick<Area, "id" | "nome"> | null;

  return (
    <AppShell
      profile={profile}
      title={relatorio.nome}
      breadcrumb={[
        { label: "Meus painéis", href: "/" },
        ...(a ? [{ label: a.nome, href: `/area/${a.id}` }] : []),
        { label: relatorio.nome },
      ]}
      actions={
        <Link
          href={a ? `/area/${a.id}` : "/"}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 press"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      }
    >
      <PanelSwitcher
        paineis={(irmaos ?? []) as { id: string; nome: string }[]}
        atualId={relatorio.id}
      />
      {relatorio.embed_url ? (
        <IframeViewer embedUrl={relatorio.embed_url} titulo={relatorio.nome} />
      ) : (
        <ReportViewer relatorioId={relatorio.id} />
      )}
    </AppShell>
  );
}
