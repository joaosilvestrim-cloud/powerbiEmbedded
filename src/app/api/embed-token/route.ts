import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateEmbed } from "@/lib/powerbi";

// POST /api/embed-token  { relatorioId }
// Valida autenticação + permissão (via RLS) e devolve o embed token.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let relatorioId: string | undefined;
  try {
    const body = await request.json();
    relatorioId = body.relatorioId;
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }
  if (!relatorioId) {
    return NextResponse.json(
      { error: "relatorioId obrigatório" },
      { status: 400 }
    );
  }

  // A política RLS de `relatorios` só retorna a linha se o usuário
  // for admin OU tiver permissão — então isto já é o controle de acesso.
  const { data: relatorio, error } = await supabase
    .from("relatorios")
    .select("id, pbi_workspace_id, pbi_report_id, ativo")
    .eq("id", relatorioId)
    .eq("ativo", true)
    .single();

  if (error || !relatorio) {
    return NextResponse.json(
      { error: "Relatório não encontrado ou sem permissão" },
      { status: 403 }
    );
  }

  // Credenciais do service principal — lidas via service role (servidor),
  // nunca expostas ao navegador.
  const admin = createAdminClient();
  const { data: cred } = await admin
    .from("config_powerbi")
    .select("tenant_id, client_id, client_secret")
    .eq("id", true)
    .single();

  if (!cred || !cred.tenant_id || !cred.client_id || !cred.client_secret) {
    return NextResponse.json(
      { error: "Power BI ainda não configurado. Vá em Administração → Power BI." },
      { status: 503 }
    );
  }

  try {
    const embed = await generateEmbed(
      cred,
      relatorio.pbi_workspace_id,
      relatorio.pbi_report_id
    );
    return NextResponse.json(embed);
  } catch (e) {
    console.error("[embed-token]", e);
    return NextResponse.json(
      { error: "Falha ao gerar token de embed do Power BI" },
      { status: 502 }
    );
  }
}
