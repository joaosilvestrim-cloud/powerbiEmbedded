-- ============================================================
-- Configuração do Power BI (Service Principal) guardada no sistema.
-- Linha única (id = true). O client_secret NUNCA é exposto ao
-- navegador: a tabela tem RLS sem política de SELECT/escrita para
-- usuários, então só a service role (servidor) acessa.
-- ============================================================
create table if not exists public.config_powerbi (
  id             boolean primary key default true check (id = true),
  tenant_id      text not null default '',
  client_id      text not null default '',
  client_secret  text not null default '',
  atualizado_em  timestamptz not null default now()
);

-- Garante a linha única.
insert into public.config_powerbi (id) values (true)
  on conflict (id) do nothing;

-- RLS ligada e SEM políticas para anon/authenticated → ninguém
-- lê/escreve via API pública. A service role ignora RLS (acesso
-- somente pelo servidor).
alter table public.config_powerbi enable row level security;
