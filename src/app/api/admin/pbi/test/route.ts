import { NextResponse } from "next/server";
import { ensureAdmin, loadPbiCred } from "@/lib/pbi-config";
import { listWorkspaces } from "@/lib/powerbi";

// POST /api/admin/pbi/test
// Testa a conexão do service principal e retorna os workspaces visíveis.
export async function POST() {
  if (!(await ensureAdmin()))
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const cred = await loadPbiCred();
  if (!cred)
    return NextResponse.json(
      { ok: false, error: "Credenciais ainda não preenchidas." },
      { status: 200 }
    );

  try {
    const workspaces = await listWorkspaces(cred);
    return NextResponse.json({ ok: true, workspaces });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : "Falha na conexão",
    });
  }
}
