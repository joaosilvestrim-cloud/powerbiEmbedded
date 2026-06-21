-- ============================================================
-- Portal BI — Schema Supabase
-- Tabelas: profiles, relatorios, permissoes
-- Controle de acesso: cada usuário só enxerga os relatórios
-- liberados para ele; admins gerenciam tudo.
-- ============================================================

-- ---------- profiles ----------
-- Estende auth.users com nome e papel (admin | user).
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text not null default '',
  email       text not null default '',
  role        text not null default 'user' check (role in ('admin', 'user')),
  criado_em   timestamptz not null default now()
);

-- ---------- relatorios ----------
-- Cada linha = um relatório Power BI embedável.
create table if not exists public.relatorios (
  id                uuid primary key default gen_random_uuid(),
  nome              text not null,
  descricao         text not null default '',
  pbi_workspace_id  text not null,   -- groupId do workspace no Power BI
  pbi_report_id     text not null,   -- reportId do relatório
  ativo             boolean not null default true,
  criado_em         timestamptz not null default now()
);

-- ---------- permissoes ----------
-- Relação N:N entre usuários e relatórios.
create table if not exists public.permissoes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  relatorio_id  uuid not null references public.relatorios (id) on delete cascade,
  criado_em     timestamptz not null default now(),
  unique (user_id, relatorio_id)
);

create index if not exists idx_permissoes_user      on public.permissoes (user_id);
create index if not exists idx_permissoes_relatorio on public.permissoes (relatorio_id);

-- ---------- helper: é admin? ----------
-- Função SECURITY DEFINER evita recursão de RLS ao checar o papel
-- do usuário dentro das próprias políticas. Definida após as tabelas
-- porque referencia public.profiles.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles   enable row level security;
alter table public.relatorios enable row level security;
alter table public.permissoes enable row level security;

-- ---------- profiles ----------
-- O usuário lê/edita o próprio perfil; admin lê/edita todos.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- relatorios ----------
-- Usuário vê um relatório se for admin OU se tiver permissão para ele.
drop policy if exists relatorios_select on public.relatorios;
create policy relatorios_select on public.relatorios
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.permissoes p
      where p.relatorio_id = relatorios.id
        and p.user_id = auth.uid()
    )
  );

-- Somente admin cria/edita/remove relatórios.
drop policy if exists relatorios_admin_write on public.relatorios;
create policy relatorios_admin_write on public.relatorios
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- permissoes ----------
-- Usuário lê as próprias permissões; admin lê todas.
drop policy if exists permissoes_select on public.permissoes;
create policy permissoes_select on public.permissoes
  for select using (user_id = auth.uid() or public.is_admin());

-- Somente admin concede/revoga permissões.
drop policy if exists permissoes_admin_write on public.permissoes;
create policy permissoes_admin_write on public.permissoes
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Trigger: cria profile automaticamente ao registrar usuário
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Para promover o primeiro admin, rode manualmente (troque o e-mail):
--   update public.profiles set role = 'admin'
--   where email = 'voce@empresa.com';
-- ============================================================
