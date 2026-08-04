import BrandLogo from "@/components/BrandLogo";
import { NavLinks } from "@/components/navItems";

export default function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50/70 backdrop-blur">
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200">
        <BrandLogo size={32} className="drop-shadow-[0_0_10px_rgba(26,134,230,0.4)]" />
        <span className="font-semibold text-lg tracking-tight text-brand-gradient">
          DriveData
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <NavLinks isAdmin={isAdmin} />
      </nav>

      <div className="p-4 border-t border-slate-200">
        <p className="text-[11px] text-slate-500">DriveData • Portal BI</p>
      </div>
    </aside>
  );
}
