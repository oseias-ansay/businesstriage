import {
  Activity,
  BarChart2,
  BarChart3,
  FileText,
  Megaphone,
  Percent,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import type { Service, Tool } from '../types';

/** Contato / identidade do site. Ajuste aqui para publicar em produção. */
export const SITE = {
  name: 'Business Triage',
  domain: 'businesstriage.com.br',
  email: 'contato@businesstriage.com.br',
  location: 'Curitiba, PR — Atendimento em todo o Brasil',
  whatsapp: 'https://wa.me/5541991777268',
  cnpj: '00.000.000/0001-00',
} as const;

export const SERVICES: Service[] = [
  {
    icon: FileText,
    title: 'Diagnóstico Financeiro & DRE Empresarial',
    desc: 'Análise completa da saúde financeira com base na Demonstração de Resultado do Exercício.',
  },
  {
    icon: TrendingUp,
    title: 'Diagnóstico Comercial & Funil de Vendas',
    desc: 'Mapeamento do funil comercial para identificar gargalos e oportunidades de conversão.',
  },
  {
    icon: Wallet,
    title: 'Gestão de Capital de Giro e Margem',
    desc: 'Cálculo de capital de giro, margem de contribuição e ponto de equilíbrio.',
  },
  {
    icon: Megaphone,
    title: 'Estratégia e Performance de Tráfego Pago',
    desc: 'Estruturação e análise de campanhas em Meta Ads e Google Ads.',
  },
];

export const TOOLS: Tool[] = [
  {
    id: 'diag',
    module: 'Financeiro',
    icon: Activity,
    title: 'Diagnóstico Financeiro',
    desc: 'Avaliação completa da saúde financeira da empresa.',
  },
  {
    id: 'cg',
    module: 'Financeiro',
    icon: Wallet,
    title: 'Cálculo de Capital de Giro',
    desc: 'Descubra a saúde de curto prazo do seu negócio.',
  },
  {
    id: 'mc',
    module: 'Financeiro',
    icon: Percent,
    title: 'Margem de Contribuição e Ponto de Equilíbrio',
    desc: 'Defina preços e metas de venda com precisão.',
  },
  {
    id: 'creatives',
    module: 'Tráfego',
    icon: Sparkles,
    title: 'Produção de Criativos',
    desc: 'Gere conceitos criativos para campanhas de anúncios.',
  },
  {
    id: 'metaCreate',
    module: 'Tráfego',
    icon: Rocket,
    title: 'Criação de Campanha Meta Ads',
    desc: 'Estruture campanhas para Instagram e Facebook.',
  },
  {
    id: 'googleCreate',
    module: 'Tráfego',
    icon: Target,
    title: 'Criação de Campanha Google Ads',
    desc: 'Estruture campanhas de busca e display.',
  },
  {
    id: 'metaAnalysis',
    module: 'Tráfego',
    icon: BarChart3,
    title: 'Análise de Campanha Meta Ads',
    desc: 'Acompanhe o desempenho das suas campanhas.',
  },
  {
    id: 'googleAnalysis',
    module: 'Tráfego',
    icon: BarChart2,
    title: 'Análise de Campanha Google Ads',
    desc: 'Métricas e insights de suas campanhas Google.',
  },
];

export const FIN_TOOLS = TOOLS.filter((t) => t.module === 'Financeiro');
export const TRAF_TOOLS = TOOLS.filter((t) => t.module === 'Tráfego');

/** Formata número no padrão pt-BR com 2 casas decimais. */
export const fmt = (n: number): string =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
