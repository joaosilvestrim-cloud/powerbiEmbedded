import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import ConfigPowerBI from "@/components/admin/ConfigPowerBI";
import PowerBIConnect from "@/components/admin/PowerBIConnect";
import GuiaConfiguracao from "@/components/admin/GuiaConfiguracao";

export default async function AdminPowerBIPage() {
  const profile = await requireAdmin();

  const { data: cfg } = await createAdminClient()
    .from("config_powerbi")
    .select("tenant_id, client_id, client_secret")
    .eq("id", true)
    .single();

  const configurado = Boolean(
    cfg?.tenant_id && cfg?.client_id && cfg?.client_secret
  );

  return (
    <AppShell
      profile={profile}
      title="Power BI (avançado)"
      subtitle="Conexão via service principal — opcional"
    >
      {/* Recomendação: usar painel por link */}
      <Link
        href="/admin/areas"
        className="mb-6 flex items-center gap-3 rounded-2xl border border-accent-400/40 bg-gradient-to-r from-accent-400/10 to-brand-400/10 p-4 hover:shadow-md card-lift"
      >
        <div className="h-10 w-10 shrink-0 rounded-xl bg-brand-gradient flex items-center justify-center text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-800">
            Recomendado: adicionar painel por link
          </p>
          <p className="text-sm text-slate-600">
            Sem Azure. Em <b>Áreas</b>, cole o link “Publicar na web” do Power
            BI e pronto. Esta página só é necessária para o modo avançado.
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" />
      </Link>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="space-y-6">
          <GuiaConfiguracao />
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">
              1. Credenciais do service principal
            </h3>
            <ConfigPowerBI
              tenantId={cfg?.tenant_id ?? ""}
              clientId={cfg?.client_id ?? ""}
              secretDefinido={Boolean(cfg?.client_secret)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">
            2. Testar conexão e importar relatórios
          </h3>
          <PowerBIConnect configurado={configurado} />
        </div>
      </div>
    </AppShell>
  );
}
