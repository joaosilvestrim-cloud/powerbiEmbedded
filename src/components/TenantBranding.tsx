import { getTenant } from "@/lib/tenant";

// Injeta as cores do cliente (tenant) como variáveis CSS.
// Para o tenant padrão (DriveData) não injeta nada — mantém o visual atual.
export default async function TenantBranding() {
  const t = await getTenant();
  if (t.slug === "app") return null;

  const p = t.cor_primaria;
  const s = t.cor_secundaria;

  const css = `
    :root, .dark {
      --color-brand-500: ${p};
      --color-brand-600: ${p};
      --color-brand-700: ${p};
      --color-sky-300: ${p};
      --color-sky-400: ${p};
      --color-sky-500: ${p};
      --color-accent-400: ${s};
      --color-accent-500: ${s};
      --color-emerald-300: ${s};
      --color-emerald-400: ${s};
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
