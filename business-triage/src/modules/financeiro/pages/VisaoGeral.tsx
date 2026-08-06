import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react';
import { KpiCard, Carregando, ErroBox, Vazio } from '../components/ui';
import { useDespesasPorCategoria, useKpis, useProjecao } from '../hooks/useFinanceiro';
import { brl, brlCurto, dataBR, diaMes, intervaloDoMes } from '../lib/format';

const CORES = ['#10B981', '#0B1E3B', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#64748B'];

export default function VisaoGeral() {
  const kpis = useKpis();
  const projecao = useProjecao();
  const { inicio } = intervaloDoMes();
  const despesas = useDespesasPorCategoria(inicio);

  const serie = useMemo(
    () =>
      (projecao.data?.dias ?? []).map((d) => ({
        dia: diaMes(d.data),
        saldo: Number(d.saldo_projetado),
        negativo: d.alerta_saldo_negativo,
      })),
    [projecao.data],
  );

  const primeiroNegativo = projecao.data?.resumo.d90.primeiro_dia_negativo ?? null;

  if (kpis.isLoading || projecao.isLoading) return <Carregando />;
  if (kpis.error) return <ErroBox mensagem="Não foi possível carregar os indicadores." />;

  const k = kpis.data!;

  return (
    <div className="flex flex-col gap-6">
      {/* O alerta mais acionável do produto: ainda dá tempo de agir. */}
      {primeiroNegativo && (
        <div className="flex items-start gap-3 rounded-xl border-l-4 border-red-500 bg-red-50 p-4">
          <AlertTriangle className="mt-px h-5 w-5 shrink-0 text-red-600" />
          <div>
            <div className="text-sm font-bold text-red-900">
              Seu caixa fica negativo em {dataBR(primeiroNegativo)}
            </div>
            <div className="mt-0.5 text-[13px] text-red-800">
              Considere antecipar recebimentos ou renegociar pagamentos antes dessa data.
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]">
        <KpiCard label="Saldo hoje" valor={k.saldo_hoje} icone={Wallet} tom="auto" />
        <KpiCard
          label="A receber (30d)"
          valor={k.receber_30d}
          icone={ArrowUpCircle}
          tom="positivo"
          legenda={k.receber_atrasado > 0 ? `${brl(k.receber_atrasado)} em atraso` : undefined}
        />
        <KpiCard
          label="A pagar (30d)"
          valor={k.pagar_30d}
          icone={ArrowDownCircle}
          tom="negativo"
          legenda={k.pagar_atrasado > 0 ? `${brl(k.pagar_atrasado)} em atraso` : undefined}
        />
        <KpiCard
          label="Resultado previsto (30d)"
          valor={k.receber_30d - k.pagar_30d}
          icone={Wallet}
          tom="auto"
        />
      </div>

      <div className="card p-5">
        <div className="mb-4">
          <h2 className="m-0 text-base font-extrabold text-navy-900">Projeção de caixa — 90 dias</h2>
          <p className="m-0 mt-0.5 text-[13px] text-slate-500">
            Saldo atual somado aos vencimentos previstos. A linha zero marca o limite.
          </p>
        </div>

        {serie.length === 0 ? (
          <Vazio
            titulo="Nada a projetar ainda"
            descricao="Cadastre lançamentos com vencimento futuro para ver a curva de caixa."
          />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={serie} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
              <defs>
                <linearGradient id="grad-saldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
              <YAxis
                tickFormatter={brlCurto}
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                width={64}
              />
              <Tooltip
                formatter={(v: number) => [brl(v), 'Saldo projetado']}
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }}
              />
              <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="saldo"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#grad-saldo)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card p-5">
        <h2 className="m-0 mb-4 text-base font-extrabold text-navy-900">
          Despesas do mês por categoria
        </h2>

        {despesas.isLoading ? (
          <Carregando texto="Carregando despesas…" />
        ) : !despesas.data?.length ? (
          <Vazio titulo="Nenhuma despesa neste mês" />
        ) : (
          <div className="grid items-center gap-6 sm:grid-cols-[220px_1fr]">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={despesas.data}
                  dataKey="total"
                  nameKey="nome"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={2}
                >
                  {despesas.data.map((d, i) => (
                    <Cell key={d.nome} fill={d.cor ?? CORES[i % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => brl(v)}
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>

            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {despesas.data.slice(0, 7).map((d, i) => (
                <li key={d.nome} className="flex items-center gap-2.5 text-[13px]">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ background: d.cor ?? CORES[i % CORES.length] }}
                  />
                  <span className="flex-1 truncate text-slate-600">{d.nome}</span>
                  <span className="font-semibold text-navy-900">{brl(d.total)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
