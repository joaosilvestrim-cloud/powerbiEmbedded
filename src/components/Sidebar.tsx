import BrandLogo from "@/components/BrandLogo";
import { NavLinks } from "@/components/navItems";

export default function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/5 bg-[#0b1524]/80 backdrop-blur">
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5">
        <BrandLogo size={32} className="drop-shadow-[0_0_10px_rgba(26,134,230,0.4)]" />
        <span className="font-semibold text-lg tracking-tight text-brand-gradient">
          DriveData
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <NavLinks isAdmin={isAdmin} />
      </nav>

      <div className="p-4 border-t border-white/5">
        <p className="text-[11px] text-slate-500">DriveData • Portal BI</p>
      </div>
    </aside>
  );
}
