# Como o RLS funciona no Portal — caso de uso

Este texto explica, de forma didática, como o portal entrega o **mesmo painel**
para **vários usuários** mostrando, para cada um, **apenas os dados que ele
pode ver** — usando RLS (Row-Level Security).

---

## O problema

Imagine que a DriveData tem um painel **"Faturamento por Cliente"** no Power BI,
com os dados de **todos** os clientes juntos. Você quer disponibilizar esse
painel no portal para várias pessoas, mas:

- O **Cliente A** só pode ver o faturamento **dele**.
- O **Cliente B** só pode ver o faturamento **dele**.
- Ninguém pode ver o dado do outro.

E tem um detalhe: essas pessoas **não têm conta Microsoft**. Elas só existem no
**nosso portal** (e-mail e senha criados por você). Podem ser centenas.

## A ideia central

O usuário do portal **não é** um usuário do Power BI. Quem conversa com a
Microsoft é o **portal** (via service principal). Então, na hora de abrir o
painel, o portal **avisa a Microsoft quem é aquela pessoa** enviando um
identificador — a **"Identidade RLS"**.

A Microsoft aplica o filtro **no servidor dela**, antes de desenhar o gráfico.
O navegador do usuário nunca recebe os dados dos outros.

## Duas camadas de controle (importante não confundir)

| Camada | Pergunta | Onde se controla |
|---|---|---|
| **1. Acesso** | A pessoa pode **abrir** o painel? | Portal → libera a **Área** para o usuário |
| **2. RLS** | Dentro do painel, **quais linhas** ela vê? | Portal → **Identidade RLS** do usuário |

Se a pessoa não deve ver o painel de jeito nenhum, **não libere a área**. Se ela
pode ver o painel mas só a parte dela, use a **Identidade RLS**.

---

## Passo a passo (o que você configura uma vez)

### No Power BI (quem faz o modelo)
1. No `.pbix`, cria a **função de RLS** (ex.: `Cliente`) com a regra:
   `[ClienteId] = CUSTOMDATA()`
2. Publica no workspace que está na capacidade.

### No portal
3. **Áreas → (área) →** importa o painel via service principal.
4. No painel, clica no **lápis** e preenche **"Role de RLS"** com o nome exato
   da função (ex.: `Cliente`). O painel passa a exibir um selo **RLS**.
5. **Usuários →** para cada pessoa, preenche a **"Identidade RLS"** com o valor
   do cliente dela (ex.: `A`, `B`, o CNPJ, o código interno…).
6. Libera a **área** para cada pessoa.

---

## O que acontece quando o usuário abre o painel

1. A Maria (Identidade RLS = `A`) clica no painel.
2. O **backend do portal** pede o token à Microsoft dizendo:
   *"gere o token deste relatório, mas trate este acesso como identidade `A`,
   na função `Cliente`."*
3. A regra DAX `[ClienteId] = CUSTOMDATA()` recebe `A` → a Microsoft devolve
   **só as linhas do Cliente A**.
4. O gráfico aparece para a Maria **já filtrado**. Ela não tem como ver o
   Cliente B — nem inspecionando a página, porque o filtro aconteceu no
   servidor da Microsoft.

**Mesmo painel, pessoas diferentes:**

| Usuário do portal | Identidade RLS | O que enxerga |
|---|---|---|
| maria@clienteA.com | `A` | só o Cliente A |
| joao@clienteB.com | `B` | só o Cliente B |
| ana@clienteC.com | `C` | só o Cliente C |
| pedro (sem identidade) | — | **vazio** (nada) |

---

## Por que é seguro (à prova de falha)

- **Sem Identidade RLS → vê vazio, nunca o dado do outro.** O padrão é fechado.
- A identidade vai **no servidor**, dentro do token. O usuário **não escolhe** a
  própria identidade e o navegador não a manipula.
- Dá para ter **usuários infinitos, sem licença Microsoft** — cada um filtrado
  pela identidade que você atribuiu.
- O portal **avisa na tela** quando o painel tem RLS mas o usuário está **sem
  Identidade RLS** (para você não descobrir pelo "gráfico vazio" sem motivo).

## O único ponto de atenção

O risco de alguém ver o dado errado existe **só** se você:
1. Liberar a área para a pessoa **e**
2. Colocar na Identidade RLS dela o **valor de outro cliente**.

Ou seja: o RLS é tão bom quanto a **identidade que você cadastra**. Por isso a
Identidade RLS de cada usuário precisa estar **correta**.

---

## Resumo em uma frase

> O portal entrega o mesmo painel para todo mundo, mas **fala para a Microsoft
> quem é cada usuário** (a Identidade RLS), e a Microsoft **filtra os dados no
> servidor** — então cada pessoa vê só o que é dela, mesmo sem ter conta
> Microsoft.
