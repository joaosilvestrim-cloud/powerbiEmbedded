"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

type Tipo = "sucesso" | "erro";
interface Toast {
  id: number;
  msg: string;
  tipo: Tipo;
}

const Ctx = createContext<(msg: string, tipo?: Tipo) => void>(() => {});

export function useToast() {
  return useContext(Ctx);
}

let seq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remover = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (msg: string, tipo: Tipo = "sucesso") => {
      const id = ++seq;
      setToasts((ts) => [...ts, { id, msg, tipo }]);
      setTimeout(() => remover(id), 2800);
    },
    [remover]
  );

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 shadow-lg animate-scale-in"
          >
            {t.tipo === "sucesso" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            )}
            <span className="text-sm text-slate-700">{t.msg}</span>
            <button
              onClick={() => remover(t.id)}
              className="text-slate-300 hover:text-slate-500"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
