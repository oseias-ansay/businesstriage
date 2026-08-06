import type { LucideIcon } from 'lucide-react';
import { Inbox, Loader2, AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { brl } from '../lib/format';

interface KpiCardProps {
  label: string;
  valor: number;
  icone: LucideIcon;
  /** 'auto' pinta de vermelho quando negativo — usado no saldo. */
  tom?: 'neutro' | 'positivo' | 'negativo' | 'auto';
  legenda?: string;
}

export function KpiCard({ label, valor, icone: Icon, tom = 'neutro', legenda }: KpiCardProps) {
  const efetivo = tom === 'auto' ? (valor < 0 ? 'negativo' : 'positivo') : tom;
  const cor =
    efetivo === 'negativo'
      ? 'text-red-600'
      : efetivo === 'positivo'
        ? 'text-emerald-600'
        : 'text-navy-900';

  return (
    <div className="card p-[18px]">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-slate-500">
          {label}
        </span>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div className={`text-[22px] font-extrabold leading-tight ${cor}`}>{brl(valor)}</div>
      {legenda && <div className="mt-1 text-[11px] text-slate-400">{legenda}</div>}
    </div>
  );
}

const SITUACOES: Record<string, { texto: string; classe: string }> = {
  atrasado: { texto: 'Atrasado', classe: 'bg-red-50 text-red-700 border-red-200' },
  vence_hoje: { texto: 'Vence hoje', classe: 'bg-amber-50 text-amber-700 border-amber-200' },
  vence_semana: { texto: 'Esta semana', classe: 'bg-blue-50 text-blue-700 border-blue-200' },
  a_vencer: { texto: 'A vencer', classe: 'bg-slate-100 text-slate-600 border-slate-200' },
  liquidado: { texto: 'Liquidado', classe: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelado: { texto: 'Cancelado', classe: 'bg-slate-100 text-slate-400 border-slate-200' },
};

export function SituacaoBadge({ situacao }: { situacao: string }) {
  const s = SITUACOES[situacao] ?? SITUACOES.a_vencer!;
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${s.classe}`}
    >
      {s.texto}
    </span>
  );
}

export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      {texto}
    </div>
  );
}

export function ErroBox({ mensagem }: { mensagem: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
      <AlertCircle className="mt-px h-4 w-4 shrink-0" />
      <span>{mensagem}</span>
    </div>
  );
}

export function Vazio({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <Inbox className="mb-3 h-8 w-8 text-slate-300" />
      <p className="m-0 text-sm font-semibold text-navy-900">{titulo}</p>
      {descricao && <p className="m-0 mt-1 max-w-sm text-[13px] text-slate-500">{descricao}</p>}
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}
