import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import UserMenu from "@/components/UserMenu";
import type { Profile } from "@/lib/types";

export default function AppShell({
  profile,
  title,
  subtitle,
  actions,
  children,
}: {
  profile: Profile;
  title: string;
  subtitle?: string;
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
              <h1 className="text-base font-semibold text-slate-800 truncate">
                {title}
              </h1>
              {subtitle && (
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
