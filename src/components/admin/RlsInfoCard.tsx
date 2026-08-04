"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ChevronDown, X } from "lucide-react";

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
    <div className="mb-4 rounded-2xl border border-violet-500/25 bg-violet-500/[0.07] p-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-violet-300 shrink-0" />
        <button
          onClick={() => setAberto((v) => !v)}
          className="flex-1 text-left font-medium text-slate-800"
        >
          Como funciona o RLS (dados por usuário)
        </button>
        <ChevronDown
          onClick={() => setAberto((v) => !v)}
          className={`h-4 w-4 text-slate-500 cursor-pointer transition ${
            aberto ? "rotate-180" : ""
          }`}
        />
        <button
          onClick={() => {
            localStorage.setItem(STORAGE, "1");
            setOculto(true);
          }}
          className="text-slate-500 hover:text-slate-800"
          title="Não mostrar mais"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {aberto && (
        <div className="mt-3 space-y-2 text-sm text-slate-600 animate-slide-down overflow-hidden">
          <p>
            Os usuários existem <b>só no portal</b>. Você <b>não</b> cria
            usuários no Power BI nem no Fabric, e não gasta licença Microsoft por
            pessoa. Uma capacidade e um app atendem <b>todos</b> os usuários.
          </p>
          <p>
            Se um painel tem <b>RLS</b>, cada pessoa vê só a parte dela. O portal
            avisa a Microsoft quem é o usuário pela <b>Identidade RLS</b> que você
            cadastra. A Microsoft filtra no servidor dela.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-500">
            <li>
              <b>Role de RLS</b> vai no painel (nome exato da função do .pbix).
            </li>
            <li>
              <b>Identidade RLS</b> vai no usuário (o valor do cliente dele: ID,
              CNPJ…).
            </li>
            <li>Sem identidade correta, a pessoa vê vazio — nunca o dado do outro.</li>
            <li>Use um código fixo (não o nome) e confira se bate com o modelo.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
