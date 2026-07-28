import { ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { SITE } from '../data/content';

interface LogoProps {
  size?: 'sm' | 'md';
  onClick?: () => void;
  className?: string;
}

export function Logo({ size = 'md', onClick, className = '' }: LogoProps) {
  const icon = size === 'md' ? 'h-[26px] w-[26px]' : 'h-[22px] w-[22px]';
  const text = size === 'md' ? 'text-xl' : 'text-[17px]';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <ShieldCheck className={`${icon} text-emerald-500`} />
      <span className={`${text} font-extrabold tracking-[-0.02em] text-white`}>{SITE.name}</span>
    </div>
  );
}

interface StatProps {
  label: string;
  value: string;
  tone?: 'default' | 'accent';
}

/** Bloco de indicador usado nos painéis e ferramentas. */
export function Stat({ label, value, tone = 'default' }: StatProps) {
  const accent = tone === 'accent';
  return (
    <div
      className={`rounded-xl border p-[18px] ${
        accent ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className={`mb-2 text-xs font-semibold ${accent ? 'text-emerald-600' : 'text-slate-500'}`}>
        {label}
      </div>
      <div className={`text-2xl font-extrabold ${accent ? 'text-emerald-600' : 'text-navy-900'}`}>
        {value}
      </div>
    </div>
  );
}

interface MiniStatProps {
  label: string;
  value: string;
  tone?: 'default' | 'accent';
}

export function MiniStat({ label, value, tone = 'default' }: MiniStatProps) {
  return (
    <div className="metric-tile">
      <div className="metric-label">{label}</div>
      <div className={`metric-value ${tone === 'accent' ? '!text-emerald-600' : ''}`}>{value}</div>
    </div>
  );
}

interface BarChartProps {
  /** Altura de cada barra em %. */
  bars: number[];
  /** Índices destacados com a cor de acento. */
  highlight?: number[];
  height?: string;
  baseColor?: string;
  accentColor?: string;
}

/** Gráfico de barras decorativo (mesmo do protótipo). */
export function BarChart({
  bars,
  highlight = [],
  height = 'h-20',
  baseColor = 'bg-slate-300',
  accentColor = 'bg-emerald-500',
}: BarChartProps) {
  return (
    <div className={`flex items-end gap-2 ${height}`} aria-hidden="true">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`flex-1 rounded ${highlight.includes(i) ? accentColor : baseColor}`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

interface PillProps {
  children: ReactNode;
  tone?: 'emerald' | 'blue';
}

export function Pill({ children, tone = 'emerald' }: PillProps) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
        tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
      }`}
    >
      {children}
    </span>
  );
}

interface FactProps {
  label: string;
  value: string;
}

/** Cartão "rótulo + valor" usado nos resumos de campanha. */
export function Fact({ label, value }: FactProps) {
  return (
    <div className="flex-1 basis-40 rounded-[10px] border border-slate-200 bg-slate-50 p-3.5">
      <div className="metric-label">{label}</div>
      <div className="mt-1 text-sm font-bold text-navy-900">{value}</div>
    </div>
  );
}
