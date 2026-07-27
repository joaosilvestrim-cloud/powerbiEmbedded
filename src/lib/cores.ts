// Cores das áreas (chave salva no banco → classes Tailwind), tema escuro.
// bg/text: chip do ícone · dot: bolinha · glow: brilho radial no card.
export const CORES: Record<
  string,
  { label: string; bg: string; text: string; dot: string; glow: string }
> = {
  brand: { label: "Azul", bg: "bg-sky-500/15", text: "text-sky-300", dot: "bg-sky-400", glow: "bg-sky-500" },
  accent: { label: "Verde", bg: "bg-emerald-500/15", text: "text-emerald-300", dot: "bg-emerald-400", glow: "bg-emerald-500" },
  violet: { label: "Violeta", bg: "bg-violet-500/15", text: "text-violet-300", dot: "bg-violet-400", glow: "bg-violet-500" },
  amber: { label: "Âmbar", bg: "bg-amber-500/15", text: "text-amber-300", dot: "bg-amber-400", glow: "bg-amber-500" },
  rose: { label: "Rosa", bg: "bg-rose-500/15", text: "text-rose-300", dot: "bg-rose-400", glow: "bg-rose-500" },
  slate: { label: "Cinza", bg: "bg-slate-500/20", text: "text-slate-400", dot: "bg-slate-400", glow: "bg-slate-500" },
};

export function cor(chave: string) {
  return CORES[chave] ?? CORES.brand;
}
