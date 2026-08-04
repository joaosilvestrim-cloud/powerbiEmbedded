-- ============================================================
-- MULTI-TENANT — Isolamento por tenant (RLS).
-- ⚠️ RODAR SOMENTE NA VIRADA, junto com o deploy do código
-- tenant-aware na `main`. A partir daqui, cada usuário só enxerga
-- os dados do próprio tenant, e todo insert exige tenant_id.
-- Pré-requisito: rodar `tenants.sql` antes (estrutura + backfill).
-- ============================================================

-- ---------- profiles ----------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (
  tenant_id = public.my_tenant_id()
  and (id = auth.uid() or public.is_admin())
);

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update using (
  tenant_id = public.my_tenant_id()
  and (id = auth.uid() or public.is_admin())
);

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all
  using (public.is_admin() and tenant_id = public.my_tenant_id())
  with check (public.is_admin() and tenant_id = public.my_tenant_id());

-- ---------- areas ----------
drop policy if exists areas_select on public.areas;
create policy areas_select on public.areas for select using (
  tenant_id = public.my_tenant_id()
  and (
    public.is_admin()
    or exists (
      select 1 from public.permissoes_area p
      where p.area_id = areas.id and p.user_id = auth.uid()
    )
  )
);

drop policy if exists areas_admin_write on public.areas;
create policy areas_admin_write on public.areas for all
  using (public.is_admin() and tenant_id = public.my_tenant_id())
  with check (public.is_admin() and tenant_id = public.my_tenant_id());

-- ---------- relatorios ----------
drop policy if exists relatorios_select on public.relatorios;
create policy relatorios_select on public.relatorios for select using (
  tenant_id = public.my_tenant_id()
  and (
    public.is_admin()
    or (
      area_id is not null and exists (
        select 1 from public.permissoes_area p
        where p.area_id = relatorios.area_id and p.user_id = auth.uid()
      )
    )
  )
);

drop policy if exists relatorios_admin_write on public.relatorios;
create policy relatorios_admin_write on public.relatorios for all
  using (public.is_admin() and tenant_id = public.my_tenant_id())
  with check (public.is_admin() and tenant_id = public.my_tenant_id());

-- ---------- permissoes_area ----------
drop policy if exists permareas_select on public.permissoes_area;
create policy permareas_select on public.permissoes_area for select using (
  tenant_id = public.my_tenant_id()
  and (user_id = auth.uid() or public.is_admin())
);

drop policy if exists permareas_write on public.permissoes_area;
create policy permareas_write on public.permissoes_area for all
  using (public.is_admin() and tenant_id = public.my_tenant_id())
  with check (public.is_admin() and tenant_id = public.my_tenant_id());

-- config_powerbi: continua só via service role (sem policy = negado para
-- clientes anon/authenticated). O código já filtra por tenant_id.
