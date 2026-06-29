// Skeleton exibido durante transições de rota — mantém a silhueta do app
// (sidebar + topbar + grade) para a navegação parecer instantânea.
export default function Loading() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-200">
          <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="p-3 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
            <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="h-11 w-11 rounded-xl bg-slate-200 animate-pulse" />
                <div className="mt-4 h-4 w-2/3 rounded bg-slate-200 animate-pulse" />
                <div className="mt-2 h-3 w-full rounded bg-slate-100 animate-pulse" />
                <div className="mt-4 h-3 w-20 rounded bg-slate-100 animate-pulse" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
