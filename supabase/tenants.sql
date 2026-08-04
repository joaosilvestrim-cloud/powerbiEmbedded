-- ============================================================
-- MULTI-TENANT — Fase 1a (estrutura). Segura para produção:
-- adiciona colunas/tabela sem mexer no comportamento atual.
-- O isolamento por RLS entra numa migração seguinte (tenants-rls.sql),
-- depois que o app já estiver gravando tenant_id nos novos registros.
-- ============================================================

-- ---------- tenants ----------
create table if not exists public.tenants (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null,
  slug           text unique not null,          -- subdomínio (ex.: clienteA)
  dominio        text unique,                    -- domínio próprio (opcional)
  logo_url       text,
  cor_primaria   text not null default '#0284c7',-- brand
  cor_secundaria text not null default '#22c55e',-- accent
  ativo          boolean not null default true,
  criado_em      timestamptz not null default now()
);

-- Tenant padrão = os dados que já existem (DriveData).
insert into public.tenants (nome, slug, dominio, cor_primaria, cor_secundaria)
values ('DriveData', 'app', 'embeddedbi.drivedata.com.br', '#0284c7', '#22c55e')
on conflict (slug) do nothing;

-- IMPORTANTE: config_powerbi.tenant_id hoje é o TENANT DO AZURE (Power BI).
-- Renomeamos para pbi_tenant_id para liberar o nome tenant_id (multi-tenant).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='config_powerbi'
      and column_name='tenant_id'
      and data_type <> 'uuid'
  ) then
    alter table public.config_powerbi rename column tenant_id to pbi_tenant_id;
  end if;
end $$;

-- ---------- tenant_id (multi-tenant) nas tabelas ----------
alter table public.profiles        add column if not exists tenant_id uuid references public.tenants (id) on delete cascade;
alter table public.areas           add column if not exists tenant_id uuid references public.tenants (id) on delete cascade;
alter table public.relatorios      add column if not exists tenant_id uuid references public.tenants (id) on delete cascade;
alter table public.permissoes_area add column if not exists tenant_id uuid references public.tenants (id) on delete cascade;
alter table public.config_powerbi  add column if not exists tenant_id uuid references public.tenants (id) on delete cascade;

-- Super admin (equipe DriveData) que cria/gerencia os tenants.
alter table public.profiles add column if not exists super_admin boolean not null default false;

-- ---------- backfill: tudo vira do tenant padrão ----------
do $$
declare t uuid;
begin
  select id into t from public.tenants where slug = 'app';
  update public.profiles        set tenant_id = t where tenant_id is null;
  update public.areas           set tenant_id = t where tenant_id is null;
  update public.relatorios      set tenant_id = t where tenant_id is null;
  update public.permissoes_area set tenant_id = t where tenant_id is null;
  update public.config_powerbi  set tenant_id = t where tenant_id is null;
end $$;

-- config_powerbi passa a ser 1 por tenant. Removemos a trava de linha
-- única (id boolean = true) e a chave passa a ser tenant_id.
do $$
declare c text;
begin
  alter table public.config_powerbi drop constraint if exists config_powerbi_pkey;
  for c in
    select conname from pg_constraint
    where conrelid = 'public.config_powerbi'::regclass and contype = 'c'
  loop
    execute 'alter table public.config_powerbi drop constraint ' || quote_ident(c);
  end loop;
  begin alter table public.config_powerbi alter column id drop not null; exception when others then null; end;
  begin alter table public.config_powerbi alter column id drop default; exception when others then null; end;
end $$;

create unique index if not exists config_powerbi_tenant_uk
  on public.config_powerbi (tenant_id);

-- índices de apoio
create index if not exists idx_profiles_tenant   on public.profiles (tenant_id);
create index if not exists idx_areas_tenant       on public.areas (tenant_id);
create index if not exists idx_relatorios_tenant  on public.relatorios (tenant_id);
create index if not exists idx_permareas_tenant   on public.permissoes_area (tenant_id);

-- ---------- helper: tenant do usuário logado ----------
create or replace function public.my_tenant_id()
returns uuid language sql security definer stable set search_path = public as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

-- ---------- tenants: leitura pública do básico (marca por domínio) ----------
alter table public.tenants enable row level security;
drop policy if exists tenants_read on public.tenants;
create policy tenants_read on public.tenants for select using (true);
drop policy if exists tenants_admin on public.tenants;
create policy tenants_admin on public.tenants for all
  using (exists (select 1 from public.profiles where id = auth.uid() and super_admin))
  with check (exists (select 1 from public.profiles where id = auth.uid() and super_admin));

-- Marque seu usuário como super admin (troque o e-mail):
--   update public.profiles set super_admin = true where email = 'suporteia@drivedata.com.br';
