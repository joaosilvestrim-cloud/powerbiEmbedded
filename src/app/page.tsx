import Link from "next/link";
import { FolderKanban, ArrowRight, Inbox } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import { cor } from "@/lib/cores";
import type { Area, Relatorio } from "@/lib/types";

export default async function HomePage() {
  const profile = await getProfile();
  const supabase = await createClient();

  // RLS filtra para as áreas liberadas (admin vê todas).
  const [{ data: areas }, { data: paineis }] = await Promise.all([
    supabase.from("areas").select("*").order("nome"),
    supabase.from("relatorios").select("id, area_id").eq("ativo", true),
  ]);

  const contagem = new Map<string, number>();
  (paineis ?? []).forEach((p: Pick<Relatorio, "area_id">) => {
    if (p.area_id) contagem.set(p.area_id, (contagem.get(p.area_id) ?? 0) + 1);
  });

  const lista = (areas ?? []) as Area[];

  return (
    <AppShell
      profile={profile}
      title="Meus painéis"
      subtitle="Selecione uma área para ver os painéis"
    >
      {lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-slate-600 font-medium">
            Nenhuma área liberada para você ainda.
          </p>
          {profile.role === "admin" ? (
            <Link
              href="/admin/areas"
              className="mt-4 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
            >
              Criar áreas <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <p className="mt-1 text-sm text-slate-400">
              Peça liberação ao administrador.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
          {lista.map((a) => {
            const c = cor(a.cor);
            return (
              <Link
                key={a.id}
                href={`/area/${a.id}`}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-400 hover:shadow-lg card-lift press"
              >
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}
                >
                  <FolderKanban className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-semibold text-slate-800">{a.nome}</h2>
                {a.descricao && (
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                    {a.descricao}
                  </p>
                )}
                <span className="mt-3 text-xs text-slate-400">
                  {contagem.get(a.id) ?? 0} painel(is)
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                  Abrir área
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
