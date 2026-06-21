import { NextResponse } from "next/server";
import { ensureAdmin, loadPbiCred } from "@/lib/pbi-config";
import { listReports } from "@/lib/powerbi";

// POST /api/admin/pbi/reports  { workspaceId }
// Lista os relatórios de um workspace.
export async function POST(request: Request) {
  if (!(await ensureAdmin()))
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const cred = await loadPbiCred();
  if (!cred)
    return NextResponse.json({ error: "Power BI não configurado" }, { status: 400 });

  let workspaceId: string | undefined;
  try {
    workspaceId = (await request.json()).workspaceId;
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }
  if (!workspaceId)
    return NextResponse.json(
      { error: "workspaceId obrigatório" },
      { status: 400 }
    );

  try {
    const reports = await listReports(cred, workspaceId);
    return NextResponse.json({ reports });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao listar" },
      { status: 502 }
    );
  }
}
