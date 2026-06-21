import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import ConfigPowerBI from "@/components/admin/ConfigPowerBI";
import PowerBIConnect from "@/components/admin/PowerBIConnect";

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
      title="Power BI"
      subtitle="Conexão (service principal) e importação de relatórios"
    >
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="space-y-6">
          <Passos />
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

function Passos() {
  const itens = [
    "No Azure AD, registre um app (service principal) e gere um client secret.",
    "No Power BI: habilite o uso de service principals e dê acesso ao workspace.",
    "Cole Tenant ID, Client ID e Secret abaixo e salve.",
    "Clique em “Testar conexão”: o portal lista seus workspaces e relatórios.",
    "Importe os relatórios com um clique — sem precisar achar IDs na mão.",
    "Em “Usuários”, libere cada relatório para quem deve vê-lo.",
  ];
  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
      <h3 className="text-sm font-semibold text-indigo-800 mb-3">
        Como o embed funciona
      </h3>
      <ol className="space-y-2">
        {itens.map((t, i) => (
          <li key={i} className="flex gap-3 text-sm text-slate-700">
            <span className="h-5 w-5 shrink-0 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
              {i + 1}
            </span>
            {t}
          </li>
        ))}
      </ol>
    </div>
  );
}
