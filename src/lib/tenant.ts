import { cache } from "react";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface Tenant {
  id: string;
  nome: string;
  slug: string;
  dominio: string | null;
  logo_url: string | null;
  cor_primaria: string;
  cor_secundaria: string;
  ativo: boolean;
}

// Domínio raiz dos subdomínios de clientes (ex.: clienteA.embeddedbi.drivedata.com.br)
const ROOT = "embeddedbi.drivedata.com.br";

// Descobre o tenant pela URL acessada. Ordem:
// 1) domínio próprio do cliente (tenants.dominio)
// 2) subdomínio do domínio raiz (tenants.slug)
// 3) padrão "app" (produção atual / localhost / preview vercel)
export const getTenant = cache(async (): Promise<Tenant> => {
  const h = await headers();
  const host = (h.get("x-forwarded-host") || h.get("host") || "")
    .split(":")[0]
    .toLowerCase();

  const supabase = await createClient();

  // 1) domínio próprio
  if (host) {
    const { data } = await supabase
      .from("tenants")
      .select("*")
      .eq("dominio", host)
      .eq("ativo", true)
      .maybeSingle();
    if (data) return data as Tenant;
  }

  // 2) subdomínio do domínio raiz
  let slug = "app";
  if (host.endsWith("." + ROOT)) {
    slug = host.slice(0, host.length - ROOT.length - 1).split(".")[0];
  }

  const { data: bySlug } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .eq("ativo", true)
    .maybeSingle();
  if (bySlug) return bySlug as Tenant;

  // 3) padrão
  const { data: padrao } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", "app")
    .single();
  return padrao as Tenant;
});
