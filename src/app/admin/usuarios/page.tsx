import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import UsuariosManager from "@/components/admin/UsuariosManager";
import type { Profile, Relatorio, Permissao } from "@/lib/types";

export default async function AdminUsuariosPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const [{ data: usuarios }, { data: relatorios }, { data: permissoes }] =
    await Promise.all([
      supabase.from("profiles").select("*").order("nome"),
      supabase.from("relatorios").select("*").order("nome"),
      supabase.from("permissoes").select("*"),
    ]);

  return (
    <AppShell
      profile={profile}
      title="Usuários"
      subtitle="Crie usuários e libere relatórios para cada um"
    >
      <UsuariosManager
        usuarios={(usuarios ?? []) as Profile[]}
        relatorios={(relatorios ?? []) as Relatorio[]}
        permissoes={(permissoes ?? []) as Permissao[]}
      />
    </AppShell>
  );
}
