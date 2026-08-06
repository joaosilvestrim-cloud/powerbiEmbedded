"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ChevronDown,
  X,
  LayoutDashboard,
  UserRound,
  Eye,
  Lightbulb,
} from "lucide-react";

const STORAGE = "rls-info-dismiss";

export default function RlsInfoCard() {
  const [aberto, setAberto] = useState(false);
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (localStorage.getItem(STORAGE) === "1") setOculto(true);
  }, []);

  if (oculto) return null;

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white shadow-sm">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <button
          onClick={() => setAberto((v) => !v)}
          className="flex-1 text-left"
        >
          <span className="block font-semibold text-slate-800">
            Como funciona o RLS
          </span>
          <span className="block text-xs text-slate-500">
            Cada pessoa enxerga só a parte dela dos dados
          </span>
        </button>
        <button
          onClick={() => setAberto((v) => !v)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-violet-100 hover:text-slate-700 transition"
          aria-label={aberto ? "Recolher" : "Expandir"}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${aberto ? "rotate-180" : ""}`}
          />
        </button>
        <button
          onClick={() => {
            localStorage.setItem(STORAGE, "1");
            setOculto(true);
          }}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-violet-100 hover:text-slate-700 transition"
          title="Não mostrar mais"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {aberto && (
        <div className="animate-slide-down overflow-hidden px-4 pb-4">
          <p className="mb-4 text-sm leading-relaxed text-slate-600">
            Os usuários vivem <b>só no portal</b>, você não cria conta no Power BI
            nem gasta licença Microsoft por pessoa. Quando um painel tem RLS, o
            portal avisa a Microsoft <b>quem é o usuário</b>, e ela filtra os dados
            no servidor. Isso depende de dois encaixes:
          </p>

          {/* Os dois passos */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  1
                </span>
                <LayoutDashboard className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-800">
                  No painel: Role de RLS
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                O nome <b>exato</b> da função criada no modelo do Power BI.
              </p>
              <code className="mt-2 block rounded-lg bg-slate-50 px-2.5 py-1.5 text-[12px] font-mono text-violet-700">
                RLS Departamento
              </code>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  2
                </span>
                <UserRound className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-800">
                  No usuário: Identidade RLS
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                O valor que identifica a pessoa no filtro, igual ao que está no
                modelo (e-mail, CNPJ ou um código).
              </p>
              <code className="mt-2 block rounded-lg bg-slate-50 px-2.5 py-1.5 text-[12px] font-mono text-violet-700">
                joao@empresa.com
              </code>
            </div>
          </div>

          {/* Regra de ouro */}
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5">
            <Eye className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed text-amber-800">
              <b>Sem a Identidade RLS correta, a pessoa vê vazio</b>, nunca o dado
              de outro. É seguro por padrão: na dúvida, mostra nada.
            </p>
          </div>

          {/* Dica de teste */}
          <div className="mt-2 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <p className="text-xs leading-relaxed text-slate-600">
              Para conferir, use <b>Exibir como</b> no Power BI com o e-mail da
              pessoa, ou entre no portal com o login dela. O admin ver tudo não
              garante que o filtro dos outros está certo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
