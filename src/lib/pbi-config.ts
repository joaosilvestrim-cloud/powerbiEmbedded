import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { PbiCredenciais } from "@/lib/powerbi";

// Confirma que o requisitante é admin. Retorna null se não for.
export async function ensureAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return data?.role === "admin";
}

// Lê as credenciais do Power BI via service role (servidor).
// Retorna null se ainda não estiverem configuradas.
export async function loadPbiCred(): Promise<PbiCredenciais | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("config_powerbi")
    .select("tenant_id, client_id, client_secret")
    .eq("id", true)
    .single();
  if (!data?.tenant_id || !data?.client_id || !data?.client_secret) return null;
  return data as PbiCredenciais;
}
