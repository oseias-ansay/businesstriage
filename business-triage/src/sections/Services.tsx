import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { SERVICES } from '../data/content';
import DiagnosticoFinanceiroModal from '../components/DiagnosticoFinanceiroModal';
import DiagnosticoComercialModal from '../components/DiagnosticoComercialModal';
import type { ServiceAction } from '../types';

export default function Services() {
  const [aberto, setAberto] = useState<ServiceAction | null>(null);

  return (
    <section id="services" className="bg-slate-50 px-6 py-[90px]">
      <div className="mx-auto max-w-shell">
        <div className="mx-auto mb-14 max-w-[640px] text-center">
          <div className="eyebrow">Serviços</div>
          <h2 className="m-0 text-[32px] font-extrabold tracking-[-0.01em] text-navy-900">
            O que fazemos por você
          </h2>
        </div>

        <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {SERVICES.map(({ icon: Icon, title, desc, action, cta }) => (
            <article
              key={title}
              className="flex flex-col rounded-[14px] border border-slate-200 bg-white p-7 shadow-card"
            >
              <div className="mb-[18px] flex h-11 w-11 items-center justify-center rounded-[10px] bg-navy-900">
                <Icon className="h-[22px] w-[22px] text-emerald-500" />
              </div>
              <h3 className="m-0 mb-2.5 text-pretty text-[17px] font-bold text-navy-900">{title}</h3>
              <p className="m-0 text-pretty text-sm leading-relaxed text-slate-500">{desc}</p>

              {action && (
                <button
                  type="button"
                  onClick={() => setAberto(action)}
                  className="btn-accent mt-5 self-start"
                >
                  {cta ?? 'Começar'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </article>
          ))}
        </div>
      </div>

      <DiagnosticoFinanceiroModal
        open={aberto === 'diagnostico-financeiro'}
        onClose={() => setAberto(null)}
      />
      <DiagnosticoComercialModal
        open={aberto === 'diagnostico-comercial'}
        onClose={() => setAberto(null)}
      />
    </section>
  );
}
