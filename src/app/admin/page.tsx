import { requireAdmin } from "@/lib/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import RelatoriosAdmin from "@/components/admin/RelatoriosAdmin";
import UsuariosAdmin from "@/components/admin/UsuariosAdmin";
import PermissoesAdmin from "@/components/admin/PermissoesAdmin";
import ConfigPowerBI from "@/components/admin/ConfigPowerBI";
import type { Profile, Relatorio, Permissao } from "@/lib/types";

export default async function AdminPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const [{ data: relatorios }, { data: usuarios }, { data: permissoes }] =
    await Promise.all([
      supabase.from("relatorios").select("*").order("nome"),
      supabase.from("profiles").select("*").order("nome"),
      supabase.from("permissoes").select("*"),
    ]);

  // Config Power BI lida via service role (RLS bloqueia o navegador).
  // Não enviamos o secret ao cliente — só se ele já existe.
  const { data: cfg } = await createAdminClient()
    .from("config_powerbi")
    .select("tenant_id, client_id, client_secret")
    .eq("id", true)
    .single();

  return (
    <>
      <Nav profile={profile} />
      <main className="max-w-6xl mx-auto px-4 py-8 w-full space-y-10">
        <section>
          <h1 className="text-xl font-semibold text-slate-800 mb-4">
            Administração
          </h1>
          <RelatoriosAdmin relatorios={(relatorios ?? []) as Relatorio[]} />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Usuários
          </h2>
          <UsuariosAdmin usuarios={(usuarios ?? []) as Profile[]} />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Permissões
          </h2>
          <PermissoesAdmin
            usuarios={(usuarios ?? []) as Profile[]}
            relatorios={(relatorios ?? []) as Relatorio[]}
            permissoes={(permissoes ?? []) as Permissao[]}
          />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Power BI
          </h2>
          <ConfigPowerBI
            tenantId={cfg?.tenant_id ?? ""}
            clientId={cfg?.client_id ?? ""}
            secretDefinido={Boolean(cfg?.client_secret)}
          />
        </section>
      </main>
    </>
  );
}
