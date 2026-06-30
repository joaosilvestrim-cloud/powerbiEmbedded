import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import PaineisManager from "@/components/admin/PaineisManager";
import PowerBIConnect from "@/components/admin/PowerBIConnect";
import AreaUsuarios from "@/components/admin/AreaUsuarios";
import type { Area, Relatorio, Profile } from "@/lib/types";

export default async function AreaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireAdmin();
  const supabase = await createClient();

  const [
    { data: area },
    { data: paineis },
    { data: cfg },
    { data: usuarios },
    { data: perms },
  ] = await Promise.all([
    supabase.from("areas").select("*").eq("id", id).single(),
    supabase.from("relatorios").select("*").eq("area_id", id).order("nome"),
    createAdminClient()
      .from("config_powerbi")
      .select("tenant_id, client_id, client_secret")
      .eq("id", true)
      .single(),
    supabase.from("profiles").select("*").order("nome"),
    supabase.from("permissoes_area").select("user_id").eq("area_id", id),
  ]);

  if (!area) notFound();

  const comAcesso = ((perms ?? []) as { user_id: string }[]).map(
    (p) => p.user_id
  );

  const configurado = Boolean(
    cfg?.tenant_id && cfg?.client_id && cfg?.client_secret
  );

  return (
    <AppShell
      profile={profile}
      title={(area as Area).nome}
      breadcrumb={[
        { label: "Áreas", href: "/admin/areas" },
        { label: (area as Area).nome },
      ]}
      actions={
        <Link
          href="/admin/areas"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 press"
        >
          <ArrowLeft className="h-4 w-4" /> Áreas
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">
              Painéis da área
            </h3>
            <PaineisManager
              areaId={id}
              paineis={(paineis ?? []) as Relatorio[]}
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">
              Acesso de usuários
            </h3>
            <AreaUsuarios
              areaId={id}
              usuarios={(usuarios ?? []) as Profile[]}
              comAcesso={comAcesso}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">
            Avançado — importar via service principal
          </h3>
          <p className="text-xs text-slate-500 mb-2">
            Opcional. Só para o modo “App Owns Data” (com Azure configurado em
            Power BI). Para a maioria dos casos, use o link de incorporação ao
            lado.
          </p>
          <PowerBIConnect configurado={configurado} areaId={id} />
        </div>
      </div>
    </AppShell>
  );
}
