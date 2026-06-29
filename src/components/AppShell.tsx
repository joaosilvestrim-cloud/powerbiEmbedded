import { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import UserMenu from "@/components/UserMenu";
import type { Profile } from "@/lib/types";

export interface Crumb {
  label: string;
  href?: string;
}

export default function AppShell({
  profile,
  title,
  subtitle,
  breadcrumb,
  actions,
  children,
}: {
  profile: Profile;
  title: string;
  subtitle?: string;
  breadcrumb?: Crumb[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isAdmin={profile.role === "admin"} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MobileNav isAdmin={profile.role === "admin"} />
            <div className="min-w-0">
              {breadcrumb && breadcrumb.length > 0 && (
                <nav className="flex items-center gap-1 text-xs text-slate-400 mb-0.5">
                  {breadcrumb.map((c, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <ChevronRight className="h-3 w-3" />}
                      {c.href ? (
                        <Link
                          href={c.href}
                          className="hover:text-brand-600 truncate max-w-[120px]"
                        >
                          {c.label}
                        </Link>
                      ) : (
                        <span className="truncate max-w-[160px] text-slate-500">
                          {c.label}
                        </span>
                      )}
                    </span>
                  ))}
                </nav>
              )}
              <h1 className="text-base font-semibold text-slate-800 truncate">
                {title}
              </h1>
              {subtitle && !breadcrumb && (
                <p className="text-xs text-slate-500 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <UserMenu profile={profile} />
          </div>
        </header>

        <main key={title} className="flex-1 p-4 sm:p-6 min-w-0 animate-fade-up">
          {children}
        </main>
      </div>
    </div>
  );
}
