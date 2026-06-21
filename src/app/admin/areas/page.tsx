import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import AreasManager from "@/components/admin/AreasManager";
import type { Area, Relatorio } from "@/lib/types";

export default async function AdminAreasPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const [{ data: areas }, { data: relatorios }] = await Promise.all([
    supabase.from("areas").select("*").order("nome"),
    supabase.from("relatorios").select("id, area_id, ativo"),
  ]);

  // Conta painéis por área.
  const contagem = new Map<string, number>();
  (relatorios ?? []).forEach((r: Pick<Relatorio, "area_id">) => {
    if (r.area_id)
      contagem.set(r.area_id, (contagem.get(r.area_id) ?? 0) + 1);
  });

  const lista = (areas ?? []).map((a: Area) => ({
    ...a,
    paineis: contagem.get(a.id) ?? 0,
  }));

  return (
    <AppShell
      profile={profile}
      title="Áreas"
      subtitle="Crie áreas (Operações, RH, Financeiro…) e adicione painéis a cada uma"
    >
      <AreasManager areas={lista} />
    </AppShell>
  );
}
