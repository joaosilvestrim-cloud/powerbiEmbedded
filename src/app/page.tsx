import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import UserAreasGrid from "@/components/UserAreasGrid";
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

  const lista = ((areas ?? []) as Area[]).map((a) => ({
    ...a,
    paineis: contagem.get(a.id) ?? 0,
  }));

  return (
    <AppShell
      profile={profile}
      title="Meus painéis"
      subtitle="Selecione uma área para ver os painéis"
    >
      <UserAreasGrid areas={lista} isAdmin={profile.role === "admin"} />
    </AppShell>
  );
}
