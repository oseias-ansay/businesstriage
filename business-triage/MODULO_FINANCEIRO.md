# Módulo Financeiro — `/painel/financeiro`

Quatro telas dentro da Área do Cliente, usando o design system que já existia
(`.card`, `.btn-accent`, `.field`, `.metric-tile`, cores `navy` e `emerald`).

## Rotas

| Rota | Tela |
|---|---|
| `/painel` | Painel do Cliente (com o card de entrada do financeiro) |
| `/painel/financeiro` | Visão geral — KPIs, projeção de caixa, despesas por categoria |
| `/painel/financeiro/contas` | Contas a pagar / a receber, com baixa em lote |
| `/painel/financeiro/dre` | DRE gerencial por competência |

O formulário de lançamento é um modal, acessível de qualquer aba.

## Arquivos

```
src/
├── pages/
│   ├── PainelLayout.tsx        # NOVO — cabeçalho + Outlet (extraído do Dashboard)
│   └── Dashboard.tsx           # sem header próprio; ganhou o card do financeiro
└── modules/financeiro/
    ├── FinanceiroLayout.tsx    # abas + botão "Novo lançamento"
    ├── lib/format.ts           # moeda, datas, parsing pt-BR
    ├── hooks/useFinanceiro.ts  # todas as queries e mutações
    ├── components/
    │   ├── ui.tsx              # KpiCard, SituacaoBadge, Vazio, Carregando
    │   └── LancamentoModal.tsx
    └── pages/
        ├── VisaoGeral.tsx
        ├── Contas.tsx
        └── Dre.tsx
```

## Instalar

```bash
npm install          # traz react-router-dom, supabase-js, react-query, recharts
npm run dev
```

## Decisões

**Onde cada dado é buscado.** Cadastros e KPIs vêm direto do `supabase-js` —
são leituras simples e o RLS já protege. Listas, DRE, projeção e toda escrita
passam pela API, porque exigem paginação com contagem, montagem de comparativo
ou atomicidade (as parcelas nascem todas ou nenhuma).

**Uma invalidação só.** Qualquer lançamento ou baixa invalida a chave `['fin']`
inteira. Um título afeta KPI, projeção, DRE e listas ao mesmo tempo; invalidar
seletivamente seria otimização prematura com risco de deixar tela desatualizada
— o pior defeito possível num sistema financeiro.

**Datas ancoradas ao meio-dia.** `new Date('2026-07-31')` é lido como UTC e, em
fuso negativo, exibe 30/07. Todo parsing passa por `paraData()`, que força
`T12:00:00`. Erro de um dia em vencimento seria grave.

**O alerta de caixa negativo tem lugar de destaque.** É a informação mais
acionável do produto: mostra a data em que o saldo fura, com tempo de reagir.

**O DRE explica o regime na própria tela.** Um aviso fixo lembra que ali é
competência, não caixa. Sem isso, o cliente vê saldo positivo e resultado
negativo no mesmo mês e conclui que o sistema está errado.

**`viewer` não vê botões de ação.** O `readOnly` do TenantContext esconde
"Novo lançamento", as caixas de seleção e a baixa em lote — útil para dar
acesso ao contador sem risco de edição. A proteção real continua no RLS.

**O card do financeiro tem destaque próprio** no painel, em vez de virar mais
um item da grade. As outras ferramentas são calculadoras de uso pontual; esta
é a que o cliente abre todo dia.

## Pendências

1. **Anexo de comprovante.** A lista mostra o clipe quando existe anexo, mas
   não há upload. Falta a tela de detalhe do lançamento com `Storage`.
2. **Editar e excluir lançamento.** Só criação e baixa por enquanto.
3. **Cadastros.** Categorias, clientes/fornecedores e contas são lidos, mas não
   há tela para criá-los — hoje só pelo Studio. É a lacuna mais incômoda para
   um cliente real.
4. **Baixa parcial.** Herdada da Etapa 1: a baixa é sempre pelo valor cheio.
5. **Exportar DRE** em PDF/Excel para a reunião de PDCA.
6. **Paginação nas contas.** A API pagina, o front pede 100 e não oferece
   navegação. Suficiente para o MVP, insuficiente com um ano de histórico.
7. **Não compilei nem executei** — o ambiente Linux desta sessão segue
   bloqueado pela virtualização. Espere ajustes no primeiro `npm run dev`.
