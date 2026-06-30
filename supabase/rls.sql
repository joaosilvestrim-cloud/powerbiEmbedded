-- ============================================================
-- RLS dinâmico (App Owns Data + EffectiveIdentity).
-- - relatorios.rls_role: nome da role de RLS definida no .pbix
--   (ex.: "Cliente"). Vazio = sem RLS (todos veem tudo).
-- - profiles.rls_identity: valor que identifica o usuário nas regras
--   DAX (USERNAME()/CUSTOMDATA()) — ex.: o ID/CNPJ do cliente.
-- ============================================================
alter table public.relatorios
  add column if not exists rls_role text;

alter table public.profiles
  add column if not exists rls_identity text;
