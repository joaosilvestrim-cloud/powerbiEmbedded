"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMontado(true);
  }, []);

  const escuro = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(escuro ? "light" : "dark")}
      title={escuro ? "Tema claro" : "Tema escuro"}
      aria-label="Alternar tema"
      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 press"
    >
      {montado && escuro ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
