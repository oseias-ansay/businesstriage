import { CapitalDeGiro, DiagnosticoFinanceiro, MargemContribuicao } from './FinanceTools';
import { DiagnosticoComercial } from './CommercialTools';
import {
  AnaliseGoogleAds,
  AnaliseMetaAds,
  CampanhaGoogleAds,
  CampanhaMetaAds,
  ProducaoCriativos,
} from './TrafficTools';
import type { FC } from 'react';
import type { Tool, ToolId } from '../types';

const REGISTRY: Record<ToolId, FC> = {
  diag: DiagnosticoFinanceiro,
  cg: CapitalDeGiro,
  mc: MargemContribuicao,
  diagComercial: DiagnosticoComercial,
  creatives: ProducaoCriativos,
  metaCreate: CampanhaMetaAds,
  googleCreate: CampanhaGoogleAds,
  metaAnalysis: AnaliseMetaAds,
  googleAnalysis: AnaliseGoogleAds,
};

interface ToolPanelProps {
  tool: Tool;
  onBack: () => void;
}

export default function ToolPanel({ tool, onBack }: ToolPanelProps) {
  const Body = REGISTRY[tool.id];
  const Icon = tool.icon;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-5 flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-sm font-semibold text-navy-900 hover:text-navy-800"
      >
        ← Voltar ao painel
      </button>

      <section className="rounded-2xl border border-slate-200 bg-white p-8">
        <header className="mb-7 flex items-center gap-3.5">
          <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[10px] bg-navy-900">
            <Icon className="h-[22px] w-[22px] text-emerald-500" />
          </div>
          <div>
            <h2 className="m-0 text-xl font-extrabold text-navy-900">{tool.title}</h2>
            <p className="m-0 mt-0.5 text-[13px] text-slate-500">{tool.desc}</p>
          </div>
        </header>

        <Body />
      </section>
    </div>
  );
}
