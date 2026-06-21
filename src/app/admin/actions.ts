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

// ---------- Relatórios ----------
export async function criarRelatorio(formData: FormData) {
  const supabase = await assertAdmin();
  await supabase.from("relatorios").insert({
    nome: String(formData.get("nome") || "").trim(),
    descricao: String(formData.get("descricao") || "").trim(),
    pbi_workspace_id: String(formData.get("workspace_id") || "").trim(),
    pbi_report_id: String(formData.get("report_id") || "").trim(),
  });
  revalidatePath("/admin");
}

export async function toggleRelatorio(id: string, ativo: boolean) {
  const supabase = await assertAdmin();
  await supabase.from("relatorios").update({ ativo }).eq("id", id);
  revalidatePath("/admin");
}

export async function removerRelatorio(id: string) {
  const supabase = await assertAdmin();
  await supabase.from("relatorios").delete().eq("id", id);
  revalidatePath("/admin");
}

// ---------- Permissões ----------
export async function definirPermissao(
  userId: string,
  relatorioId: string,
  conceder: boolean
) {
  const supabase = await assertAdmin();
  if (conceder) {
    await supabase
      .from("permissoes")
      .insert({ user_id: userId, relatorio_id: relatorioId });
  } else {
    await supabase
      .from("permissoes")
      .delete()
      .eq("user_id", userId)
      .eq("relatorio_id", relatorioId);
  }
  revalidatePath("/admin");
}

// ---------- Usuários ----------
export async function definirRole(userId: string, role: "admin" | "user") {
  const supabase = await assertAdmin();
  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin");
}

// Cria um usuário com senha temporária (precisa da service role key).
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

  // Garante nome/email no profile (caso o trigger rode antes do metadata).
  await admin
    .from("profiles")
    .update({ nome, email })
    .eq("email", email);

  revalidatePath("/admin");
}
