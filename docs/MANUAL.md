# Manual — Portal BI DriveData

Portal que exibe painéis do **Power BI** controlando, por **área** e por
**usuário**, quem pode ver o quê. Construído em Next.js + Supabase, deploy na
Vercel.

---

## 1. Perfis de acesso

- **Administrador** — vê todas as áreas, gerencia áreas, painéis, usuários,
  permissões e a conexão com o Power BI.
- **Usuário** — vê apenas as áreas que foram liberadas para ele.

## 2. Conceitos

- **Área** — um agrupador (ex.: Operações, RH, Financeiro, Logística).
- **Painel** — um relatório do Power BI dentro de uma área.
- **Permissão** — liberação de uma **área** para um **usuário**. Quem tem a
  área, vê todos os painéis ativos dela. Admin vê tudo.

---

## 3. Dois modos de incorporar um painel

O portal suporta **dois modos**. Você escolhe por painel.

### Modo A — Link de incorporação (simples, sem Azure)

Cole o link "Publicar na web" (`/view?r=…`) ou um `<iframe>` do Power BI. O
portal renderiza num iframe.

- ✅ Não precisa de Azure, service principal nem capacidade.
- ⚠️ "Publicar na web" é **público** (qualquer um com o link vê os dados). O
  portal só controla quem chega na página.
- ⚠️ Links `reportEmbed?autoAuth` exigem que o espectador esteja logado numa
  conta Microsoft do tenant — bom para equipe interna, não para cliente
  externo sem conta.

### Modo B — App Owns Data + RLS (profissional, seguro)

O backend do portal pede um **embed token** à Microsoft usando um **service
principal**, e pode enviar a **identidade efetiva (RLS)** para filtrar os
dados no servidor.

- ✅ Usuário final **não precisa** de conta/licença Microsoft.
- ✅ **RLS dinâmico**: Cliente A não vê dados do Cliente B (filtro aplicado no
  servidor da Microsoft — impossível burlar pelo navegador).
- ⚠️ Exige infra Azure (App Registration + **capacidade A-SKU/Fabric**) e uma
  **role de RLS** definida no `.pbix`.

| | Modo A (Link) | Modo B (App Owns Data + RLS) |
|---|---|---|
| Precisa de Azure/capacidade | Não | **Sim** |
| Usuário externo sem conta MS | Só "Publicar na web" (público) | **Sim, seguro** |
| Isolamento de dados (multi-cliente) | Não | **Sim (RLS)** |
| Esforço de configuração | Baixo | Médio |

---

## 4. O que o sistema JÁ está preparado para fazer

**Autenticação e acesso**
- Login próprio (Supabase Auth), proteção de rotas, papéis admin/usuário.

**Áreas e painéis**
- Criar/editar/excluir áreas (nome, descrição, cor).
- Adicionar painel por **link** ou **importar via service principal**.
- Editar/renomear/ativar/desativar/remover painéis.
- Troca rápida entre painéis da mesma área no visualizador.

**Permissões (dois lados)**
- Por usuário: marcar as áreas que ele vê (marcar todas / limpar).
- Por área: marcar os usuários que a veem (liberar/remover de todos).

**Gestão de usuários (robusta)**
- Criar usuário com senha temporária.
- Filtros por papel e status; busca por nome/e-mail.
- **Redefinir senha** (gera senha temporária e mostra para copiar).
- **Ativar/Desativar** (bane no Auth — bloqueia login).
- **Remover** usuário.
- Definir **papel** (admin/usuário).

**Power BI — App Owns Data**
- Guardar as credenciais do service principal no sistema (tela Power BI).
- **Testar conexão** e **importar relatórios** do workspace com um clique.
- **RLS dinâmico**: role de RLS por painel + identidade RLS por usuário; o
  backend monta o `EffectiveIdentity` automaticamente ao gerar o token.

**Conta e UX**
- Página "Minha conta" (trocar senha, editar nome).
- Responsivo (menu lateral no celular), busca, breadcrumbs, skeletons,
  toasts de confirmação, identidade visual DriveData.

---

## 5. Pré-requisitos para testar o Modo B (App Owns Data + RLS)

