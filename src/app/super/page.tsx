import { requireSuperAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import TenantsManager from "@/components/super/TenantsManager";
import type { Tenant } from "@/lib/tenant";

export default async function SuperPage() {
  const profile = await requireSuperAdmin();
  const admin = createAdminClient();

  const [{ data: tenants }, { data: profiles }, { data: areas }] =
    await Promise.all([
      admin.from("tenants").select("*").order("criado_em"),
      admin.from("profiles").select("tenant_id"),
      admin.from("areas").select("tenant_id"),
    ]);

  const contUsuarios = new Map<string, number>();
  (profiles ?? []).forEach((p: { tenant_id: string | null }) => {
    if (p.tenant_id)
      contUsuarios.set(p.tenant_id, (contUsuarios.get(p.tenant_id) ?? 0) + 1);
  });
  const contAreas = new Map<string, number>();
  (areas ?? []).forEach((a: { tenant_id: string | null }) => {
    if (a.tenant_id)
      contAreas.set(a.tenant_id, (contAreas.get(a.tenant_id) ?? 0) + 1);
  });

  const lista = ((tenants ?? []) as Tenant[]).map((t) => ({
    ...t,
    usuarios: contUsuarios.get(t.id) ?? 0,
    areas: contAreas.get(t.id) ?? 0,
  }));

  return (
    <AppShell
      profile={profile}
      title="Clientes"
      subtitle="Gestão de tenants da plataforma"
    >
      <TenantsManager tenants={lista} />
    </AppShell>
  );
}
