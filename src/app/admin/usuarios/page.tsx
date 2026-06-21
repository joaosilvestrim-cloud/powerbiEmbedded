import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import UsuariosManager from "@/components/admin/UsuariosManager";
import type { Profile, Area, PermissaoArea } from "@/lib/types";

export default async function AdminUsuariosPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const [{ data: usuarios }, { data: areas }, { data: permissoes }] =
    await Promise.all([
      supabase.from("profiles").select("*").order("nome"),
      supabase.from("areas").select("*").order("nome"),
      supabase.from("permissoes_area").select("*"),
    ]);

  return (
    <AppShell
      profile={profile}
      title="Usuários"
      subtitle="Crie usuários e libere as áreas que cada um pode ver"
    >
      <UsuariosManager
        usuarios={(usuarios ?? []) as Profile[]}
        areas={(areas ?? []) as Area[]}
        permissoes={(permissoes ?? []) as PermissaoArea[]}
      />
    </AppShell>
  );
}
