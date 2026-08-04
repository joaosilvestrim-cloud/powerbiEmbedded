import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { PbiCredenciais } from "@/lib/powerbi";

// Confirma que o requisitante é admin e devolve o tenant dele.
// Retorna null se não for admin.
export async function adminTenant(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("role, tenant_id")
    .eq("id", user.id)
    .single();
  if (data?.role !== "admin") return null;
  return (data.tenant_id as string) ?? null;
}

// Lê as credenciais do Power BI de um tenant via service role (servidor).
// pbi_tenant_id é o Tenant ID do Azure. Retorna null se não configurado.
export async function loadPbiCred(
  tenantId: string | null
): Promise<PbiCredenciais | null> {
  if (!tenantId) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("config_powerbi")
    .select("pbi_tenant_id, client_id, client_secret")
    .eq("org_id", tenantId)
    .maybeSingle();
  if (!data?.pbi_tenant_id || !data?.client_id || !data?.client_secret)
    return null;
  return {
    tenant_id: data.pbi_tenant_id,
    client_id: data.client_id,
    client_secret: data.client_secret,
  };
}
