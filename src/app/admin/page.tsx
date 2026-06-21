import Link from "next/link";
import {
  Users,
  FolderKanban,
  FileBarChart,
  PlugZap,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

export default async function AdminOverviewPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();
  const admin = createAdminClient();

  const [{ count: nUsuarios }, { count: nAreas }, { data: relatorios }, { data: cfg }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("areas").select("*", { count: "exact", head: true }),
      supabase.from("relatorios").select("id, ativo"),
      admin
        .from("config_powerbi")
        .select("tenant_id, client_id, client_secret")
        .eq("id", true)
        .single(),
    ]);

  const totalRel = relatorios?.length ?? 0;
  const ativos = relatorios?.filter((r) => r.ativo).length ?? 0;
  const pbiOk = Boolean(
    cfg?.tenant_id && cfg?.client_id && cfg?.client_secret
  );

  const cards = [
    {
      label: "Áreas",
      valor: nAreas ?? 0,
      icon: FolderKanban,
      href: "/admin/areas",
      cor: "bg-brand-50 text-brand-600",
    },
    {
      label: "Painéis",
      valor: `${ativos}/${totalRel}`,
      sub: "ativos",
      icon: FileBarChart,
      href: "/admin/areas",
      cor: "bg-violet-50 text-violet-600",
    },
    {
      label: "Usuários",
      valor: nUsuarios ?? 0,
      icon: Users,
      href: "/admin/usuarios",
      cor: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <AppShell
      profile={profile}
      title="Visão geral"
      subtitle="Resumo do portal"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition"
            >
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center ${c.cor}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-2xl font-semibold text-slate-800">
                {c.valor}{" "}
                {c.sub && (
                  <span className="text-sm font-normal text-slate-400">
                    {c.sub}
                  </span>
                )}
              </p>
              <p className="text-sm text-slate-500">{c.label}</p>
            </Link>
          );
        })}

        {/* Status Power BI */}
        <Link
          href="/admin/powerbi"
          className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <PlugZap className="h-5 w-5" />
          </div>
          <div className="mt-4 flex items-center gap-2">
            {pbiOk ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-lg font-semibold text-slate-800">
                  Conectado
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-slate-400" />
                <span className="text-lg font-semibold text-slate-500">
                  Não configurado
                </span>
              </>
            )}
          </div>
          <p className="text-sm text-slate-500">Power BI</p>
          {!pbiOk && (
            <span className="mt-2 inline-flex items-center gap-1 text-sm text-brand-600">
              Configurar agora <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <QuickLink
          href="/admin/areas"
          icon={FolderKanban}
          titulo="Criar área e painéis"
          texto="Operações, RH, Financeiro… e importe os painéis de cada uma."
        />
        <QuickLink
          href="/admin/usuarios"
          icon={Users}
          titulo="Gerenciar usuários"
          texto="Crie usuários e libere as áreas que cada um pode ver."
        />
        <QuickLink
          href="/admin/powerbi"
          icon={PlugZap}
          titulo="Conexão Power BI"
          texto="Configure o service principal e teste a conexão."
        />
      </div>
    </AppShell>
  );
}

function QuickLink({
  href,
  icon: Icon,
  titulo,
  texto,
}: {
  href: string;
  icon: typeof Users;
  titulo: string;
  texto: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-300 hover:shadow-sm transition"
    >
      <Icon className="h-5 w-5 text-brand-600" />
      <p className="mt-3 font-medium text-slate-800">{titulo}</p>
      <p className="mt-1 text-sm text-slate-500">{texto}</p>
    </Link>
  );
}
