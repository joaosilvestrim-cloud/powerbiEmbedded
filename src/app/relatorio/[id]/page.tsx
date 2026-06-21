import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import ReportViewer from "@/components/ReportViewer";
import type { Relatorio } from "@/lib/types";

export default async function RelatorioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const supabase = await createClient();

  // RLS bloqueia o acesso se o usuário não tiver permissão → notFound.
  const { data } = await supabase
    .from("relatorios")
    .select("*")
    .eq("id", id)
    .eq("ativo", true)
    .single();

  if (!data) notFound();
  const relatorio = data as Relatorio;

  return (
    <>
      <Nav profile={profile} />
      <main className="max-w-6xl mx-auto px-4 py-6 w-full">
        <div className="mb-4">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
            ← Voltar
          </Link>
          <h1 className="text-xl font-semibold text-slate-800 mt-1">
            {relatorio.nome}
          </h1>
          {relatorio.descricao && (
            <p className="text-sm text-slate-500">{relatorio.descricao}</p>
          )}
        </div>

        <ReportViewer relatorioId={relatorio.id} />
      </main>
    </>
  );
}
