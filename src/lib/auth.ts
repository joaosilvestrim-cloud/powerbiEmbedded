import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/tenant";
import type { Profile } from "@/lib/types";

// Retorna o profile do usuário logado (ou redireciona p/ login).
// Usa getSession() (lê do cookie, sem chamada de rede) porque o proxy
// já revalidou o token via getUser() nesta mesma requisição — isso deixa
// a troca de páginas bem mais rápida.
export async function getProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) redirect("/login");

  // Amarração login↔domínio: o usuário de um cliente não pode entrar
  // pelo domínio de outro. Super admin acessa qualquer tenant.
  // Só valida quando o tenant do host é real (após a migração multi-tenant).
  const p = profile as Profile;
  const tenant = await getTenant();
  const tenantReal = tenant.id !== "default";
  if (tenantReal && !p.super_admin && p.tenant_id && p.tenant_id !== tenant.id) {
    redirect("/login?erro=dominio");
  }

  return p;
}

// Garante que o usuário é admin; senão, manda para a home.
export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  if (profile.role !== "admin") redirect("/");
  return profile;
}

// Garante que o usuário é super admin (equipe DriveData); senão, home.
export async function requireSuperAdmin(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile.super_admin) redirect("/");
  return profile;
}
