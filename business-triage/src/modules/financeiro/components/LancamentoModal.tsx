import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { useCadastros, useCriarLancamento, type NovoLancamento } from '../hooks/useFinanceiro';
import { brl, hojeISO, parseMoeda } from '../lib/format';

type Tipo = 'receita' | 'despesa';

export default function LancamentoModal({ onClose }: { onClose: () => void }) {
  const { data: cadastros } = useCadastros();
  const criar = useCriarLancamento();

  const [tipo, setTipo] = useState<Tipo>('despesa');
  const [descricao, setDescricao] = useState('');
  const [valorTexto, setValorTexto] = useState('');
  const [vencimento, setVencimento] = useState(hojeISO());
  const [categoriaId, setCategoriaId] = useState('');
  const [entidadeId, setEntidadeId] = useState('');
  const [contaId, setContaId] = useState('');
  const [parcelas, setParcelas] = useState(1);
  const [modoValor, setModoValor] = useState<'total' | 'parcela'>('total');
  const [modoCompetencia, setModoCompetencia] = useState<'origem' | 'parcela'>('parcela');
  const [documento, setDocumento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  // Trocar receita/despesa invalida a categoria escolhida.
  useEffect(() => setCategoriaId(''), [tipo]);

  // Conta padrão pré-selecionada.
  useEffect(() => {
    if (!contaId && cadastros?.contas.length) {
      setContaId((cadastros.contas.find((c) => c.is_default) ?? cadastros.contas[0]!).id);
    }
  }, [cadastros, contaId]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  const valor = parseMoeda(valorTexto);
  const categorias = (cadastros?.categorias ?? []).filter((c) => c.type === tipo);
  const entidades = (cadastros?.entidades ?? []).filter((e) =>
    tipo === 'receita' ? e.kind !== 'fornecedor' : e.kind !== 'cliente',
  );

  const previa = useMemo(() => {
    if (parcelas <= 1 || valor <= 0) return null;
    const porParcela = modoValor === 'total' ? valor / parcelas : valor;
    const total = modoValor === 'total' ? valor : valor * parcelas;
    return { porParcela, total };
  }, [parcelas, valor, modoValor]);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (descricao.trim().length < 2) return setErro('Descreva o lançamento.');
    if (valor <= 0) return setErro('Informe um valor maior que zero.');
    if (!vencimento) return setErro('Informe a data de vencimento.');

    const payload: NovoLancamento = {
      type: tipo,
      description: descricao.trim(),
      amount: Number(valor.toFixed(2)),
      due_date: vencimento,
      installments: parcelas,
      amount_mode: modoValor,
      competence_mode: modoCompetencia,
      ...(categoriaId && { category_id: categoriaId }),
      ...(entidadeId && { entity_id: entidadeId }),
      ...(contaId && { bank_account_id: contaId }),
      ...(documento.trim() && { document_number: documento.trim() }),
      ...(observacoes.trim() && { notes: observacoes.trim() }),
    };

    try {
      await criar.mutateAsync(payload);
      onClose();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-navy-900/60 p-4 backdrop-blur-sm sm:p-8"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={enviar}
        className="my-auto w-full max-w-[560px] rounded-2xl bg-white p-6 shadow-panel sm:p-8"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="m-0 text-lg font-extrabold text-navy-900">Novo lançamento</h2>
            <p className="m-0 mt-0.5 text-[13px] text-slate-500">
              À vista ou parcelado, entrada ou saída.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="cursor-pointer rounded-lg border-none bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {erro && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
            <AlertCircle className="mt-px h-4 w-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Tipo */}
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          {(['despesa', 'receita'] as Tipo[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={`cursor-pointer rounded-lg border-none py-2.5 text-sm font-bold transition-colors ${
                tipo === t
                  ? t === 'receita'
                    ? 'bg-emerald-500 text-navy-ink'
                    : 'bg-navy-900 text-white'
                  : 'bg-transparent text-slate-500'
              }`}
            >
              {t === 'receita' ? 'Entrada' : 'Saída'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="label" htmlFor="desc">
              Descrição
            </label>
            <input
              id="desc"
              className="field w-full"
              placeholder={tipo === 'receita' ? 'Venda de produtos' : 'Compra de mercadoria'}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="valor">
                Valor
              </label>
              <input
                id="valor"
                inputMode="decimal"
                className="field w-full"
                placeholder="0,00"
                value={valorTexto}
                onChange={(e) => setValorTexto(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="venc">
                Vencimento
              </label>
              <input
                id="venc"
                type="date"
                className="field w-full"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="cat">
                Categoria
              </label>
              <select
                id="cat"
                className="field w-full"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                <option value="">Sem categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="ent">
                {tipo === 'receita' ? 'Cliente' : 'Fornecedor'}
              </label>
              <select
                id="ent"
                className="field w-full"
                value={entidadeId}
                onChange={(e) => setEntidadeId(e.target.value)}
              >
                <option value="">Não informar</option>
                {entidades.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Parcelamento */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="parc">
                  Parcelas
                </label>
                <input
                  id="parc"
                  type="number"
                  min={1}
                  max={120}
                  className="field w-full"
                  value={parcelas}
                  onChange={(e) => setParcelas(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>
              {parcelas > 1 && (
                <div>
                  <label className="label" htmlFor="modo">
                    O valor informado é
                  </label>
                  <select
                    id="modo"
                    className="field w-full"
                    value={modoValor}
                    onChange={(e) => setModoValor(e.target.value as 'total' | 'parcela')}
                  >
                    <option value="total">O total (dividir)</option>
                    <option value="parcela">O de cada parcela</option>
                  </select>
                </div>
              )}
            </div>

            {parcelas > 1 && (
              <>
                <div className="mt-4">
                  <label className="label" htmlFor="comp">
                    Competência (afeta o DRE)
                  </label>
                  <select
                    id="comp"
                    className="field w-full"
                    value={modoCompetencia}
                    onChange={(e) => setModoCompetencia(e.target.value as 'origem' | 'parcela')}
                  >
                    <option value="parcela">Distribuir mês a mês (assinaturas, serviços)</option>
                    <option value="origem">Tudo no mês da compra (equipamento, estoque)</option>
                  </select>
                  <p className="m-0 mt-1.5 text-[11px] leading-relaxed text-slate-500">
                    Isso muda em qual mês o resultado aparece no DRE — não muda o caixa, que
                    segue os vencimentos.
                  </p>
                </div>

                {previa && (
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[13px] text-emerald-800">
                    {parcelas}× de <strong>{brl(previa.porParcela)}</strong> — total{' '}
                    <strong>{brl(previa.total)}</strong>
                  </div>
                )}
              </>
            )}
          </div>

          <details className="rounded-xl border border-slate-200 px-4 py-3">
            <summary className="cursor-pointer text-[13px] font-semibold text-slate-600">
              Mais opções
            </summary>
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label className="label" htmlFor="conta">
                  Conta
                </label>
                <select
                  id="conta"
                  className="field w-full"
                  value={contaId}
                  onChange={(e) => setContaId(e.target.value)}
                >
                  {(cadastros?.contas ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="doc">
                  Documento (NF, boleto)
                </label>
                <input
                  id="doc"
                  className="field w-full"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="obs">
                  Observações
                </label>
                <textarea
                  id="obs"
                  rows={2}
                  className="field w-full resize-y"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>
            </div>
          </details>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={criar.isPending}
            className="btn-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {criar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {criar.isPending ? 'Salvando…' : 'Salvar lançamento'}
          </button>
        </div>
      </form>
    </div>
  );
}
