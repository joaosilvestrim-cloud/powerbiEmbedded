"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Garante que quem chama é admin (RLS reforça no banco, isto é um atalho).
async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (data?.role !== "admin") throw new Error("Acesso negado");
  return supabase;
}

// ============================================================
// Áreas
// ============================================================
export async function criarArea(formData: FormData) {
  const supabase = await assertAdmin();
  await supabase.from("areas").insert({
    nome: String(formData.get("nome") || "").trim(),
    descricao: String(formData.get("descricao") || "").trim(),
    cor: String(formData.get("cor") || "brand").trim(),
  });
  revalidatePath("/admin/areas");
}

export async function atualizarArea(id: string, formData: FormData) {
  const supabase = await assertAdmin();
  await supabase
    .from("areas")
    .update({
      nome: String(formData.get("nome") || "").trim(),
      descricao: String(formData.get("descricao") || "").trim(),
      cor: String(formData.get("cor") || "brand").trim(),
    })
    .eq("id", id);
  revalidatePath("/admin/areas");
}

export async function removerArea(id: string) {
  const supabase = await assertAdmin();
  await supabase.from("areas").delete().eq("id", id);
  revalidatePath("/admin/areas");
}

// ============================================================
// Painéis (relatórios) — sempre dentro de uma área
// ============================================================
// Extrai a URL do que o usuário colar: aceita o link cru (https://…)
// ou o código <iframe ... src="…"> inteiro. Tolerante a sujeira de cópia
// (aspas/%22 grudados, espaços, atributos depois do src).
function extrairEmbedUrl(bruto: string): string {
  const txt = bruto.trim();
  // Captura o src até a primeira aspa, espaço ou ">". Sem src, usa o texto.
  const m = txt.match(/src\s*=\s*["']?([^"'\s>]+)/i);
  let url = (m ? m[1] : txt).trim();
  url = url.split(/\s/)[0]; // corta no primeiro espaço
  url = url.replace(/(?:%22|["'>])+$/i, ""); // remove %22/aspas/"> no fim
  return url;
}

// Cria um painel por LINK de incorporação (iframe / Publicar na web).
export async function criarPainelLink(areaId: string, formData: FormData) {
  const supabase = await assertAdmin();
  const bruto = String(formData.get("embed") || "");
  const embed_url = extrairEmbedUrl(bruto);
  if (!/^https:\/\/app\.powerbi\.com\//i.test(embed_url)) {
    throw new Error(
      "Link inválido. Cole o link 'Publicar na web' ou o código <iframe> do Power BI."
    );
  }
  await supabase.from("relatorios").insert({
    area_id: areaId,
    nome: String(formData.get("nome") || "").trim(),
    descricao: String(formData.get("descricao") || "").trim(),
    embed_url,
  });
  revalidatePath(`/admin/areas/${areaId}`);
}

// Cria um painel pelo modo "App Owns Data" (service principal / IDs).
export async function criarPainel(areaId: string, formData: FormData) {
  const supabase = await assertAdmin();
  await supabase.from("relatorios").insert({
    area_id: areaId,
    nome: String(formData.get("nome") || "").trim(),
    descricao: String(formData.get("descricao") || "").trim(),
    pbi_workspace_id: String(formData.get("workspace_id") || "").trim(),
    pbi_report_id: String(formData.get("report_id") || "").trim(),
  });
  revalidatePath(`/admin/areas/${areaId}`);
}

// Importa um painel direto do Power BI para uma área.
export async function importarPainel(
  areaId: string,
  nome: string,
  workspaceId: string,
  reportId: string
) {
  const supabase = await assertAdmin();
  const { data: existe } = await supabase
    .from("relatorios")
    .select("id")
    .eq("pbi_workspace_id", workspaceId)
    .eq("pbi_report_id", reportId)
    .maybeSingle();
  if (existe) return { jaExiste: true };

  await supabase.from("relatorios").insert({
    area_id: areaId,
    nome,
    pbi_workspace_id: workspaceId,
    pbi_report_id: reportId,
  });
  revalidatePath(`/admin/areas/${areaId}`);
  return { jaExiste: false };
}

export async function atualizarPainel(
  id: string,
  areaId: string,
  formData: FormData
) {
  const supabase = await assertAdmin();
  await supabase
    .from("relatorios")
    .update({
      nome: String(formData.get("nome") || "").trim(),
      descricao: String(formData.get("descricao") || "").trim(),
      rls_role: String(formData.get("rls_role") || "").trim() || null,
    })
    .eq("id", id);
  revalidatePath(`/admin/areas/${areaId}`);
}

export async function togglePainel(id: string, areaId: string, ativo: boolean) {
  const supabase = await assertAdmin();
  await supabase.from("relatorios").update({ ativo }).eq("id", id);
  revalidatePath(`/admin/areas/${areaId}`);
}

export async function removerPainel(id: string, areaId: string) {
  const supabase = await assertAdmin();
  await supabase.from("relatorios").delete().eq("id", id);
  revalidatePath(`/admin/areas/${areaId}`);
}

// ============================================================
// Permissão por ÁREA
// ============================================================
export async function definirPermissaoArea(
  userId: string,
  areaId: string,
  conceder: boolean
) {
  const supabase = await assertAdmin();
  if (conceder) {
    await supabase
      .from("permissoes_area")
      .insert({ user_id: userId, area_id: areaId });
  } else {
    await supabase
      .from("permissoes_area")
      .delete()
      .eq("user_id", userId)
      .eq("area_id", areaId);
  }
  revalidatePath("/admin/usuarios");
}

// Concede exatamente o conjunto de áreas informado (usado por
// "marcar todas" / "limpar"): remove as atuais e insere as novas.
export async function definirAreas(userId: string, areaIds: string[]) {
  const supabase = await assertAdmin();
  await supabase.from("permissoes_area").delete().eq("user_id", userId);
  if (areaIds.length > 0) {
    await supabase
      .from("permissoes_area")
      .insert(areaIds.map((area_id) => ({ user_id: userId, area_id })));
  }
  revalidatePath("/admin/usuarios");
}

// ============================================================
// Usuários
// ============================================================
export async function definirRole(userId: string, role: "admin" | "user") {
  const supabase = await assertAdmin();
  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin/usuarios");
}

// Define a identidade RLS do usuário (valor usado no filtro dinâmico).
export async function definirIdentidadeRls(userId: string, valor: string) {
  const supabase = await assertAdmin();
  await supabase
    .from("profiles")
    .update({ rls_identity: valor.trim() || null })
    .eq("id", userId);
  revalidatePath("/admin/usuarios");
}

// Ativa/desativa o usuário: bane no Auth (bloqueia login) e marca o perfil.
export async function definirAtivo(userId: string, ativo: boolean) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(userId, {
    ban_duration: ativo ? "none" : "876000h",
  });
  await admin.from("profiles").update({ ativo }).eq("id", userId);
  revalidatePath("/admin/usuarios");
}

// Gera uma senha temporária nova e a retorna para o admin repassar.
export async function redefinirSenha(userId: string): Promise<string> {
  await assertAdmin();
  const admin = createAdminClient();
  const nova =
    "Dd" + Math.random().toString(36).slice(2, 8) + Math.floor(10 + Math.random() * 89);
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: nova,
  });
  if (error) throw new Error(error.message);
  return nova;
}

// Remove o usuário (o profile cai por cascade do FK em auth.users).
export async function removerUsuario(userId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
}

export async function criarUsuario(formData: FormData) {
  await assertAdmin();
  const admin = createAdminClient();

  const email = String(formData.get("email") || "").trim();
  const nome = String(formData.get("nome") || "").trim();
  const senha = String(formData.get("senha") || "").trim();

  const { error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
  });
  if (error) throw new Error(error.message);

  await admin.from("profiles").update({ nome, email }).eq("email", email);
  revalidatePath("/admin/usuarios");
}

// ============================================================
// Configuração Power BI
// ============================================================
export async function salvarConfigPowerBI(formData: FormData) {
  await assertAdmin();
  const admin = createAdminClient();

  const tenant_id = String(formData.get("tenant_id") || "").trim();
  const client_id = String(formData.get("client_id") || "").trim();
  const client_secret = String(formData.get("client_secret") || "").trim();

  const update: Record<string, string> = {
    tenant_id,
    client_id,
    atualizado_em: new Date().toISOString(),
  };
  if (client_secret) update.client_secret = client_secret;

  await admin.from("config_powerbi").update(update).eq("id", true);
  revalidatePath("/admin/powerbi");
}
