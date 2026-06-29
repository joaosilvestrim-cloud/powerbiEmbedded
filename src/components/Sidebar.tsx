import BrandLogo from "@/components/BrandLogo";
import { NavLinks } from "@/components/navItems";

export default function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-200">
        <BrandLogo size={30} />
        <span className="font-semibold text-slate-800">DriveData BI</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <NavLinks isAdmin={isAdmin} />
      </nav>

      <div className="p-4 border-t border-slate-100">
        <p className="text-[11px] text-slate-400">DriveData • Portal BI</p>
      </div>
    </aside>
  );
}
