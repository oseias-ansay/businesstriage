import { useState } from 'react';
import { fmt } from '../data/content';
import DiagnosticoFinanceiroModal from '../components/DiagnosticoFinanceiroModal';

const ENTREGAS_FINANCEIRO = [
  'Score financeiro de 0 a 100, com os quatro pilares detalhados',
  'Margem de contribuição, ponto de equilíbrio e margem de segurança',
  'Ciclo financeiro, NCG e cobertura de caixa em dias',
  'Endividamento, custo dos juros e comprometimento da receita',
  'Plano de ação priorizado por impacto',
];

/** Diagnóstico Financeiro — coleta os dados e dispara a análise. */
export function DiagnosticoFinanceiro() {
  const [aberto, setAberto] = useState(false);

  return (
    <div>
      <p className="m-0 mb-4 text-sm leading-relaxed text-slate-600">
        Preencha os dados do último mês fechado. A análise é gerada a partir dos números que você
        informar e o relatório completo chega no seu e-mail em até 24 horas úteis.
      </p>

      <ul className="m-0 mb-6 list-none space-y-2 p-0">
        {ENTREGAS_FINANCEIRO.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-emerald-500" />
            {item}
          </li>
        ))}
      </ul>

      <button type="button" onClick={() => setAberto(true)} className="btn-accent px-[22px] py-3">
        Iniciar diagnóstico
      </button>

      <p className="m-0 mt-3 text-xs text-slate-400">Leva cerca de 6 minutos.</p>

      <DiagnosticoFinanceiroModal open={aberto} onClose={() => setAberto(false)} />
    </div>
  );
}

/** Capital de Giro = Ativo Circulante − Passivo Circulante. */
export function CapitalDeGiro() {
  const [ativo, setAtivo] = useState('50000');
  const [passivo, setPassivo] = useState('32000');

  const cg = (Number(ativo) || 0) - (Number(passivo) || 0);

  return (
    <div className="flex flex-wrap gap-8">
      <div className="flex flex-1 basis-64 flex-col gap-4">
        <div>
          <label className="label" htmlFor="cg-ativo">
            Ativo Circulante (R$)
          </label>
          <input
            id="cg-ativo"
            type="number"
            className="field w-full"
            value={ativo}
            onChange={(e) => setAtivo(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="cg-passivo">
            Passivo Circulante (R$)
          </label>
          <input
            id="cg-passivo"
            type="number"
            className="field w-full"
            value={passivo}
            onChange={(e) => setPassivo(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-1 basis-64 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <div className="mb-2 text-[13px] font-semibold text-slate-500">CAPITAL DE GIRO</div>
        <div className="text-[32px] font-extrabold text-navy-900">R$ {fmt(cg)}</div>
        {cg >= 0 && (
          <div className="mt-2 text-[13px] font-semibold text-emerald-600">Posição confortável</div>
        )}
      </div>
    </div>
  );
}

/** Margem de contribuição e ponto de equilíbrio. */
export function MargemContribuicao() {
  const [preco, setPreco] = useState('150');
  const [custoVar, setCustoVar] = useState('90');
  const [custoFixo, setCustoFixo] = useState('18000');

  const p = Number(preco) || 0;
  const cv = Number(custoVar) || 0;
  const cf = Number(custoFixo) || 0;

  const mc = p - cv;
  const mcPercent = p > 0 ? (mc / p) * 100 : 0;
  const peUnidades = mc > 0 ? cf / mc : 0;
  const peReais = peUnidades * p;

  const fields = [
    { id: 'mc-preco', label: 'Preço de Venda (R$)', value: preco, set: setPreco },
    { id: 'mc-cv', label: 'Custo Variável Unitário (R$)', value: custoVar, set: setCustoVar },
    { id: 'mc-cf', label: 'Custos Fixos Mensais (R$)', value: custoFixo, set: setCustoFixo },
  ];

  return (
    <div className="flex flex-wrap gap-8">
      <div className="flex flex-1 basis-64 flex-col gap-4">
        {fields.map((f) => (
          <div key={f.id}>
            <label className="label" htmlFor={f.id}>
              {f.label}
            </label>
            <input
              id={f.id}
              type="number"
              className="field w-full"
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-1 basis-64 flex-col justify-center gap-3.5 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <div>
          <div className="metric-label">MARGEM DE CONTRIBUIÇÃO</div>
          <div className="text-[22px] font-extrabold text-navy-900">
            R$ {fmt(mc)} ({mcPercent.toFixed(1)}%)
          </div>
        </div>
        <div>
          <div className="metric-label">PONTO DE EQUILÍBRIO</div>
          <div className="text-[22px] font-extrabold text-navy-900">
            {Math.max(0, Math.round(peUnidades))} un. / R$ {fmt(peReais)}
          </div>
        </div>
      </div>
    </div>
  );
}