### a) Supabase (uma vez)
Rode no SQL Editor:
```sql
alter table public.profiles   add column if not exists ativo boolean not null default true;
alter table public.relatorios add column if not exists rls_role text;
alter table public.profiles   add column if not exists rls_identity text;
```

### b) Azure / Microsoft Entra ID
1. **App Registration** → cria o service principal. Gere um **client secret**.
2. Anote **Tenant ID**, **Client ID**, **Secret**.
3. **Power BI Admin Portal → Tenant settings**: habilite
   *"Service principals can use Power BI APIs"* (adicione o app a um grupo
   de segurança permitido).
4. **Capacidade**: o workspace precisa estar numa capacidade
   **A-SKU (Power BI Embedded)** ou **Fabric (F-SKU)**. Sem isso, o
   `GenerateToken` falha.
5. No **workspace**, adicione o service principal como **Membro** (ou Admin).

### c) Power BI Desktop (para RLS)
1. Abra o `.pbix` → **Modelagem → Gerenciar funções**.
2. Crie uma role (ex.: `Cliente`) com a regra DAX, ex.:
   - `[ClienteId] = CUSTOMDATA()`  ← recomendado com service principal, ou
   - `[ClienteId] = USERNAME()`
3. **Publique** o relatório no workspace da capacidade.

---

## 6. Passo a passo de teste

### Teste 1 — Painel por link (rápido, valida o portal)
1. Admin → **Áreas** → crie/abra uma área.
2. **Adicionar painel por link** → cole o link "Publicar na web".
3. Volte à home → abra a área → abra o painel → o dashboard aparece.
4. Crie um **usuário comum**, libere a área para ele, entre com esse usuário
   e confirme que ele vê só o que foi liberado.

### Teste 2 — App Owns Data sem RLS
1. Admin → **Power BI** → cole Tenant/Client/Secret → **Salvar**.
2. **Testar conexão** → deve listar os workspaces.
3. Admin → **Áreas → (área)** → coluna "Avançado — importar via service
   principal" → **Buscar relatórios** → escolha o workspace → **Importar**.
4. Abra o painel importado → o dashboard renderiza via embed token (sem
   precisar de login Microsoft do usuário final).

### Teste 3 — App Owns Data com RLS (multi-tenant)
1. Faça o Teste 2 primeiro (painel importado funcionando).
2. No painel, **lápis (editar)** → preencha **"Role de RLS"** com o nome
   EXATO da role do `.pbix` (ex.: `Cliente`) → **Salvar**.
3. Admin → **Usuários** → expanda o usuário → preencha **"Identidade RLS"**
   com o valor que a regra DAX espera (ex.: o ID/CNPJ do cliente) → clique
   fora para salvar. Libere a área.
4. Entre com esse usuário e abra o painel → os dados vêm **filtrados** para a
   identidade dele.
5. Repita com outro usuário/identidade e confirme que cada um vê só os seus
   dados.

---

## 7. Solução de problemas (erros comuns no Modo B)

A API do Power BI devolve mensagens específicas — se aparecer erro ao abrir o
painel, o motivo costuma ser:

- **"Power BI ainda não configurado"** → faltou salvar o service principal na
  tela Power BI.
- **GenerateToken 401/403** → o service principal não é membro do workspace,
  ou a tenant setting de service principals está desabilitada.
- **Erro de capacidade / "not in a Premium/Embedded capacity"** → o workspace
  não está numa capacidade A-SKU/Fabric (ou ela está **pausada**).
- **Role não encontrada** → o nome em "Role de RLS" não bate exatamente com a
  role do `.pbix`.
- **Dados não filtram** → a regra DAX usa `USERNAME()` mas o valor foi enviado
  como `customData` (ou vice-versa). Alinhe a regra com a "Identidade RLS".

---

## 8. Estrutura técnica (resumo)

```
Frontend (Next.js)         → ReportViewer (powerbi-client-react) / IframeViewer
Backend  (Route Handler)   → /api/embed-token (server-only)
                             lib/powerbi.ts: getAadToken → GenerateToken (+EffectiveIdentity)
Identidade/Segredos        → Supabase (config_powerbi via service role)
Dados                      → Supabase: areas, relatorios, permissoes_area, profiles
```

O segredo do service principal **nunca** vai ao navegador: o token é gerado no
servidor e só o embed token (curta duração) chega ao frontend.
