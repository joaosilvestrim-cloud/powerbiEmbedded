import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  return profile as Profile;
}

// Garante que o usuário é admin; senão, manda para a home.
export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  if (profile.role !== "admin") redirect("/");
  return profile;
}
