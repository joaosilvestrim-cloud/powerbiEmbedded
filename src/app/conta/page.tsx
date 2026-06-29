import { getProfile } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import ContaForm from "@/components/ContaForm";

export default async function ContaPage() {
  const profile = await getProfile();
  return (
    <AppShell
      profile={profile}
      title="Minha conta"
      subtitle="Atualize seu nome e sua senha"
    >
      <ContaForm nomeInicial={profile.nome} email={profile.email} />
    </AppShell>
  );
}
