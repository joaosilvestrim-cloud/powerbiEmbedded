import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import UsuariosManager from "@/components/admin/UsuariosManager";
import RlsInfoCard from "@/components/admin/RlsInfoCard";
import type { Profile, Area, PermissaoArea } from "@/lib/types";

export default async function AdminUsuariosPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const [{ data: usuarios }, { data: areas }, { data: permissoes }, { data: rls }] =
    await Promise.all([
      supabase.from("profiles").select("*").order("nome"),
      supabase.from("areas").select("*").order("nome"),
      supabase.from("permissoes_area").select("*"),
      supabase
        .from("relatorios")
        .select("area_id")
        .not("rls_role", "is", null)
        .neq("rls_role", ""),
    ]);

  // Áreas que têm pelo menos um painel com RLS.
  const areasComRls = Array.from(
    new Set(
      ((rls ?? []) as { area_id: string | null }[])
        .map((r) => r.area_id)
        .filter(Boolean) as string[]
    )
  );

  return (
    <AppShell
      profile={profile}
      title="Usuários"
      subtitle="Crie usuários e libere as áreas que cada um pode ver"
    >
      <RlsInfoCard />
      <UsuariosManager
        usuarios={(usuarios ?? []) as Profile[]}
        areas={(areas ?? []) as Area[]}
        permissoes={(permissoes ?? []) as PermissaoArea[]}
        areasComRls={areasComRls}
      />
    </AppShell>
  );
}
