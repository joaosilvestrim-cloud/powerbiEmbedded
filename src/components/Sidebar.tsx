"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Gauge,
  FileBarChart,
  Users,
  PlugZap,
  type LucideIcon,
} from "lucide-react";

interface Item {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const principais: Item[] = [
  { href: "/", label: "Relatórios", icon: LayoutGrid, exact: true },
];

const admin: Item[] = [
  { href: "/admin", label: "Visão geral", icon: Gauge, exact: true },
  { href: "/admin/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/powerbi", label: "Power BI", icon: PlugZap },
];

function LinkItem({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      {item.label}
    </Link>
  );
}

export default function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const isActive = (i: Item) =>
    i.exact ? pathname === i.href : pathname.startsWith(i.href);

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-200">
        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
          BI
        </div>
        <span className="font-semibold text-slate-800">Portal BI</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {principais.map((i) => (
          <LinkItem key={i.href} item={i} active={isActive(i)} />
        ))}

        {isAdmin && (
          <>
            <p className="px-3 pt-5 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Administração
            </p>
            {admin.map((i) => (
              <LinkItem key={i.href} item={i} active={isActive(i)} />
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
