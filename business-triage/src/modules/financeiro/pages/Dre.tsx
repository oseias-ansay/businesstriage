import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Info } from 'lucide-react';
import { Carregando, ErroBox, Vazio } from '../components/ui';
import { useDre, type MesDre } from '../hooks/useFinanceiro';
import { brl, brlCurto, mesAno, pct } from '../lib/format';

/** Períodos prontos, contados a partir do mês corrente. */
function periodo(mesesAtras: number) {
  const hoje = new Date();
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - mesesAtras, 1);
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { from: iso(inicio), to: iso(fim) };
}

const OPCOES = [
  { label: '3 meses', meses: 2 },
  { label: '6 meses', meses: 5 },
  { label: '12 meses', meses: 11 },
];

interface LinhaProps {
  rotulo: string;
  valor: number;
  destaque?: 'resultado' | 'subtotal';
  negativo?: boolean;
  indentado?: boolean;
}

function Linha({ rotulo, valor, destaque, negativo, indentado }: LinhaProps) {
  const base = destaque
    ? 'bg-slate-50 font-extrabold text-navy-900'
    : 'font-medium text-slate-600';
  const cor =
    destaque === 'resultado' ? (valor >= 0 ? 'text-emerald-600' : 'text-red-600') : undefined;

  return (
    <div
      className={`flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-sm last:border-0 ${base}`}
    >
      <span className={indentado ? 'pl-4' : ''}>{rotulo}</span>
      <span className={`tabular-nums ${cor ?? ''}`}>
        {negativo && valor > 0 ? `(${brl(valor)})` : brl(valor)}
      </span>
    </div>
  );
}

export default function Dre() {
  const [meses, setMeses] = useState(5);
  const { from, to } = useMemo(() => periodo(meses), [meses]);
  const { data, isLoading, error } = useDre(from, to);

  const serie = useMemo(
    () =>
      (data?.meses ?? []).map((m: MesDre) => ({
        mes: mesAno(m.competencia),
        Receita: Number(m.receita_bruta),
        Custos: Number(m.custos_variaveis),
        Fixas: Number(m.despesas_fixas),
        Resultado: Number(m.resultado_operacional),
      })),
    [data],
  );

  // Sem `.at(-1)`: o projeto tem target ES2020 e o método só entra na lib ES2022.
  const meses_ = data?.meses ?? [];
  const ultimo = meses_.length ? meses_[meses_.length - 1] : undefined;
  const acc = data?.acumulado;

  if (isLoading) return <Carregando />;
  if (error) return <ErroBox mensagem="Não foi possível carregar o DRE." />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2 text-[13px] text-slate-500">
          <Info className="mt-px h-4 w-4 shrink-0 text-slate-400" />
          <p className="m-0 max-w-xl">
            Regime de <strong>competência</strong>: cada valor aparece no mês em que o fato
            aconteceu, não no mês em que o dinheiro entrou ou saiu. Por isso o resultado aqui pode
            diferir do saldo em caixa.
          </p>
        </div>

        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {OPCOES.map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => setMeses(o.meses)}
              className={`cursor-pointer rounded-lg border-none px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                meses === o.meses ? 'bg-white text-navy-900 shadow-card' : 'bg-transparent text-slate-500'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {!data?.meses?.length ? (
        <Vazio
          titulo="Sem movimento no período"
          descricao="Cadastre lançamentos para o DRE ser calculado."
        />
      ) : (
        <>
          <div className="card p-5">
            <h2 className="m-0 mb-4 text-base font-extrabold text-navy-900">
              Receita, custos e resultado
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={serie} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                <YAxis
                  tickFormatter={brlCurto}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                />
                <Tooltip
                  formatter={(v: number) => brl(v)}
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Receita" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Custos" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Fixas" fill="#0B1E3B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {ultimo && (
              <div className="card overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <h3 className="m-0 text-sm font-extrabold text-navy-900">
                    Último mês · {mesAno(ultimo.competencia)}
                  </h3>
                </div>
                <Linha rotulo="(+) Receita bruta" valor={ultimo.receita_bruta} />
                <Linha rotulo="(−) Deduções" valor={ultimo.deducoes} negativo indentado />
                <Linha
                  rotulo="(−) Custos variáveis"
                  valor={ultimo.custos_variaveis}
                  negativo
                  indentado
                />
                <Linha
                  rotulo="(=) Margem de contribuição"
                  valor={ultimo.margem_contribuicao}
                  destaque="subtotal"
                />
                <Linha rotulo="(−) Despesas fixas" valor={ultimo.despesas_fixas} negativo indentado />
                <Linha
                  rotulo="(=) Resultado operacional"
                  valor={ultimo.resultado_operacional}
                  destaque="resultado"
                />
              </div>
            )}

            <div className="flex flex-col gap-4">
              {ultimo && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="metric-tile">
                    <div className="metric-label">Margem de contribuição</div>
                    <div className="metric-value">{pct(ultimo.margem_contribuicao_pct)}</div>
                    <p className="m-0 mt-1.5 text-[11px] leading-relaxed text-slate-500">
                      Quanto sobra de cada real vendido para pagar as despesas fixas.
                    </p>
                  </div>
                  <div className="metric-tile">
                    <div className="metric-label">Ponto de equilíbrio</div>
                    <div className="metric-value">
                      {ultimo.ponto_equilibrio ? brl(ultimo.ponto_equilibrio) : '—'}
                    </div>
                    <p className="m-0 mt-1.5 text-[11px] leading-relaxed text-slate-500">
                      Faturamento necessário no mês para não ter prejuízo.
                    </p>
                  </div>
                </div>
              )}

              {acc && (
                <div className="card overflow-hidden">
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <h3 className="m-0 text-sm font-extrabold text-navy-900">
                      Acumulado do período
                    </h3>
                  </div>
                  <Linha rotulo="Receita bruta" valor={acc.receita_bruta ?? 0} />
                  <Linha rotulo="Custos variáveis" valor={acc.custos_variaveis ?? 0} negativo />
                  <Linha rotulo="Despesas fixas" valor={acc.despesas_fixas ?? 0} negativo />
                  <Linha
                    rotulo="Resultado operacional"
                    valor={acc.resultado_operacional ?? 0}
                    destaque="resultado"
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
