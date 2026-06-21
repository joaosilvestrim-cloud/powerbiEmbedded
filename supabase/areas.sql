-- ============================================================
-- Áreas (Operações, RH, Financeiro…) e permissão POR ÁREA.
-- Cada relatório (painel) pertence a uma área. O usuário enxerga
-- as áreas liberadas para ele e todos os painéis ativos delas.
-- ============================================================

-- ---------- areas ----------
create table if not exists public.areas (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  descricao   text not null default '',
  cor         text not null default 'brand',
  criado_em   timestamptz not null default now()
);

-- Painel pertence a uma área.
alter table public.relatorios
  add column if not exists area_id uuid references public.areas (id) on delete set null;

-- ---------- permissão por área ----------
create table if not exists public.permissoes_area (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  area_id     uuid not null references public.areas (id) on delete cascade,
  criado_em   timestamptz not null default now(),
  unique (user_id, area_id)
);
create index if not exists idx_permareas_user on public.permissoes_area (user_id);
create index if not exists idx_permareas_area on public.permissoes_area (area_id);

-- ============================================================
-- RLS
-- ============================================================
alter table public.areas           enable row level security;
alter table public.permissoes_area enable row level security;

-- areas: admin gerencia tudo; usuário vê as áreas liberadas.
drop policy if exists areas_select on public.areas;
create policy areas_select on public.areas
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.permissoes_area p
      where p.area_id = areas.id and p.user_id = auth.uid()
    )
  );

drop policy if exists areas_admin_write on public.areas;
create policy areas_admin_write on public.areas
  for all using (public.is_admin()) with check (public.is_admin());

-- permissoes_area: usuário lê as próprias; admin gerencia.
drop policy if exists permareas_select on public.permissoes_area;
create policy permareas_select on public.permissoes_area
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists permareas_write on public.permissoes_area;
create policy permareas_write on public.permissoes_area
  for all using (public.is_admin()) with check (public.is_admin());

-- relatorios: visibilidade agora é POR ÁREA.
drop policy if exists relatorios_select on public.relatorios;
create policy relatorios_select on public.relatorios
  for select using (
    public.is_admin()
    or (
      area_id is not null
      and exists (
        select 1 from public.permissoes_area p
        where p.area_id = relatorios.area_id and p.user_id = auth.uid()
      )
    )
  );

-- Remove o modelo antigo (permissão por relatório).
drop table if exists public.permissoes;
