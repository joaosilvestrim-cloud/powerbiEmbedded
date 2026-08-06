-- ============================================================
-- Uso e desempenho dos painéis.
-- Registra abertura, carregamento (com tempo) e erro de cada painel.
-- Multi-tenant: cada evento carrega o tenant; o admin só vê o próprio.
-- ============================================================

create table if not exists public.painel_eventos (
  id            bigint generated always as identity primary key,
  tenant_id     uuid references public.tenants (id) on delete cascade,
  relatorio_id  uuid references public.relatorios (id) on delete set null,
  user_id       uuid references public.profiles (id) on delete set null,
  tipo          text not null check (tipo in ('abertura', 'carregado', 'erro')),
  duracao_ms    integer,   -- tempo até renderizar (para 'carregado')
  detalhe       text,      -- mensagem (para 'erro')
  criado_em     timestamptz not null default now()
);

create index if not exists idx_pe_tenant_data on public.painel_eventos (tenant_id, criado_em desc);
create index if not exists idx_pe_relatorio    on public.painel_eventos (relatorio_id);

-- RLS: inserção é só via service role (API). Leitura direta só admin do tenant.
alter table public.painel_eventos enable row level security;
drop policy if exists pe_admin_read on public.painel_eventos;
create policy pe_admin_read on public.painel_eventos for select
  using (public.is_admin() and tenant_id = public.my_tenant_id());

-- ---------- resumo (cartões do topo) ----------
create or replace function public.perf_resumo(p_dias int default 30)
returns table (
  total_aberturas bigint,
  usuarios_ativos bigint,
  tempo_medio_ms  numeric,
  erros           bigint
) language sql security definer set search_path = public stable as $$
  select
    count(*) filter (where tipo = 'abertura'),
    count(distinct user_id) filter (where tipo = 'abertura'),
    round(avg(duracao_ms) filter (where tipo = 'carregado')),
    count(*) filter (where tipo = 'erro')
  from public.painel_eventos
  where tenant_id = public.my_tenant_id()
    and public.is_admin()
    and criado_em >= now() - make_interval(days => p_dias);
$$;

-- ---------- detalhe por painel ----------
create or replace function public.perf_por_painel(p_dias int default 30)
returns table (
  relatorio_id   uuid,
  nome           text,
  aberturas      bigint,
  usuarios       bigint,
  tempo_medio_ms numeric,
  erros          bigint,
  ultimo_acesso  timestamptz
) language sql security definer set search_path = public stable as $$
  select
    e.relatorio_id,
    coalesce(r.nome, 'Painel removido') as nome,
    count(*) filter (where e.tipo = 'abertura') as aberturas,
    count(distinct e.user_id) filter (where e.tipo = 'abertura') as usuarios,
    round(avg(e.duracao_ms) filter (where e.tipo = 'carregado')) as tempo_medio_ms,
    count(*) filter (where e.tipo = 'erro') as erros,
    max(e.criado_em) as ultimo_acesso
  from public.painel_eventos e
  left join public.relatorios r on r.id = e.relatorio_id
  where e.tenant_id = public.my_tenant_id()
    and public.is_admin()
    and e.criado_em >= now() - make_interval(days => p_dias)
  group by e.relatorio_id, r.nome
  order by aberturas desc, ultimo_acesso desc nulls last;
$$;

grant execute on function public.perf_resumo(int)    to authenticated;
grant execute on function public.perf_por_painel(int) to authenticated;
