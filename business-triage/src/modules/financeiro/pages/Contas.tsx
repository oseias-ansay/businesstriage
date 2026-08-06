import { useMemo, useState } from 'react';
import { Check, Loader2, Paperclip, Search } from 'lucide-react';
import { Carregando, ErroBox, SituacaoBadge, Vazio } from '../components/ui';
import { useBaixar, useContas, type Lancamento } from '../hooks/useFinanceiro';
import { brl, dataBR, hojeISO } from '../lib/format';
import { useTenant } from '../../../contexts/TenantContext';

type Aba = 'despesa' | 'receita';

const FILTROS = [
  { id: '', label: 'Todos' },
  { id: 'atrasado', label: 'Atrasados' },
  { id: 'vence_hoje', label: 'Vence hoje' },
  { id: 'vence_semana', label: 'Esta semana' },
  { id: 'a_vencer', label: 'A vencer' },
];

export default function Contas() {
  const { readOnly } = useTenant();
  const [aba, setAba] = useState<Aba>('despesa');
  const [situacao, setSituacao] = useState('');
  const [busca, setBusca] = useState('');
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useContas({
    type: aba,
    situacao: situacao || undefined,
    search: busca.trim() || undefined,
  });
  const baixar = useBaixar();

  const itens = data?.data ?? [];
  const total = useMemo(() => itens.reduce((s, i) => s + Number(i.amount), 0), [itens]);
  const totalSelecionado = useMemo(
    () => itens.filter((i) => selecionados.has(i.id)).reduce((s, i) => s + Number(i.amount), 0),
    [itens, selecionados],
  );

  const trocarAba = (nova: Aba) => {
    setAba(nova);
    setSelecionados(new Set());
  };

  const alternar = (id: string) =>
    setSelecionados((atual) => {
      const novo = new Set(atual);
      novo.has(id) ? novo.delete(id) : novo.add(id);
      return novo;
    });

  const alternarTodos = () =>
    setSelecionados((atual) =>
      atual.size === itens.length ? new Set() : new Set(itens.map((i) => i.id)),
    );

  const confirmarBaixa = async () => {
    if (!selecionados.size) return;
    await baixar.mutateAsync({ ids: [...selecionados], paid_date: hojeISO() });
    setSelecionados(new Set());
  };

  const rotulo = aba === 'despesa' ? 'pagas' : 'recebidas';

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 sm:max-w-md">
        {(['despesa', 'receita'] as Aba[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => trocarAba(t)}
            className={`cursor-pointer rounded-lg border-none py-2.5 text-sm font-bold transition-colors ${
              aba === t ? 'bg-white text-navy-900 shadow-card' : 'bg-transparent text-slate-500'
            }`}
          >
            {t === 'despesa' ? 'Contas a pagar' : 'Contas a receber'}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setSituacao(f.id)}
            className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              situacao === f.id
                ? 'border-navy-900 bg-navy-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}

        <div className="relative ml-auto min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="field w-full pl-9"
            placeholder="Buscar descrição…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <ErroBox mensagem="Não foi possível carregar os títulos." />
      ) : isLoading ? (
        <Carregando />
      ) : itens.length === 0 ? (
        <Vazio
          titulo={`Nenhuma conta ${aba === 'despesa' ? 'a pagar' : 'a receber'}`}
          descricao="Ajuste os filtros ou cadastre um novo lançamento."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <label className="flex cursor-pointer items-center gap-2.5 text-[13px] font-semibold text-slate-600">
              {!readOnly && (
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer accent-emerald-500"
                  checked={selecionados.size === itens.length && itens.length > 0}
                  onChange={alternarTodos}
                />
              )}
              {itens.length} título{itens.length > 1 ? 's' : ''} · {brl(total)}
            </label>
          </div>

          <ul className="m-0 list-none p-0">
            {itens.map((t: Lancamento) => (
              <li
                key={t.id}
                className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50"
              >
                {!readOnly && (
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 cursor-pointer accent-emerald-500"
                    checked={selecionados.has(t.id)}
                    onChange={() => alternar(t.id)}
                    aria-label={`Selecionar ${t.description}`}
                  />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-navy-900">
                      {t.description}
                    </span>
                    {t.has_attachment && (
                      <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    )}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-slate-500">
                    {[t.entity_name, t.category_name].filter(Boolean).join(' · ') ||
                      'Sem categoria'}
                  </div>
                </div>

                <div className="hidden text-right sm:block">
                  <div className="text-xs text-slate-500">Vence</div>
                  <div className="text-[13px] font-medium text-navy-900">{dataBR(t.due_date)}</div>
                </div>

                <SituacaoBadge situacao={t.situacao} />

                <div
                  className={`w-[120px] shrink-0 text-right text-sm font-bold ${
                    t.type === 'receita' ? 'text-emerald-600' : 'text-navy-900'
                  }`}
                >
                  {t.type === 'receita' ? '+' : '−'} {brl(t.amount)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Barra de ação em lote — só aparece com seleção. */}
      {selecionados.size > 0 && !readOnly && (
        <div className="sticky bottom-4 z-40 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-navy-900 px-5 py-3.5 shadow-panel">
          <span className="text-sm text-white">
            <strong>{selecionados.size}</strong> selecionado
            {selecionados.size > 1 ? 's' : ''} · {brl(totalSelecionado)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelecionados(new Set())}
              className="cursor-pointer rounded-lg border-none bg-white/10 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/20"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={confirmarBaixa}
              disabled={baixar.isPending}
              className="btn-accent disabled:opacity-60"
            >
              {baixar.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Marcar como {rotulo}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
