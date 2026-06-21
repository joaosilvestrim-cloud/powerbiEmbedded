import Link from "next/link";
import type { Profile } from "@/lib/types";

export default function Nav({ profile }: { profile: Profile }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-slate-800">
            Portal BI
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-slate-600 hover:text-slate-900">
              Relatórios
            </Link>
            {profile.role === "admin" && (
              <Link
                href="/admin"
                className="text-slate-600 hover:text-slate-900"
              >
                Administração
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500 hidden sm:inline">
            {profile.nome || profile.email}
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 hover:bg-slate-50"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
