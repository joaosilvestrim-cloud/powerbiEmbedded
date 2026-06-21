import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import type { Relatorio } from "@/lib/types";

export default async function HomePage() {
  const profile = await getProfile();
  const supabase = await createClient();

  // RLS já filtra para os relatórios que o usuário pode ver.
  const { data } = await supabase
    .from("relatorios")
    .select("*")
    .eq("ativo", true)
    .order("nome");

  const relatorios = (data ?? []) as Relatorio[];

  return (
    <>
      <Nav profile={profile} />
      <main className="max-w-6xl mx-auto px-4 py-8 w-full">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">
          Seus relatórios
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          {relatorios.length} relatório(s) disponível(is)
        </p>

        {relatorios.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Nenhum relatório liberado para você ainda.
            {profile.role === "admin" && (
              <>
                {" "}
                <Link href="/admin" className="text-indigo-600 underline">
                  Cadastrar relatórios
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatorios.map((r) => (
              <Link
                key={r.id}
                href={`/relatorio/${r.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-400 hover:shadow-sm transition"
              >
                <h2 className="font-medium text-slate-800">{r.nome}</h2>
                {r.descricao && (
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {r.descricao}
                  </p>
                )}
                <span className="inline-block mt-4 text-sm text-indigo-600">
                  Abrir relatório →
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
