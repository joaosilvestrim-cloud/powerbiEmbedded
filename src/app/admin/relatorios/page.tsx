import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import RelatoriosAdmin from "@/components/admin/RelatoriosAdmin";
import type { Relatorio } from "@/lib/types";

export default async function AdminRelatoriosPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("relatorios").select("*").order("nome");

  return (
    <AppShell
      profile={profile}
      title="Relatórios"
      subtitle="Cadastre os relatórios do Power BI disponíveis no portal"
    >
      <RelatoriosAdmin relatorios={(data ?? []) as Relatorio[]} />
    </AppShell>
  );
}
