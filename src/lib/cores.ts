// Cores disponíveis para as áreas (chave salva no banco → classes Tailwind).
export const CORES: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  brand: { label: "Azul", bg: "bg-brand-50", text: "text-brand-700", dot: "bg-brand-500" },
  accent: { label: "Verde", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  violet: { label: "Violeta", bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  amber: { label: "Âmbar", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  rose: { label: "Rosa", bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  slate: { label: "Cinza", bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" },
};

export function cor(chave: string) {
  return CORES[chave] ?? CORES.brand;
}
