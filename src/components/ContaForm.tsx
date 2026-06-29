"use client";

import { useState } from "react";
import { User, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";

export default function ContaForm({
  nomeInicial,
  email,
}: {
  nomeInicial: string;
  email: string;
}) {
  const toast = useToast();
  const [nome, setNome] = useState(nomeInicial);
  const [salvandoNome, setSalvandoNome] = useState(false);
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  async function salvarNome(e: React.FormEvent) {
    e.preventDefault();
    setSalvandoNome(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ nome })
        .eq("id", user.id);
      await supabase.auth.updateUser({ data: { nome } });
      setSalvandoNome(false);
      toast(error ? "Erro ao salvar nome" : "Nome atualizado", error ? "erro" : "sucesso");
    }
  }

  async function salvarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 6) return toast("A senha precisa de 6+ caracteres", "erro");
    if (senha !== senha2) return toast("As senhas não conferem", "erro");
    setSalvandoSenha(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvandoSenha(false);
    if (error) return toast("Erro ao trocar senha", "erro");
    setSenha("");
    setSenha2("");
    toast("Senha atualizada");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 max-w-4xl">
      <form
        onSubmit={salvarNome}
        className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
      >
        <div className="flex items-center gap-2 text-slate-700">
          <User className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-semibold">Dados pessoais</h3>
        </div>
        <label className="text-sm block">
          <span className="block text-slate-700 mb-1">Nome</span>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm block">
          <span className="block text-slate-700 mb-1">E-mail</span>
          <input
            value={email}
            disabled
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
          />
        </label>
        <button
          type="submit"
          disabled={salvandoNome}
          className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm hover:bg-brand-700 disabled:opacity-60 press"
        >
          {salvandoNome ? "Salvando…" : "Salvar nome"}
        </button>
      </form>

      <form
        onSubmit={salvarSenha}
        className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
      >
        <div className="flex items-center gap-2 text-slate-700">
          <KeyRound className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-semibold">Trocar senha</h3>
        </div>
        <label className="text-sm block">
          <span className="block text-slate-700 mb-1">Nova senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="mínimo 6 caracteres"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm block">
          <span className="block text-slate-700 mb-1">Confirmar nova senha</span>
          <input
            type="password"
            value={senha2}
            onChange={(e) => setSenha2(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={salvandoSenha}
          className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm hover:bg-brand-700 disabled:opacity-60 press"
        >
          {salvandoSenha ? "Salvando…" : "Trocar senha"}
        </button>
      </form>
    </div>
  );
}
