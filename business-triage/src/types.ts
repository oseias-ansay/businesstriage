import type { LucideIcon } from 'lucide-react';

/**
 * @deprecated A navegação passou a ser por rotas (react-router-dom).
 * Mantido só para não quebrar imports antigos; remova quando não houver mais uso.
 */
export type View = 'public' | 'login' | 'dashboard';

export type ToolId =
  | 'diag'
  | 'cg'
  | 'mc'
  | 'diagComercial'
  | 'creatives'
  | 'metaCreate'
  | 'googleCreate'
  | 'metaAnalysis'
  | 'googleAnalysis';

/** Grupo em que a ferramenta aparece no painel do cliente. */
export type ToolModule = 'Diagnósticos' | 'Financeiro' | 'Tráfego';

/** Diagnóstico que o card de serviço abre ao ser clicado na home. */
export type ServiceAction = 'diagnostico-financeiro' | 'diagnostico-comercial';

export interface Tool {
  id: ToolId;
  module: ToolModule;
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface Service {
  icon: LucideIcon;
  title: string;
  desc: string;
  /** Quando presente, o card ganha um CTA que abre o formulário correspondente. */
  action?: ServiceAction;
  /** Texto do CTA. Só é usado quando `action` existe. */
  cta?: string;
}

export interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
}
