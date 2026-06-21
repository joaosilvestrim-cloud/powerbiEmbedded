# Portal BI

Portal Next.js que embeda relatórios **Power BI** e controla, por usuário,
quais páginas/relatórios cada pessoa pode acessar. Usa o modelo
**"App Owns Data"** — os usuários finais **não precisam de licença Power BI**;
eles só logam no portal.

## Stack

- **Next.js (App Router)** + TypeScript + Tailwind
- **Supabase** — autenticação e banco (perfis, relatórios, permissões + RLS)
- **Power BI Embedded** — `powerbi-client-react` no front; embed token gerado
  no servidor via API REST do Power BI com um **service principal** (Azure AD)

## Como funciona o controle de acesso

1. Usuário loga (Supabase Auth).
2. Ao abrir um relatório, o front chama `POST /api/embed-token`.
3. A rota confere no Supabase se o usuário tem permissão (via RLS) e, se sim,
   pede um **embed token** ao Power BI usando o service principal.
4. O token (curta duração) é devolvido ao browser, que renderiza o relatório.
   O segredo do Azure **nunca** vai para o navegador.

Admins enxergam todos os relatórios; usuários comuns só os liberados em
**/admin → Permissões**.

---

## 1. Configurar o Supabase

1. Crie um projeto em https://supabase.com.
2. Em **SQL Editor**, rode o conteúdo de [`supabase/schema.sql`](supabase/schema.sql).
3. Em **Project Settings → API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`
4. Crie seu usuário admin: cadastre-se uma vez (ou crie em Authentication →
   Users) e então rode no SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'voce@empresa.com';
   ```

## 2. Configurar o Power BI / Azure (frente Microsoft)

> Resumo. Esses passos exigem conta/admin do tenant e podem ter custo.

1. **Power BI Pro** para publicar os relatórios em um workspace.
2. **Azure AD → App registrations**: registre um app → isso cria o
   *service principal*. Gere um **client secret**. Anote:
   - Directory (tenant) ID → `PBI_TENANT_ID`
   - Application (client) ID → `PBI_CLIENT_ID`
   - Secret → `PBI_CLIENT_SECRET`
3. **Power BI Admin Portal → Tenant settings**: habilite
   *"Service principals can use Power BI APIs"* e adicione o app a um grupo de
   segurança permitido.
4. **Capacidade**: associe o workspace a uma capacidade **Fabric (F-SKU)** ou
   **Power BI Embedded (A-SKU)** — necessária para embed externo.
5. No **workspace**, adicione o service principal como **Membro/Admin**.
6. Em cada relatório, pegue o **Workspace (group) ID** e o **Report ID**
   (estão na URL do Power BI) e cadastre em **/admin** no portal.

## 3. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha os valores.

## 4. Rodar

```bash
npm run dev      # desenvolvimento → http://localhost:3000
npm run build    # build de produção
```

## Deploy

Pode ir para a **Vercel** (mesmo fluxo dos outros projetos). Configure as
mesmas variáveis de ambiente no painel da Vercel. A `SUPABASE_SERVICE_ROLE_KEY`
e o `PBI_CLIENT_SECRET` ficam só no servidor — não use prefixo `NEXT_PUBLIC_`.

## Estrutura

```
src/
  app/
    login/                 # tela de login
    admin/                 # painel: relatórios, usuários, permissões
    relatorio/[id]/        # página que embeda um relatório
    api/embed-token/       # gera o embed token (server-only)
    auth/signout/          # logout
  components/              # Nav, ReportViewer, admin/*
  lib/
    supabase/              # clientes browser/server + service role
    powerbi.ts             # integração REST Power BI (service principal)
    auth.ts                # getProfile / requireAdmin
    types.ts
  middleware.ts            # sessão + proteção de rotas
supabase/schema.sql        # tabelas + RLS
```
