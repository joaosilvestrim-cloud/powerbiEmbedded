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

// Domínio raiz dos subdomínios de clientes (ex.: clienteA.drivedata.com.br).
// Configurável por env; o padrão é o domínio da DriveData.
const ROOT = process.env.NEXT_PUBLIC_TENANT_ROOT || "drivedata.com.br";

// Tenant padrão usado quando a tabela ainda não existe (antes da migração)
// ou quando o host não casa com nenhum cliente.
const PADRAO: Tenant = {
  id: "default",
  nome: "DriveData",
  slug: "app",
  dominio: null,
  logo_url: null,
  cor_primaria: "#0284c7",
  cor_secundaria: "#22c55e",
  ativo: true,
};

// Descobre o tenant pela URL acessada. Ordem:
// 1) domínio próprio do cliente (tenants.dominio)
// 2) subdomínio do domínio raiz (tenants.slug)
// 3) padrão "app"
export const getTenant = cache(async (): Promise<Tenant> => {
  try {
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

    const { data: padrao } = await supabase
      .from("tenants")
      .select("*")
      .eq("slug", "app")
      .maybeSingle();
    return (padrao as Tenant) ?? PADRAO;
  } catch {
    // Tabela ainda não existe (migração não rodada) → padrão.
    return PADRAO;
  }
});
