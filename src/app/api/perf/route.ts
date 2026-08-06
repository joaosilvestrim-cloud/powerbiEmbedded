import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Registra um evento de uso/desempenho de painel. Chamado pelo viewer.
// Deriva tenant e usuário da sessão (o cliente não escolhe isso).
// Telemetria nunca deve quebrar a experiência: falhas retornam ok:false 200.
export async function POST(req: NextRequest) {
  try {
    const { relatorioId, tipo, duracaoMs, detalhe } = await req.json();
    if (!["abertura", "carregado", "erro"].includes(tipo)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    const { data: prof } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    const admin = createAdminClient();
    await admin.from("painel_eventos").insert({
      tenant_id: prof?.tenant_id ?? null,
      relatorio_id: relatorioId ?? null,
      user_id: user.id,
      tipo,
      duracao_ms: typeof duracaoMs === "number" ? Math.round(duracaoMs) : null,
      detalhe: detalhe ? String(detalhe).slice(0, 500) : null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
