# Business Triage — Site institucional + Área do Cliente

Conversão do protótipo Claude Design (`Business Triage.dc.html`) para um projeto React de produção.

**Stack:** Vite · React 18 · TypeScript · Tailwind CSS · lucide-react

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # checagem de tipos + build de produção em /dist
npm run preview
```

## Estrutura

```
src/
├── App.tsx                  # roteamento de views (público / login / dashboard)
├── types.ts                 # View, ToolId, Tool, Service, ChatMessage
├── data/content.ts          # SITE, SERVICES, TOOLS, helper fmt()
├── hooks/useIsMobile.ts     # breakpoint 860px (igual ao protótipo)
├── components/
│   ├── ui.tsx               # Logo, Stat, MiniStat, BarChart, Pill, Fact
│   ├── Header.tsx           # header fixo + menu mobile
│   ├── Footer.tsx
│   └── AssistantChat.tsx    # assistente com respostas por regra
├── sections/                # Hero, About, Services, Contact
├── pages/                   # PublicSite, Login, Dashboard
└── tools/
    ├── ToolPanel.tsx        # registry id → componente
    ├── FinanceTools.tsx     # Diagnóstico, Capital de Giro, Margem/Ponto de Equilíbrio
    └── TrafficTools.tsx     # Criativos, Meta/Google Ads (criação e análise)
```

## Design tokens

| Token | Valor | Uso |
|---|---|---|
| `navy-900` | `#0B1E3B` | fundo do header, textos, botão secundário |
| `navy-800` | `#122A4E` | gradientes e hover |
| `navy-ink` | `#06281c` | texto sobre o verde de destaque |
| `emerald-500` | `#10B981` | CTA principal, ícones de destaque |
| `emerald-600` | `#059669` | eyebrows, WhatsApp, valores positivos |
| slate 50→700 | padrão Tailwind | superfícies, bordas e textos de apoio |

Tipografia: **Inter** (400/500/600/700/800), carregada via Google Fonts no `index.html`.

## O que é mock e precisa de backend

| Ponto | Arquivo | Situação |
|---|---|---|
| Login | `pages/Login.tsx` | aceita qualquer credencial → vai para o dashboard |
| Formulário de contato | `sections/Contact.tsx` | só exibe confirmação local |
| Assistente | `components/AssistantChat.tsx` | respostas por palavra-chave, sem API |
| Diagnóstico Financeiro | `tools/FinanceTools.tsx` | indicadores fixos (1.8x / 11.4% / 38% / 84) |
| Métricas Meta e Google Ads | `tools/TrafficTools.tsx` | dados de exemplo |

Já calculam de verdade: **Capital de Giro** e **Margem de Contribuição / Ponto de Equilíbrio**.

## Configuração rápida

Dados de contato, WhatsApp e CNPJ ficam centralizados em `src/data/content.ts` (constante `SITE`).
