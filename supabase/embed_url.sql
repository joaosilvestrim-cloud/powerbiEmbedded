-- ============================================================
-- Suporte a painel por LINK de incorporação (iframe / Publicar na web).
-- Painéis assim não precisam de service principal: guardam só a URL.
-- ============================================================
alter table public.relatorios
  add column if not exists embed_url text;

-- Os IDs do Power BI deixam de ser obrigatórios (só usados no modo
-- "App Owns Data" / service principal).
alter table public.relatorios alter column pbi_workspace_id drop not null;
alter table public.relatorios alter column pbi_report_id   drop not null;
alter table public.relatorios alter column pbi_workspace_id set default '';
alter table public.relatorios alter column pbi_report_id   set default '';
