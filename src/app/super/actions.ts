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
    .replace(/[̀-ͯ]/g, "") // remove acentos
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

const BUCKET_LOGOS = "tenant-logos";

// Sobe o arquivo de logo pro Storage e devolve a URL pública.
// Retorna null quando não veio arquivo (aí o logo atual é mantido).
async function subirLogo(
  admin: ReturnType<typeof createAdminClient>,
  file: FormDataEntryValue | null,
  slug: string
): Promise<string | null> {
  if (!file || typeof file === "string") return null;
  const blob = file as File;
  if (!blob.size) return null;
  if (blob.size > 4 * 1024 * 1024)
    throw new Error("Logo muito grande (máx. 4MB).");
  if (!blob.type.startsWith("image/"))
    throw new Error("O logo precisa ser uma imagem.");

  // Garante o bucket público (idempotente).
  try {
    await admin.storage.createBucket(BUCKET_LOGOS, { public: true });
  } catch {
    // bucket já existe
  }

  const ext = (blob.name.split(".").pop() || "png").toLowerCase();
  const path = `${slug}-${Date.now()}.${ext}`;
  const { error } = await admin.storage
    .from(BUCKET_LOGOS)
    .upload(path, blob, { upsert: true, contentType: blob.type });
  if (error) throw new Error("Falha ao subir o logo: " + error.message);

  const { data } = admin.storage.from(BUCKET_LOGOS).getPublicUrl(path);
  return data.publicUrl;
}

export async function criarTenant(formData: FormData) {
  const admin = await assertSuperAdmin();
  const nome = String(formData.get("nome") || "").trim();
  const slug = normalizarSlug(String(formData.get("slug") || nome));
  const dominio = limparDominio(String(formData.get("dominio") || ""));
  if (!nome || !slug) throw new Error("Nome e slug são obrigatórios");

  const logoSubido = await subirLogo(admin, formData.get("logo_file"), slug);

  const { error } = await admin.from("tenants").insert({
    nome,
    slug,
    dominio,
    logo_url: logoSubido,
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

  const logoSubido = await subirLogo(admin, formData.get("logo_file"), slug);

  const payload: Record<string, unknown> = {
    nome,
    slug,
    dominio,
    cor_primaria: String(formData.get("cor_primaria") || "#0284c7").trim(),
    cor_secundaria: String(formData.get("cor_secundaria") || "#22c55e").trim(),
  };
  // Só troca o logo se um novo arquivo foi enviado (senão mantém o atual).
  if (logoSubido) payload.logo_url = logoSubido;

  const { error } = await admin.from("tenants").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/super");
}

export async function toggleTenant(id: string, ativo: boolean) {
  const admin = await assertSuperAdmin();
  await admin.from("tenants").update({ ativo }).eq("id", id);
  revalidatePath("/super");
}
