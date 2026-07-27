// Cores disponíveis para as áreas (chave salva no banco → classes Tailwind).
// Ajustadas para o tema escuro: fundo translúcido + texto claro + ponto vivo.
export const CORES: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  brand: { label: "Azul", bg: "bg-sky-500/15", text: "text-sky-300", dot: "bg-sky-400" },
  accent: { label: "Verde", bg: "bg-emerald-500/15", text: "text-emerald-300", dot: "bg-emerald-400" },
  violet: { label: "Violeta", bg: "bg-violet-500/150/15", text: "text-violet-300", dot: "bg-violet-400" },
  amber: { label: "Âmbar", bg: "bg-amber-500/100/15", text: "text-amber-300", dot: "bg-amber-400" },
  rose: { label: "Rosa", bg: "bg-rose-500/15", text: "text-rose-300", dot: "bg-rose-400" },
  slate: { label: "Cinza", bg: "bg-slate-500/20", text: "text-slate-500", dot: "bg-slate-400" },
};

export function cor(chave: string) {
  return CORES[chave] ?? CORES.brand;
}
