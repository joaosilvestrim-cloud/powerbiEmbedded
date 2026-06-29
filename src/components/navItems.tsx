"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Gauge,
  FolderKanban,
  Users,
  PlugZap,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const principais: NavItem[] = [
  { href: "/", label: "Meus painéis", icon: LayoutGrid, exact: true },
];

export const adminItens: NavItem[] = [
  { href: "/admin", label: "Visão geral", icon: Gauge, exact: true },
  { href: "/admin/areas", label: "Áreas", icon: FolderKanban },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/powerbi", label: "Power BI", icon: PlugZap },
];

function LinkItem({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium press ${
        active
          ? "bg-brand-50 text-brand-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-brand-600 transition-all duration-300 ${
          active ? "h-5 opacity-100" : "h-0 opacity-0"
        }`}
      />
      <Icon
        className="h-[18px] w-[18px] transition-transform group-hover:scale-110"
        strokeWidth={2}
      />
      {item.label}
    </Link>
  );
}

export function NavLinks({
  isAdmin,
  onNavigate,
}: {
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = (i: NavItem) =>
    i.exact ? pathname === i.href : pathname.startsWith(i.href);

  return (
    <>
      {principais.map((i) => (
        <LinkItem
          key={i.href}
          item={i}
          active={isActive(i)}
          onNavigate={onNavigate}
        />
      ))}
      {isAdmin && (
        <>
          <p className="px-3 pt-5 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Administração
          </p>
          {adminItens.map((i) => (
            <LinkItem
              key={i.href}
              item={i}
              active={isActive(i)}
              onNavigate={onNavigate}
            />
          ))}
        </>
      )}
    </>
  );
}
