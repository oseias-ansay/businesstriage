import { useState, type FormEvent, type ReactNode } from 'react';
import { AlertCircle, Loader2, Pencil, Plus, Power, X } from 'lucide-react';
import { Carregando, ErroBox, Vazio } from '../components/ui';
import {
  GRUPOS_DRE,
  useCategorias,
  useContasBancarias,
  useDesativarCategoria,
  useDesativarConta,
  useDesativarEntidade,
  useEntidades,
  useSalvarCategoria,
  useSalvarConta,
  useSalvarEntidade,
  type Categoria,
  type ContaBancaria,
  type DreGroup,
  type Entidade,
} from '../hooks/useCrud';
import { brl, hojeISO, parseMoeda } from '../lib/format';
import { useTenant } from '../../../contexts/TenantContext';

type Aba = 'categorias' | 'entidades' | 'contas';

const ROTULO_GRUPO: Record<DreGroup, string> = {
  receita_bruta: 'Receita bruta',
  outras_receitas: 'Outras receitas',
  custo_variavel: 'Custo variável',
  despesa_fixa: 'Despesa fixa',
  deducao: 'Dedução',
  outras_despesas: 'Outras despesas',
};

// --------------------------------------------------------------- Modal base
function Modal({
  titulo,
  onClose,
  onSubmit,
  salvando,
  erro,
  children,
}: {
  titulo: string;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  salvando: boolean;
  erro: string | null;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-navy-900/60 p-4 backdrop-blur-sm sm:p-8"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form onSubmit={onSubmit} className="my-auto w-full max-w-[480px] rounded-2xl bg-white p-7 shadow-panel">
        <div className="mb-5 flex items-start justify-between">
          <h2 className="m-0 text-lg font-extrabold text-navy-900">{titulo}</h2>
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

        <div className="flex flex-col gap-4">{children}</div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button type="submit" disabled={salvando} className="btn-accent disabled:opacity-60">
            {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}

// ------------------------------------------------------------ Linha genérica
function Linha({
  titulo,
  subtitulo,
  extra,
  ativo,
  onEditar,
  onAlternar,
  somenteLeitura,
}: {
  titulo: string;
  subtitulo?: string;
  extra?: ReactNode;
  ativo: boolean;
  onEditar: () => void;
  onAlternar: () => void;
  somenteLeitura: boolean;
}) {
  return (
    <li
      className={`flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50 ${
        ativo ? '' : 'opacity-50'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-navy-900">
          {titulo}
          {!ativo && <span className="ml-2 text-[11px] font-normal text-slate-400">(inativo)</span>}
        </div>
        {subtitulo && <div className="mt-0.5 truncate text-xs text-slate-500">{subtitulo}</div>}
      </div>

      {extra}

      {!somenteLeitura && (
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onEditar}
            aria-label={`Editar ${titulo}`}
            className="cursor-pointer rounded-lg border-none bg-transparent p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-900"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onAlternar}
            aria-label={ativo ? `Desativar ${titulo}` : `Reativar ${titulo}`}
            title={ativo ? 'Desativar' : 'Reativar'}
            className={`cursor-pointer rounded-lg border-none bg-transparent p-2 transition-colors hover:bg-slate-100 ${
              ativo ? 'text-slate-400 hover:text-red-600' : 'text-emerald-600'
            }`}
          >
            <Power className="h-4 w-4" />
          </button>
        </div>
      )}
    </li>
  );
}

// ------------------------------------------------------------- Categorias
function AbaCategorias({ somenteLeitura }: { somenteLeitura: boolean }) {
  const { data, isLoading, error } = useCategorias();
  const salvar = useSalvarCategoria();
  const desativar = useDesativarCategoria();

  const [editando, setEditando] = useState<Categoria | null>(null);
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa');
  const [grupo, setGrupo] = useState<DreGroup>('despesa_fixa');
  const [erro, setErro] = useState<string | null>(null);

  const abrir = (c?: Categoria) => {
    setErro(null);
    if (c) {
      setEditando(c);
      setNome(c.name);
      setTipo(c.type);
      setGrupo(c.dre_group);
    } else {
      setCriando(true);
      setNome('');
      setTipo('despesa');
      setGrupo('despesa_fixa');
    }
  };

  const fechar = () => {
    setEditando(null);
    setCriando(false);
  };

  const trocarTipo = (t: 'receita' | 'despesa') => {
    setTipo(t);
    setGrupo(GRUPOS_DRE[t][0]!.valor); // mantém a combinação válida
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (nome.trim().length < 2) return setErro('Informe o nome da categoria.');
    try {
      await salvar.mutateAsync({
        id: editando?.id,
        dados: { name: nome.trim(), type: tipo, dre_group: grupo },
      });
      fechar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar.');
    }
  };

  if (isLoading) return <Carregando />;
  if (error) return <ErroBox mensagem="Não foi possível carregar as categorias." />;

  const receitas = (data ?? []).filter((c) => c.type === 'receita');
  const despesas = (data ?? []).filter((c) => c.type === 'despesa');
  const ajuda = GRUPOS_DRE[tipo].find((g) => g.valor === grupo)?.ajuda;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <p className="m-0 max-w-2xl text-[13px] text-slate-500">
          A categoria define <strong>onde o valor entra no DRE</strong>. Classificar uma comissão
          como custo variável em vez de despesa fixa muda a margem de contribuição e o ponto de
          equilíbrio — por isso vale escolher com atenção.
        </p>
        {!somenteLeitura && (
          <button type="button" onClick={() => abrir()} className="btn-accent shrink-0">
            <Plus className="h-4 w-4" />
            Nova
          </button>
        )}
      </div>

      {!data?.length ? (
        <Vazio titulo="Nenhuma categoria cadastrada" />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {[
            { titulo: 'Entradas', itens: receitas },
            { titulo: 'Saídas', itens: despesas },
          ].map(({ titulo, itens }) => (
            <div key={titulo} className="card overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-bold uppercase tracking-[0.04em] text-slate-500">
                {titulo} · {itens.length}
              </div>
              <ul className="m-0 list-none p-0">
                {itens.map((c) => (
                  <Linha
                    key={c.id}
                    titulo={c.name}
                    subtitulo={ROTULO_GRUPO[c.dre_group]}
                    ativo={c.is_active}
                    somenteLeitura={somenteLeitura}
                    onEditar={() => abrir(c)}
                    onAlternar={() => desativar.mutate({ id: c.id, ativo: !c.is_active })}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {(criando || editando) && (
        <Modal
          titulo={editando ? 'Editar categoria' : 'Nova categoria'}
          onClose={fechar}
          onSubmit={enviar}
          salvando={salvar.isPending}
          erro={erro}
        >
          <div>
            <label className="label" htmlFor="cat-nome">
              Nome
            </label>
            <input
              id="cat-nome"
              className="field w-full"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Frete sobre vendas"
            />
          </div>

          <div>
            <span className="label">Tipo</span>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              {(['despesa', 'receita'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => trocarTipo(t)}
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
          </div>

          <div>
            <label className="label" htmlFor="cat-grupo">
              Classificação no DRE
            </label>
            <select
              id="cat-grupo"
              className="field w-full"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value as DreGroup)}
            >
              {GRUPOS_DRE[tipo].map((g) => (
                <option key={g.valor} value={g.valor}>
                  {g.rotulo}
                </option>
              ))}
            </select>
            {ajuda && <p className="m-0 mt-1.5 text-[11px] leading-relaxed text-slate-500">{ajuda}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}

// -------------------------------------------------------------- Entidades
function AbaEntidades({ somenteLeitura }: { somenteLeitura: boolean }) {
  const { data, isLoading, error } = useEntidades();
  const salvar = useSalvarEntidade();
  const desativar = useDesativarEntidade();

  const [editando, setEditando] = useState<Entidade | null>(null);
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState('');
  const [kind, setKind] = useState<'cliente' | 'fornecedor' | 'ambos'>('cliente');
  const [doc, setDoc] = useState('');
  const [email, setEmail] = useState('');
  const [fone, setFone] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const abrir = (e?: Entidade) => {
    setErro(null);
    if (e) {
      setEditando(e);
      setNome(e.name);
      setKind(e.kind);
      setDoc(e.tax_id ?? '');
      setEmail(e.email ?? '');
      setFone(e.phone ?? '');
    } else {
      setCriando(true);
      setNome('');
      setKind('cliente');
      setDoc('');
      setEmail('');
      setFone('');
    }
  };

  const fechar = () => {
    setEditando(null);
    setCriando(false);
  };

  const enviar = async (ev: FormEvent) => {
    ev.preventDefault();
    setErro(null);
    if (nome.trim().length < 2) return setErro('Informe o nome.');

    const somenteDigitos = doc.replace(/\D/g, '');
    if (somenteDigitos && ![11, 14].includes(somenteDigitos.length)) {
      return setErro('CPF deve ter 11 dígitos e CNPJ, 14.');
    }

    try {
      await salvar.mutateAsync({
        id: editando?.id,
        dados: {
          name: nome.trim(),
          kind,
          tax_id: somenteDigitos || null,
          email: email.trim() || null,
          phone: fone.trim() || null,
        },
      });
      fechar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar.');
    }
  };

  if (isLoading) return <Carregando />;
  if (error) return <ErroBox mensagem="Não foi possível carregar clientes e fornecedores." />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <p className="m-0 max-w-2xl text-[13px] text-slate-500">
          Clientes e fornecedores usados nos lançamentos. O e-mail e o telefone servem para os
          lembretes automáticos de vencimento.
        </p>
        {!somenteLeitura && (
          <button type="button" onClick={() => abrir()} className="btn-accent shrink-0">
            <Plus className="h-4 w-4" />
            Novo
          </button>
        )}
      </div>

      {!data?.length ? (
        <Vazio titulo="Nenhum cliente ou fornecedor cadastrado" />
      ) : (
        <div className="card overflow-hidden">
          <ul className="m-0 list-none p-0">
            {data.map((e) => (
              <Linha
                key={e.id}
                titulo={e.name}
                subtitulo={[e.email, e.phone].filter(Boolean).join(' · ') || undefined}
                ativo={e.is_active}
                somenteLeitura={somenteLeitura}
                extra={
                  <span className="hidden shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600 sm:inline">
                    {e.kind}
                  </span>
                }
                onEditar={() => abrir(e)}
                onAlternar={() => desativar.mutate({ id: e.id, ativo: !e.is_active })}
              />
            ))}
          </ul>
        </div>
      )}

      {(criando || editando) && (
        <Modal
          titulo={editando ? 'Editar cadastro' : 'Novo cliente ou fornecedor'}
          onClose={fechar}
          onSubmit={enviar}
          salvando={salvar.isPending}
          erro={erro}
        >
          <div>
            <label className="label" htmlFor="ent-nome">
              Nome ou razão social
            </label>
            <input
              id="ent-nome"
              className="field w-full"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="ent-kind">
              Tipo
            </label>
            <select
              id="ent-kind"
              className="field w-full"
              value={kind}
              onChange={(e) => setKind(e.target.value as typeof kind)}
            >
              <option value="cliente">Cliente</option>
              <option value="fornecedor">Fornecedor</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="ent-doc">
              CPF ou CNPJ <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input
              id="ent-doc"
              className="field w-full"
              value={doc}
              onChange={(e) => setDoc(e.target.value)}
              placeholder="Somente números"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="ent-mail">
                E-mail
              </label>
              <input
                id="ent-mail"
                type="email"
                className="field w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="ent-fone">
                Telefone
              </label>
              <input
                id="ent-fone"
                className="field w-full"
                value={fone}
                onChange={(e) => setFone(e.target.value)}
                placeholder="5541999999999"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ----------------------------------------------------------------- Contas
function AbaContas({ somenteLeitura }: { somenteLeitura: boolean }) {
  const { data, isLoading, error } = useContasBancarias();
  const salvar = useSalvarConta();
  const desativar = useDesativarConta();

  const [editando, setEditando] = useState<ContaBancaria | null>(null);
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState('');
  const [saldoTexto, setSaldoTexto] = useState('');
  const [dataSaldo, setDataSaldo] = useState(hojeISO());
  const [padrao, setPadrao] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const abrir = (c?: ContaBancaria) => {
    setErro(null);
    if (c) {
      setEditando(c);
      setNome(c.name);
      setSaldoTexto(String(c.opening_balance).replace('.', ','));
      setDataSaldo(c.opening_balance_date);
      setPadrao(c.is_default);
    } else {
      setCriando(true);
      setNome('');
      setSaldoTexto('');
      setDataSaldo(hojeISO());
      setPadrao(false);
    }
  };

  const fechar = () => {
    setEditando(null);
    setCriando(false);
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (nome.trim().length < 2) return setErro('Informe o nome da conta.');
    try {
      await salvar.mutateAsync({
        id: editando?.id,
        dados: {
          name: nome.trim(),
          opening_balance: parseMoeda(saldoTexto),
          opening_balance_date: dataSaldo,
          is_default: padrao,
        },
      });
      fechar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar.');
    }
  };

  if (isLoading) return <Carregando />;
  if (error) return <ErroBox mensagem="Não foi possível carregar as contas." />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <p className="m-0 max-w-2xl text-[13px] text-slate-500">
          O <strong>saldo inicial</strong> é o ponto de partida do fluxo de caixa. Informe quanto
          havia na conta na data escolhida — sem isso, a projeção começa do zero e mostra um caixa
          menor do que o real.
        </p>
        {!somenteLeitura && (
          <button type="button" onClick={() => abrir()} className="btn-accent shrink-0">
            <Plus className="h-4 w-4" />
            Nova
          </button>
        )}
      </div>

      {!data?.length ? (
        <Vazio titulo="Nenhuma conta cadastrada" />
      ) : (
        <div className="card overflow-hidden">
          <ul className="m-0 list-none p-0">
            {data.map((c) => (
              <Linha
                key={c.id}
                titulo={c.name}
                subtitulo={`Saldo inicial ${brl(c.opening_balance)}`}
                ativo={c.is_active}
                somenteLeitura={somenteLeitura}
                extra={
                  c.is_default ? (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      padrão
                    </span>
                  ) : undefined
                }
                onEditar={() => abrir(c)}
                onAlternar={() => desativar.mutate({ id: c.id, ativo: !c.is_active })}
              />
            ))}
          </ul>
        </div>
      )}

      {(criando || editando) && (
        <Modal
          titulo={editando ? 'Editar conta' : 'Nova conta'}
          onClose={fechar}
          onSubmit={enviar}
          salvando={salvar.isPending}
          erro={erro}
        >
          <div>
            <label className="label" htmlFor="cta-nome">
              Nome
            </label>
            <input
              id="cta-nome"
              className="field w-full"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Banco do Brasil, Caixa, PicPay"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="cta-saldo">
                Saldo inicial
              </label>
              <input
                id="cta-saldo"
                inputMode="decimal"
                className="field w-full"
                placeholder="0,00"
                value={saldoTexto}
                onChange={(e) => setSaldoTexto(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="cta-data">
                Na data de
              </label>
              <input
                id="cta-data"
                type="date"
                className="field w-full"
                value={dataSaldo}
                onChange={(e) => setDataSaldo(e.target.value)}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4 cursor-pointer accent-emerald-500"
              checked={padrao}
              onChange={(e) => setPadrao(e.target.checked)}
            />
            Usar como conta padrão nos lançamentos
          </label>
        </Modal>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Página
const ABAS: { id: Aba; label: string }[] = [
  { id: 'categorias', label: 'Categorias' },
  { id: 'entidades', label: 'Clientes e fornecedores' },
  { id: 'contas', label: 'Contas' },
];

export default function Cadastros() {
  const { readOnly } = useTenant();
  const [aba, setAba] = useState<Aba>('categorias');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAba(a.id)}
            className={`flex-1 cursor-pointer rounded-lg border-none px-4 py-2.5 text-sm font-bold transition-colors ${
              aba === a.id ? 'bg-white text-navy-900 shadow-card' : 'bg-transparent text-slate-500'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {aba === 'categorias' && <AbaCategorias somenteLeitura={readOnly} />}
      {aba === 'entidades' && <AbaEntidades somenteLeitura={readOnly} />}
      {aba === 'contas' && <AbaContas somenteLeitura={readOnly} />}
    </div>
  );
}
