import { Calendar, Lock, Sparkles } from 'lucide-react';
import { BarChart } from '../components/ui';

interface HeroProps {
  onLogin: () => void;
}

const KPIS = [
  { label: 'LIQUIDEZ', value: '1.8x', accent: false },
  { label: 'MARGEM', value: '32%', accent: false },
  { label: 'SCORE', value: '84/100', accent: true },
];

export default function Hero({ onLogin }: HeroProps) {
  return (
    <section
      id="hero"
      className="bg-gradient-to-b from-navy-900 to-navy-800 px-6 pb-[110px] pt-[168px] text-white"
    >
      <div className="mx-auto flex max-w-shell flex-wrap items-center gap-16">
        <div className="min-w-[300px] flex-1 basis-[480px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3.5 py-1.5 text-[13px] font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            Diagnóstico especializado para PMEs
          </div>

          <h1 className="m-0 mb-5 text-pretty text-4xl font-extrabold leading-[1.12] tracking-[-0.02em] md:text-[46px]">
            Business Triage: Diagnóstico Financeiro e Comercial para Pequenas Empresas.
          </h1>

          <p className="m-0 mb-9 max-w-[560px] text-pretty text-lg leading-relaxed text-slate-300">
            Melhore o desempenho do seu negócio, otimize processos e prepare sua empresa para um
            crescimento sustentável.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-[10px] bg-emerald-500 px-7 py-4 text-[15px] font-bold text-navy-ink shadow-cta transition-colors hover:bg-emerald-600"
            >
              <Calendar className="h-[18px] w-[18px]" />
              Agendar Diagnóstico
            </a>
            <button type="button" onClick={onLogin} className="btn-ghost-light">
              <Lock className="h-4 w-4" />
              Acessar Área do Cliente
            </button>
          </div>
        </div>

        {/* Mock do painel de diagnóstico */}
        <div className="min-w-[300px] flex-1 basis-[420px]">
          <div className="rounded-2xl bg-white p-[26px] shadow-float">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-bold text-navy-900">Painel de Diagnóstico</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                Saudável
              </span>
            </div>

            <div className="mb-[22px] grid grid-cols-3 gap-3">
              {KPIS.map((kpi) => (
                <div key={kpi.label} className="rounded-[10px] bg-slate-50 p-3">
                  <div className="mb-1.5 text-[11px] font-semibold text-slate-500">{kpi.label}</div>
                  <div
                    className={`text-xl font-extrabold ${
                      kpi.accent ? 'text-emerald-600' : 'text-navy-900'
                    }`}
                  >
                    {kpi.value}
                  </div>
                </div>
              ))}
            </div>

            <BarChart bars={[45, 65, 85, 55, 70, 95]} highlight={[2, 5]} />
          </div>
        </div>
      </div>
    </section>
  );
}
