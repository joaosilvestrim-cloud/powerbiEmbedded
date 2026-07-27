"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Check, AlertTriangle } from "lucide-react";

type Onde = "Azure" | "Power BI" | "Portal";

interface Passo {
  titulo: string;
  onde: Onde;
  itens: string[];
  aviso?: string;
}

const CORES: Record<Onde, string> = {
  Azure: "bg-blue-100 text-blue-700",
  "Power BI": "bg-amber-100 text-amber-700",
  Portal: "bg-brand-100 text-brand-700",
};

const PASSOS: Passo[] = [
  {
    titulo: "Registrar o aplicativo no Azure",
    onde: "Azure",
    itens: [
      "Acesse portal.azure.com (com uma conta admin do tenant).",
      'Busque "Registros de aplicativo" → + Novo registro.',
      'Nome: "Portal BI DriveData" → "Somente contas neste diretório" → Registrar.',
      'Na "Visão geral", copie: ID do aplicativo (cliente) = Client ID e ID do diretório (locatário) = Tenant ID.',
    ],
    aviso:
      "O Tenant ID é um código (GUID), NÃO um e-mail. Não use seu e-mail nesse campo.",
  },
  {
    titulo: "Gerar o Client Secret",
    onde: "Azure",
    itens: [
      "No mesmo app → Certificados e segredos → + Novo segredo do cliente.",
      "Descrição e validade (ex.: 12 meses) → Adicionar.",
      "Copie o campo Valor = Client Secret.",
    ],
    aviso: "O Valor do segredo só aparece na hora da criação. Se sair da tela, crie outro.",
  },
  {
    titulo: "Colar as credenciais no portal e salvar",
    onde: "Portal",
    itens: [
      "Aqui embaixo, preencha Tenant ID, Client ID e Client Secret.",
      "Clique em Salvar configuração.",
    ],
  },
  {
    titulo: "Garantir a capacidade do workspace",
    onde: "Power BI",
    itens: [
      "O workspace do relatório precisa estar em capacidade A-SKU (Power BI Embedded) ou Fabric (F-SKU).",
      "Confira em: Configurações do workspace → Tipo de workspace.",
    ],
    aviso:
      "Workspace em PPU (Premium por usuário) NÃO funciona para App Owns Data. Use Fabric/A-SKU.",
  },
  {
    titulo: "Dar acesso do app ao workspace (papel Membro/Admin)",
    onde: "Power BI",
    itens: [
      "app.powerbi.com → abra o workspace → Gerenciar acesso.",
      '+ Adicionar pessoas ou grupos → digite "Portal BI DriveData" (aparece como aplicativo).',
      "Escolha o papel Administrador (ou Membro) → Adicionar.",
    ],
    aviso:
      'Precisa ser Membro ou Admin. Visualizador/Colaborador causa o erro 403 "reshare permissions".',
  },
  {
    titulo: "Testar a conexão",
    onde: "Portal",
    itens: [
      'Clique em "Testar conexão" (ao lado).',
      "Deve aparecer Conexão OK e a lista dos seus workspaces.",
    ],
  },
  {
    titulo: "Importar o relatório em uma área",
    onde: "Portal",
    itens: [
      "Administração → Áreas → + Nova área → Gerenciar painéis.",
      'Na coluna "Avançado — importar via service principal" → Buscar relatórios.',
      "Escolha o workspace → Importar o relatório desejado.",
      "Abra o painel em Meus painéis para conferir.",
    ],
  },
  {
    titulo: "(Opcional) RLS — isolar dados por cliente",
    onde: "Portal",
    itens: [
      "No .pbix: crie a role de RLS (ex.: Cliente) com regra DAX (CUSTOMDATA() ou USERNAME()) e publique.",
      'No painel → lápis (editar) → preencha "Role de RLS" com o nome exato da role.',
      'Em Usuários → expanda a pessoa → preencha "Identidade RLS" com o valor do cliente.',
    ],
  },
  {
    titulo: "Liberar as áreas para os usuários",
    onde: "Portal",
    itens: [
      "Administração → Usuários → criar usuário → expandir → marcar as áreas.",
      'Ou pela área: bloco "Quem vê esta área" → marcar as pessoas.',
    ],
  },
];

const STORAGE_KEY = "guia-appownsdata-v1";

export default function GuiaConfiguracao() {
  const [feitos, setFeitos] = useState<boolean[]>(() =>
    PASSOS.map(() => false)
  );
  const [aberto, setAberto] = useState<number | null>(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as boolean[];
        if (Array.isArray(arr) && arr.length === PASSOS.length) setFeitos(arr);
      }
    } catch {}
  }, []);

  function toggleFeito(i: number) {
    setFeitos((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  const total = PASSOS.length;
  const concluidos = feitos.filter(Boolean).length;
  const pct = Math.round((concluidos / total) * 100);

  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-brand-800">
          Guia de configuração — App Owns Data
        </h3>
        <span className="text-xs text-slate-500">
          {concluidos}/{total}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-brand-100 overflow-hidden mb-4">
        <div
          className="h-full bg-brand-gradient transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="space-y-2">
        {PASSOS.map((p, i) => {
          const exp = aberto === i;
          const feito = feitos[i];
          return (
            <li
              key={i}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden"
            >
              <div className="flex items-center gap-3 px-3 py-2.5">
                <button
                  onClick={() => toggleFeito(i)}
                  className={`h-6 w-6 shrink-0 rounded-full border flex items-center justify-center press ${
                    feito
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-slate-300 text-transparent hover:border-brand-400"
                  }`}
                  title={feito ? "Concluído" : "Marcar como feito"}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => setAberto(exp ? null : i)}
                  className="flex flex-1 items-center gap-2 text-left min-w-0"
                >
                  <span className="text-xs text-slate-400 w-5 shrink-0">
                    {i + 1}.
                  </span>
                  <span
                    className={`text-sm font-medium truncate ${
                      feito ? "text-slate-400 line-through" : "text-slate-800"
                    }`}
                  >
                    {p.titulo}
                  </span>
                  <span
                    className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${CORES[p.onde]}`}
                  >
                    {p.onde}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition ${
                      exp ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {exp && (
                <div className="px-4 pb-3 pl-14 animate-slide-down overflow-hidden">
                  <ul className="list-disc space-y-1 text-sm text-slate-600 marker:text-slate-300">
                    {p.itens.map((t, j) => (
                      <li key={j}>{t}</li>
                    ))}
                  </ul>
                  {p.aviso && (
                    <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{p.aviso}</span>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
