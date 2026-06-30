# Guia de Configuração — Portal BI DriveData

Guia para o **administrador** que vai configurar e testar o portal de ponta a
ponta, incluindo a integração segura com o Power BI (**App Owns Data**) e o
isolamento de dados por cliente (**RLS dinâmico**).

> Público: administrador do portal **e** administrador do Azure.
> A preparação do banco de dados já foi feita pelo time de desenvolvimento.

---

## Visão geral — como o portal funciona

- O portal organiza os painéis em **Áreas** (ex.: Operações, RH, Financeiro) e
  controla **quem vê cada área**.
- Há **dois modos** de exibir um painel:
  - **Por link** (simples): você cola o link "Publicar na web" do Power BI.
    Não exige Azure, mas é público (qualquer um com o link vê os dados).
  - **App Owns Data** (profissional): o portal gera um *embed token* com um
    **service principal** e pode aplicar **RLS** — o usuário final não precisa
    de conta Microsoft e cada cliente vê só os próprios dados.

Este guia foca no **App Owns Data + RLS**, que é o modo seguro para produção.

---

# Parte 1 — Preparar o Azure (você, como admin do Azure)

### 1.1 Registrar o aplicativo (service principal)
1. **Microsoft Entra ID → Registros de aplicativo → Novo registro**.
2. Dê um nome (ex.: `Portal BI DriveData`) e registre.
3. Anote o **ID do aplicativo (cliente)** = *Client ID*.
4. Anote o **ID do diretório (locatário)** = *Tenant ID*.

### 1.2 Gerar o segredo
1. No app registrado → **Certificados e segredos → Novo segredo do cliente**.
2. Copie o **Valor** do segredo na hora (ele só aparece uma vez) = *Client Secret*.

### 1.3 Liberar o service principal no Power BI
1. **Portal de Administração do Power BI → Configurações do locatário**.
2. Habilite **"Os service principals podem usar APIs do Power BI"** e
   associe o app a um **grupo de segurança** permitido.

### 1.4 Garantir a capacidade
- O **workspace** do relatório precisa estar em uma **capacidade**
  **A-SKU (Power BI Embedded)** ou **Fabric (F-SKU)**.
- Confirme que a capacidade está **ativa** (não pausada) — sem isso, a geração
  do token falha.

### 1.5 Dar acesso ao workspace
- No **workspace** do Power BI → **Acessar** → adicione o **service principal**
  (o app registrado) como **Membro** (ou Admin).

✅ Ao final você tem em mãos: **Tenant ID**, **Client ID**, **Client Secret**.

---

# Parte 2 — Preparar o relatório com RLS (Power BI Desktop)

> Só necessário se você quer isolar dados por cliente. Pule se todos podem ver
> tudo.

1. Abra o `.pbix` → **Modelagem → Gerenciar funções**.
2. **Criar** uma função (anote o nome exato, ex.: `Cliente`).
3. Na tabela que identifica o cliente, defina a regra DAX. Recomendado com
   service principal:
   - `[ClienteId] = CUSTOMDATA()`  *(o portal envia o identificador via customData)*
   - *(alternativa: `[ClienteId] = USERNAME()`)*
4. **Publique** o relatório no workspace que está na capacidade.

---

# Parte 3 — Configurar no portal

Entre no portal como **administrador**.

### 3.1 Conectar o Power BI
1. Menu **Administração → Power BI**.
2. Em **Credenciais do service principal**, preencha:
   - **Tenant ID**, **Client ID**, **Client Secret** (da Parte 1).
3. Clique em **Salvar configuração**.
4. Clique em **Testar conexão** → deve listar seus **workspaces**. ✅

### 3.2 Criar a área e importar o relatório
1. Menu **Administração → Áreas → + Nova área** (ex.: *Logística*).
2. Abra a área (**Gerenciar painéis**).
3. Na coluna **"Avançado — importar via service principal"**, clique em
   **Buscar relatórios no Power BI**.
4. Escolha o **workspace** → clique em **Importar** no relatório desejado.
   (Esse painel passa a usar o embed token — é onde o RLS funciona.)

### 3.3 Definir a role de RLS no painel
1. Ainda na área, no painel importado, clique no **lápis (editar)**.
2. No campo **"Role de RLS"**, digite o **nome exato** da função criada no
   `.pbix` (ex.: `Cliente`).
3. Clique em **Salvar**.

### 3.4 Cadastrar usuários e a identidade de cada um
1. Menu **Administração → Usuários → + Novo usuário** (nome, e-mail, senha
   temporária).
2. Clique em **"X área(s)"** para expandir o usuário.
3. Preencha **"Identidade RLS"** com o valor que a regra DAX espera (ex.: o
   **ID/CNPJ do cliente**) → clique fora do campo para salvar.
4. Marque a(s) **área(s)** que ele pode ver.

> Administradores veem todas as áreas, sem filtro de RLS.

---

# Parte 4 — Testar

### Teste A — App Owns Data (sem RLS)
1. Importe um relatório (Parte 3.2) **sem** preencher a Role de RLS.
2. Abra o painel no portal → o gráfico deve carregar **sem pedir login
   Microsoft** ao usuário final.

### Teste B — RLS dinâmico (isolamento por cliente)
1. Configure a Role de RLS no painel (3.3) e a Identidade RLS no usuário (3.4).
2. **Saia** e entre com o usuário de teste → o painel deve mostrar **apenas os
   dados daquele cliente**.
3. Repita com um segundo usuário/identidade diferente → confirme que cada um vê
   só os próprios dados.

✅ Se o Teste B isola os dados, o RLS está funcionando ponta a ponta.

---

# Solução de problemas

A mensagem de erro indica a causa:

| Sintoma | Causa provável | Ação |
|---|---|---|
| "Power BI ainda não configurado" | Credenciais não salvas | Salve o service principal na tela Power BI |
| Falha ao testar conexão (401/403) | SP sem acesso / tenant setting off | Adicione o SP como membro do workspace e habilite nas configurações do locatário |
| Erro citando "Premium/Embedded capacity" | Workspace fora de capacidade ou pausada | Associe/retome a capacidade A-SKU/Fabric |
| "Role não encontrada" | Nome da Role de RLS diferente do `.pbix` | Ajuste o campo "Role de RLS" para o nome exato |
| Painel abre mas não filtra | Regra DAX x valor enviado | `CUSTOMDATA()` ↔ identidade; ou use `USERNAME()` |

> Regra de ouro: DAX com **`CUSTOMDATA()`** → o portal envia o valor como
> *customData*. DAX com **`USERNAME()`** → envia como *username*. O **nome da
> role** precisa ser idêntico ao do `.pbix`.

---

# Apêndice — Modo simples (sem Azure)

Para um painel não sensível e rápido de publicar:
1. No Power BI: **Arquivo → Incorporar relatório → Publicar na web**.
2. No portal: área → **Adicionar painel por link** → cole o link → salve.

Funciona na hora, mas o link é **público** — use só para dados que podem ser
abertos.
