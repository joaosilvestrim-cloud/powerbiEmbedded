-- ============================================================
-- Gestão de usuários: status ativo/inativo.
-- (Inativo também é "banido" no Auth, bloqueando o login.)
-- ============================================================
alter table public.profiles
  add column if not exists ativo boolean not null default true;
