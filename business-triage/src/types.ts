import type { LucideIcon } from 'lucide-react';

export type View = 'public' | 'login' | 'dashboard';

export type ToolId =
  | 'diag'
  | 'cg'
  | 'mc'
  | 'creatives'
  | 'metaCreate'
  | 'googleCreate'
  | 'metaAnalysis'
  | 'googleAnalysis';

export type ToolModule = 'Financeiro' | 'Tráfego';

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
}

export interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
}
