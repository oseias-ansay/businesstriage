import { useState } from 'react';
import { Stat } from '../components/ui';
import { fmt } from '../data/content';

/** Diagnóstico Financeiro — gera os indicadores consolidados. */
export function DiagnosticoFinanceiro() {
  const [generated, setGenerated] = useState(false);

  return (
    <div>
      <p className="m-0 mb-5 text-sm leading-relaxed text-slate-600">
        Com base nos dados financeiros da sua empresa, geramos um raio-x completo com indicadores de
        liquidez, rentabilidade e endividamento.
      </p>

      <button
        type="button"
        onClick={() => setGenerated(true)}
        className="btn-accent mb-6 px-[22px] py-3"
      >
        Gerar Diagnóstico
      </button>

      {generated && (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          <Stat label="LIQUIDEZ CORRENTE" value="1.8x" />
          <Stat label="MARGEM LÍQUIDA" value="11.4%" />
          <Stat label="ENDIVIDAMENTO" value="38%" />
          <Stat label="SCORE GERAL" value="84/100" tone="accent" />
        </div>
      )}
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
