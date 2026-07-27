import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import AreaPaineisView from "@/components/AreaPaineisView";
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
      <AreaPaineisView paineis={lista} />
    </AppShell>
  );
}
