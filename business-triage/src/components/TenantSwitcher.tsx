import { useEffect, useRef, useState } from 'react';
import { Building2, Check, ChevronDown } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';

/** Iniciais da empresa para o avatar do topo. */
function iniciais(nome: string) {
  return nome
    .replace(/\b(ltda|me|epp|eireli|s\.?a\.?)\b/gi, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Seletor de empresa no cabeçalho.
 *
 * Com uma empresa só, vira apenas um rótulo — sem menu, para não sugerir uma
 * escolha que não existe. Com várias (caso do consultor), abre a lista.
 */
export default function TenantSwitcher() {
  const { tenants, current, select, loading } = useTenant();
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false);
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', fora);
      document.removeEventListener('keydown', esc);
    };
  }, [aberto]);

  if (loading) {
    return <div className="h-[30px] w-32 animate-pulse rounded-full bg-white/10" />;
  }

  if (!current) {
    return (
      <span className="flex items-center gap-2 text-[13px] text-slate-400">
        <Building2 className="h-4 w-4" />
        Nenhuma empresa
      </span>
    );
  }

  const avatar = (
    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-emerald-500 text-[13px] font-bold text-navy-ink">
      {iniciais(current.name)}
    </div>
  );

  if (tenants.length === 1) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-slate-300">
        {avatar}
        <span className="hidden sm:inline">{current.name}</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        className="flex cursor-pointer items-center gap-2 rounded-lg border-none bg-transparent px-1 py-1 text-[13px] text-slate-300 transition-colors hover:text-white"
      >
        {avatar}
        <span className="hidden max-w-[180px] truncate sm:inline">{current.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      {aberto && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+8px)] z-50 max-h-80 w-[280px] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-panel"
        >
          <div className="px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-400">
            Trocar de empresa
          </div>
          {tenants.map((t) => (
            <button
              key={t.id}
              type="button"
              role="option"
              aria-selected={t.id === current.id}
              onClick={() => {
                select(t.id);
                setAberto(false);
              }}
              className="flex w-full cursor-pointer items-center justify-between gap-2 border-none bg-transparent px-3.5 py-2.5 text-left transition-colors hover:bg-slate-50"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-navy-900">
                  {t.name}
                </span>
                <span className="block text-[11px] capitalize text-slate-500">{t.role}</span>
              </span>
              {t.id === current.id && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
