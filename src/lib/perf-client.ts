// Helper de telemetria dos painéis (client-side).
// Dispara e esquece: usa keepalive pra registrar mesmo se a página fechar.
export function registrarEventoPainel(payload: {
  relatorioId: string;
  tipo: "abertura" | "carregado" | "erro";
  duracaoMs?: number;
  detalhe?: string;
}) {
  try {
    fetch("/api/perf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // telemetria nunca quebra a UX
  }
}
