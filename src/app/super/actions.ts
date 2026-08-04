"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Garante que quem chama é super admin (equipe DriveData).
async function assertSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  const { data } = await supabase
    .from("profiles")
    .select("super_admin")
    .eq("id", user.id)
    .single();
  if (!data?.super_admin) throw new Error("Acesso negado");
  // Usa service role: mexer em tenants é operação de plataforma.
  return createAdminClient();
}

// slug: minúsculas, sem acento, só letras/números/hífen (vira subdomínio).
function normalizarSlug(bruto: string): string {
  return bruto
    .normalize("NFD")
    .replace(/[0300-036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function limparDominio(bruto: string): string | null {
  const d = bruto
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");
  return d || null;
}

export async function criarTenant(formData: FormData) {
  const admin = await assertSuperAdmin();
  const nome = String(formData.get("nome") || "").trim();
  const slug = normalizarSlug(String(formData.get("slug") || nome));
  const dominio = limparDominio(String(formData.get("dominio") || ""));
  if (!nome || !slug) throw new Error("Nome e slug são obrigatórios");

  const { error } = await admin.from("tenants").insert({
    nome,
    slug,
    dominio,
    logo_url: String(formData.get("logo_url") || "").trim() || null,
    cor_primaria: String(formData.get("cor_primaria") || "#0284c7").trim(),
    cor_secundaria: String(formData.get("cor_secundaria") || "#22c55e").trim(),
    ativo: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/super");
}

export async function atualizarTenant(id: string, formData: FormData) {
  const admin = await assertSuperAdmin();
  const nome = String(formData.get("nome") || "").trim();
  const slug = normalizarSlug(String(formData.get("slug") || nome));
  const dominio = limparDominio(String(formData.get("dominio") || ""));
  if (!nome || !slug) throw new Error("Nome e slug são obrigatórios");

  const { error } = await admin
    .from("tenants")
    .update({
      nome,
      slug,
      dominio,
      logo_url: String(formData.get("logo_url") || "").trim() || null,
      cor_primaria: String(formData.get("cor_primaria") || "#0284c7").trim(),
      cor_secundaria: String(formData.get("cor_secundaria") || "#22c55e").trim(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/super");
}

export async function toggleTenant(id: string, ativo: boolean) {
  const admin = await assertSuperAdmin();
  await admin.from("tenants").update({ ativo }).eq("id", id);
  revalidatePath("/super");
}
