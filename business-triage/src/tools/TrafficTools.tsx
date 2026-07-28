import { BarChart, Fact, MiniStat, Pill } from '../components/ui';

const CREATIVES = [
  { headline: '"Sua empresa está perdendo dinheiro sem saber."', cta: 'Agende seu diagnóstico gratuito' },
  { headline: '"3 sinais de que seu fluxo de caixa está no vermelho."', cta: 'Fale com um especialista' },
  { headline: '"Cresça com previsibilidade, não no achismo."', cta: 'Comece agora' },
];

export function ProducaoCriativos() {
  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
      {CREATIVES.map((c) => (
        <article key={c.headline} className="rounded-xl border border-slate-200 p-[18px]">
          <div
            className="mb-3.5 flex h-[120px] items-center justify-center rounded-lg font-mono text-[11px] text-slate-500"
            style={{
              background:
                'repeating-linear-gradient(45deg,#E2E8F0,#E2E8F0 10px,#F1F5F9 10px,#F1F5F9 20px)',
            }}
          >
            imagem do produto
          </div>
          <div className="mb-1.5 text-[13px] font-bold text-navy-900">{c.headline}</div>
          <div className="text-xs text-slate-500">CTA: {c.cta}</div>
        </article>
      ))}
    </div>
  );
}

export function CampanhaMetaAds() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-3">
        <Fact label="OBJETIVO" value="Conversão" />
        <Fact label="ORÇAMENTO DIÁRIO" value="R$ 80,00" />
        <Fact label="POSICIONAMENTO" value="Feed + Stories" />
      </div>
      <div>
        <div className="mb-2 text-xs font-semibold text-slate-500">PÚBLICOS SUGERIDOS</div>
        <div className="flex flex-wrap gap-2">
          <Pill>Lookalike 1% clientes</Pill>
          <Pill>Interesse: gestão empresarial</Pill>
          <Pill>Retargeting site 30 dias</Pill>
        </div>
      </div>
    </div>
  );
}

export function CampanhaGoogleAds() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-3">
        <Fact label="TIPO DE CAMPANHA" value="Pesquisa" />
        <Fact label="ORÇAMENTO DIÁRIO" value="R$ 100,00" />
        <Fact label="ESTRATÉGIA DE LANCE" value="Maximizar conversões" />
      </div>
      <div>
        <div className="mb-2 text-xs font-semibold text-slate-500">PALAVRAS-CHAVE SUGERIDAS</div>
        <div className="flex flex-wrap gap-2">
          <Pill tone="blue">diagnóstico financeiro empresa</Pill>
          <Pill tone="blue">consultoria para pequenas empresas</Pill>
          <Pill tone="blue">capital de giro cálculo</Pill>
        </div>
      </div>
    </div>
  );
}

export function AnaliseMetaAds() {
  return (
    <div>
      <div className="mb-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        <MiniStat label="CPA" value="R$ 24,80" />
        <MiniStat label="ROAS" value="4.2x" tone="accent" />
        <MiniStat label="CTR" value="2.1%" />
        <MiniStat label="FREQUÊNCIA" value="1.8" />
      </div>
      <BarChart bars={[40, 60, 50, 88, 70, 95]} highlight={[3, 5]} height="h-[90px]" />
    </div>
  );
}

export function AnaliseGoogleAds() {
  return (
    <div>
      <div className="mb-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        <MiniStat label="CPC MÉDIO" value="R$ 3,20" />
        <MiniStat label="CONVERSÕES" value="142" />
        <MiniStat label="CTR" value="3.6%" />
        <MiniStat label="QUALITY SCORE" value="8/10" tone="accent" />
      </div>
      <BarChart
        bars={[55, 45, 80, 65, 92, 70]}
        highlight={[2, 4]}
        height="h-[90px]"
        baseColor="bg-blue-200"
        accentColor="bg-blue-600"
      />
    </div>
  );
}
