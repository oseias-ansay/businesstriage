import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, X, Check, ArrowRight, ArrowLeft, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { TERMO_PRIVACIDADE } from '../data/content';
import type { ChangeEvent, FormEvent, KeyboardEvent, ReactNode } from 'react';

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_FINANCEIRO ?? '';

/* ------------------------------- Máscaras -------------------------------- */
const digits = (s: unknown): string => String(s ?? '').replace(/\D/g, '');
const fmtBRL = (n: number): string =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type MaskId = 'money' | 'int' | 'pct' | 'cnpj' | 'fone' | 'none';

const mask: Record<MaskId, (v: string) => string> = {
  money(v) {
    const neg = v.trim().startsWith('-');
    const d = digits(v).replace(/^0+(?=\d)/, '');
    if (!d) return '';
    return (neg ? '-' : '') + fmtBRL(parseInt(d, 10) / 100);
  },
  int(v) {
    return digits(v).replace(/^0+(?=\d)/, '').slice(0, 5);
  },
  pct(v) {
    const d = digits(v).slice(0, 5).replace(/^0+(?=\d\d)/, '');
    if (!d) return '';
    return fmtBRL(parseInt(d, 10) / 100);
  },
  cnpj(v) {
    return digits(v)
      .slice(0, 14)
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  },
  fone(v) {
    const d = digits(v).slice(0, 11);
    return d.length <= 10
      ? d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
      : d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  },
  none: (v) => v,
};

const toNumber = (display: string): number => {
  if (!display) return 0;
  const neg = display.trim().startsWith('-');
  const d = digits(display);
  if (!d) return 0;
  const n = parseInt(d, 10) / 100;
  return neg ? -n : n;
};
const toInt = (display: string): number => (display === '' ? 0 : parseInt(digits(display) || '0', 10));
const toNullableNumber = (display: string): number | null => (display === '' ? null : toNumber(display));
const toNullableInt = (display: string): number | null => (display === '' ? null : toInt(display));

/* ----------------------------- Validações -------------------------------- */
function cnpjValido(value: string): boolean {
  const c = digits(value);
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const calc = (len: number): number => {
    let soma = 0;
    let peso = len - 7;
    for (let i = len; i >= 1; i--) {
      soma += Number(c.charAt(len - i)) * peso--;
      if (peso < 2) peso = 9;
    }
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(c.charAt(12)) && calc(13) === Number(c.charAt(13));
}
const emailValido = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/* ------------------------------ Estado base ------------------------------ */
const ESTADO_INICIAL = {
  razao_social: '',
  cnpj: '',
  email: '',
  telefone: '',
  setor: '',
  mes_referencia: '',
  faturamento_anual: '',
  num_funcionarios: '',

  faturamento_bruto: '',
  impostos_vendas: '',
  custos_variaveis: '',
  despesas_fixas: '',
  pro_labore: '',
  lucro_liquido: '',

  saldo_caixa: '',
  pmr: '',
  pmp: '',
  pme: '',
  inadimplencia: '',

  passivo_curto: '',
  passivo_longo: '',
  parcela_dividas_mensal: '',
  custo_divida: '',
  uso_antecipacao: '',

  mistura_contas: '',
  regime_tributario: '',
  percentual_maior_cliente: '',
  observacoes: '',
};

type FormState = typeof ESTADO_INICIAL;
type CampoId = keyof FormState;
type Erros = Partial<Record<CampoId, string>>;

const OBRIGATORIOS_ETAPA_1: CampoId[] = [
  'razao_social', 'cnpj', 'email', 'telefone', 'setor', 'mes_referencia',
  'faturamento_bruto', 'impostos_vendas', 'custos_variaveis',
  'despesas_fixas', 'pro_labore', 'lucro_liquido',
];
const OBRIGATORIOS_ETAPA_2: CampoId[] = [
  'saldo_caixa', 'pmr', 'pmp', 'pme', 'inadimplencia',
  'passivo_curto', 'passivo_longo', 'parcela_dividas_mensal', 'custo_divida', 'uso_antecipacao',
  'mistura_contas', 'regime_tributario', 'percentual_maior_cliente',
];

const SETORES = [
  'Comércio / Varejo', 'Serviços', 'Indústria', 'Alimentação / Food service',
  'Saúde / Clínicas', 'Educação', 'Construção civil', 'Tecnologia / SaaS',
  'Agronegócio', 'Outro',
];

export interface EmpresaPrefill {
  razaoSocial?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  setor?: string;
}

export interface PayloadDiagnosticoFinanceiro {
  meta: Record<string, unknown>;
  consentimento: {
    aceito: true;
    termo_versao: string;
    termo_atualizado_em: string;
    aceito_em: string;
  };
  identificacao: Record<string, unknown>;
  dre: Record<string, number>;
  caixa: Record<string, number>;
  endividamento: Record<string, number | string>;
  qualitativo: Record<string, unknown>;
}

interface Props {
  open: boolean;
  onClose: () => void;
  empresa?: EmpresaPrefill | null;
  onSuccess?: (payload: PayloadDiagnosticoFinanceiro) => void;
  webhookUrl?: string;
}

/* ------------------------------ Estilos base ----------------------------- */
const INPUT_BASE =
  'w-full rounded-xl border bg-white/5 px-3.5 py-3 text-[15px] font-medium text-white ' +
  'outline-none transition placeholder:font-normal placeholder:text-slate-600 ' +
  'focus:border-emerald-500 focus:bg-emerald-500/[0.07] focus:ring-[3px] focus:ring-emerald-500/20';
const INPUT_OK = 'border-white/[0.13]';
const INPUT_ERR = 'border-red-400 ring-[3px] ring-red-400/[0.15]';

/* ============================== Subcomponentes ============================ */

function Legend({ num, titulo, descricao }: { num: string; titulo: string; descricao?: string }) {
  return (
    <div className="mb-6 flex w-full items-start gap-2.5 border-b border-white/10 pb-3.5">
      <span className="mt-0.5 grid h-[26px] w-[26px] flex-none place-items-center rounded-[7px] bg-emerald-500/[0.14] text-xs font-extrabold text-emerald-400">
        {num}
      </span>
      <div>
        <h3 className="text-[17px] font-bold tracking-[-0.01em] text-white">{titulo}</h3>
        {descricao && <p className="mt-0.5 text-xs font-medium text-slate-400">{descricao}</p>}
      </div>
    </div>
  );
}

function Field({
  id, label, hint, required, error, full, children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col ${full ? 'sm:col-span-2' : ''}`}>
      <label htmlFor={id} className="mb-1.5 text-[13.5px] font-semibold text-slate-200">
        {label}
        {required && <span className="ml-0.5 text-emerald-400">*</span>}
      </label>
      {hint && <p className="mb-2 text-xs leading-relaxed text-slate-500">{hint}</p>}
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5 flex-none" />
          {error}
        </p>
      )}
    </div>
  );
}

interface TextInputProps {
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  prefix?: string;
  suffix?: string;
  type?: string;
  placeholder?: string;
  inputMode?: 'numeric' | 'decimal' | 'text';
  autoComplete?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

function TextInput({ id, value, onChange, error, prefix, suffix, ...props }: TextInputProps) {
  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="pointer-events-none absolute left-3.5 text-sm font-semibold text-slate-400">{prefix}</span>
      )}
      <input
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`${INPUT_BASE} ${error ? INPUT_ERR : INPUT_OK} ${prefix ? 'pl-11' : ''} ${suffix ? 'pr-[68px]' : ''}`}
        {...props}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3.5 text-sm font-semibold text-slate-400">{suffix}</span>
      )}
    </div>
  );
}

function Select({
  id, value, onChange, error, children,
}: {
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex items-center">
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`${INPUT_BASE} ${error ? INPUT_ERR : INPUT_OK} cursor-pointer appearance-none pr-10 [&>option]:bg-navy-800 [&>option]:text-white`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 h-[18px] w-[18px] text-slate-400" />
    </div>
  );
}

function RadioGroup({
  name, value, onChange, options, error,
}: {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {options.map((o) => {
        const checked = value === o.value;
        return (
          <label
            key={o.value}
            className={`flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 transition ${
              checked
                ? 'border-emerald-500 bg-emerald-500/[0.12]'
                : error
                ? 'border-red-400 bg-white/[0.04]'
                : 'border-white/[0.13] bg-white/[0.04] hover:border-emerald-500/[0.45] hover:bg-emerald-500/[0.06]'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={checked}
              onChange={onChange}
              className="h-4 w-4 flex-none accent-emerald-500"
            />
            <span className="text-sm font-medium text-slate-200">{o.label}</span>
          </label>
        );
      })}
    </div>
  );
}

/* ============================ Componente principal ======================== */

export default function DiagnosticoFinanceiroModal({
  open,
  onClose,
  empresa = null,
  onSuccess,
  webhookUrl = WEBHOOK_URL,
}: Props) {
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL);
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const [aceite, setAceite] = useState(false);
  const [erroAceite, setErroAceite] = useState('');
  const [sucesso, setSucesso] = useState<{ protocolo: string; email: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...ESTADO_INICIAL,
      razao_social: empresa?.razaoSocial ?? '',
      cnpj: empresa?.cnpj ? mask.cnpj(empresa.cnpj) : '',
      email: empresa?.email ?? '',
      telefone: empresa?.telefone ? mask.fone(empresa.telefone) : '',
      setor: empresa?.setor ?? '',
    });
    setEtapa(1);
    setErros({});
    setErroEnvio('');
    setAceite(false);
    setErroAceite('');
    setSucesso(null);
  }, [open, empresa]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflowAnterior;
    };
  }, [open, onClose]);

  const set = useCallback(
    (campo: CampoId, tipo: MaskId = 'none') =>
      (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const bruto = e.target.value;
        setForm((f) => ({ ...f, [campo]: mask[tipo](bruto) }));
        setErros((x) => (x[campo] ? { ...x, [campo]: undefined } : x));
        setErroEnvio('');
      },
    []
  );

  const permitirNegativo = (campo: CampoId) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' && !form[campo].startsWith('-')) {
      e.preventDefault();
      setForm((f) => ({ ...f, [campo]: '-' + f[campo] }));
    }
  };

  const resultadoCalculado = useMemo(
    () =>
      toNumber(form.faturamento_bruto) -
      toNumber(form.impostos_vendas) -
      toNumber(form.custos_variaveis) -
      toNumber(form.despesas_fixas) -
      toNumber(form.pro_labore),
    [form.faturamento_bruto, form.impostos_vendas, form.custos_variaveis, form.despesas_fixas, form.pro_labore]
  );

  function validar(campos: CampoId[]): boolean {
    const novos: Erros = {};
    campos.forEach((c) => {
      if (!form[c].trim()) novos[c] = 'Campo obrigatório.';
    });
    if (!novos.cnpj && form.cnpj && !cnpjValido(form.cnpj)) novos.cnpj = 'CNPJ inválido.';
    if (!novos.email && form.email && !emailValido(form.email)) novos.email = 'E-mail inválido.';
    if (!novos.telefone && digits(form.telefone).length < 10) novos.telefone = 'Telefone incompleto.';

    setErros((anteriores) => ({ ...anteriores, ...novos }));
    if (Object.keys(novos).length > 0) {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    return true;
  }

  function avancar() {
    if (!validar(OBRIGATORIOS_ETAPA_1)) return;
    setEtapa(2);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function montarPayload(): PayloadDiagnosticoFinanceiro {
    const fat = toNumber(form.faturamento_bruto);
    const imp = toNumber(form.impostos_vendas);
    const cv = toNumber(form.custos_variaveis);
    const df = toNumber(form.despesas_fixas);
    const pl = toNumber(form.pro_labore);
    const ll = toNumber(form.lucro_liquido);
    const pmr = toInt(form.pmr);
    const pmp = toInt(form.pmp);
    const pme = toInt(form.pme);
    const maiorCliente = toNumber(form.percentual_maior_cliente);

    return {
      meta: {
        formulario: 'diagnostico-financeiro',
        versao: '1.0',
        origem: 'site',
        enviado_em: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        pagina: window.location.href,
        user_agent: navigator.userAgent,
      },
      consentimento: {
        aceito: true,
        termo_versao: TERMO_PRIVACIDADE.versao,
        termo_atualizado_em: TERMO_PRIVACIDADE.atualizadoEm,
        aceito_em: new Date().toISOString(),
      },
      identificacao: {
        razao_social: form.razao_social.trim(),
        cnpj: digits(form.cnpj),
        cnpj_formatado: form.cnpj,
        email: form.email.trim().toLowerCase(),
        telefone: digits(form.telefone),
        setor: form.setor,
        mes_referencia: form.mes_referencia,
        faturamento_ultimos_12m: toNullableNumber(form.faturamento_anual),
        num_funcionarios: toNullableInt(form.num_funcionarios),
      },
      dre: {
        faturamento_bruto: fat,
        impostos_sobre_vendas: imp,
        custos_variaveis: cv,
        despesas_fixas: df,
        pro_labore_socios: pl,
        lucro_liquido_informado: ll,
        lucro_liquido_calculado: Number((fat - imp - cv - df - pl).toFixed(2)),
        divergencia_lucro: Number((ll - (fat - imp - cv - df - pl)).toFixed(2)),
      },
      caixa: {
        saldo_caixa_reservas: toNumber(form.saldo_caixa),
        pmr_dias: pmr,
        pmp_dias: pmp,
        pme_dias: pme,
        inadimplencia_pct: toNumber(form.inadimplencia),
        ciclo_financeiro_dias: pme + pmr - pmp,
      },
      endividamento: {
        passivo_curto_prazo: toNumber(form.passivo_curto),
        passivo_longo_prazo: toNumber(form.passivo_longo),
        passivo_total: Number((toNumber(form.passivo_curto) + toNumber(form.passivo_longo)).toFixed(2)),
        parcela_dividas_mensal: toNumber(form.parcela_dividas_mensal),
        custo_divida_pct_am: toNumber(form.custo_divida),
        uso_antecipacao_recebiveis: form.uso_antecipacao,
      },
      qualitativo: {
        mistura_contas_pf_pj: form.mistura_contas,
        regime_tributario: form.regime_tributario,
        percentual_maior_cliente: maiorCliente,
        concentracao_clientes:
          maiorCliente > 50 ? 'acima_50' : maiorCliente >= 30 ? 'acima_30' : 'pulverizada',
        observacoes: form.observacoes.trim() || null,
      },
    };
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validar(OBRIGATORIOS_ETAPA_1)) { setEtapa(1); return; }
    if (!validar(OBRIGATORIOS_ETAPA_2)) return;
    if (!aceite) {
      setErroAceite('É necessário aceitar o Termo de Privacidade e Confidencialidade para enviar.');
      return;
    }
    if (!webhookUrl) {
      setErroEnvio('Webhook não configurado. Defina VITE_N8N_WEBHOOK_FINANCEIRO no ambiente.');
      return;
    }

    const payload = montarPayload();
    setEnviando(true);
    setErroEnvio('');
    try {
      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      setSucesso({
        protocolo: `${String(payload.identificacao.cnpj).slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`,
        email: String(payload.identificacao.email),
      });
      onSuccess?.(payload);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'erro desconhecido';
      setErroEnvio(`Não foi possível enviar os dados agora (${msg}). Verifique sua conexão e tente novamente.`);
    } finally {
      setEnviando(false);
    }
  }

  if (!open) return null;

  const money = (campo: CampoId) => ({
    value: form[campo],
    onChange: set(campo, 'money'),
    error: erros[campo],
    inputMode: 'numeric' as const,
    placeholder: '0,00',
    prefix: 'R$',
  });
  const dias = (campo: CampoId) => ({
    value: form[campo],
    onChange: set(campo, 'int'),
    error: erros[campo],
    inputMode: 'numeric' as const,
    placeholder: '0',
    suffix: 'dias',
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#04101F]/80 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bt-diag-titulo"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="my-4 flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy-900 shadow-panel outline-none"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-navy-900/95 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-[26px] w-[26px] flex-none text-emerald-500" />
            <div>
              <h2 id="bt-diag-titulo" className="text-lg font-extrabold tracking-[-0.02em] text-white">
                Diagnóstico Financeiro
              </h2>
              <p className="text-xs font-medium text-slate-400">
                Business Triage · dados do último mês fechado
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {!sucesso && (
          <div className="flex items-center gap-3 border-b border-white/10 px-6 py-3.5">
            {([
              { n: 1 as const, label: 'Empresa & DRE' },
              { n: 2 as const, label: 'Informações complementares' },
            ]).map((s, i) => (
              <div key={s.n} className="flex flex-1 items-center gap-3">
                {i > 0 && (
                  <div className="h-[3px] flex-1 overflow-hidden rounded bg-white/10">
                    <div
                      className="h-full rounded bg-gradient-to-r from-emerald-600 to-emerald-400 transition-[width] duration-300"
                      style={{ width: etapa === 2 ? '100%' : '0%' }}
                    />
                  </div>
                )}
                <div className="flex flex-none items-center gap-2.5">
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full border-2 text-[13px] font-bold transition ${
                      etapa === s.n
                        ? 'border-emerald-500 bg-emerald-500 text-navy-900'
                        : etapa > s.n
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : 'border-white/[0.15] bg-white/5 text-slate-400'
                    }`}
                  >
                    {etapa > s.n ? <Check className="h-4 w-4" /> : s.n}
                  </span>
                  <span className={`hidden text-[13px] font-semibold sm:block ${etapa === s.n ? 'text-white' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
          {sucesso ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-6 grid h-[76px] w-[76px] place-items-center rounded-full border-2 border-emerald-500 bg-emerald-500/[0.15]">
                <Check className="h-9 w-9 text-emerald-400" strokeWidth={2.5} />
              </div>
              <h3 className="mb-3 text-2xl font-extrabold tracking-[-0.02em] text-white">
                Dados recebidos com sucesso
              </h3>
              <p className="mx-auto max-w-md text-[15px] leading-relaxed text-slate-400">
                Seu diagnóstico está sendo processado. O relatório completo será enviado para{' '}
                <span className="font-semibold text-slate-200">{sucesso.email}</span> em até 24 horas úteis.
              </p>
              <span className="mt-6 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-[18px] py-2 text-[13px] font-semibold text-emerald-400">
                Protocolo: {sucesso.protocolo}
              </span>
            </div>
          ) : (
            <form id="bt-diag-form" onSubmit={enviar} noValidate>
              {etapa === 1 && (
                <>
                  <section className="mb-8">
                    <Legend num="0" titulo="Identificação da empresa" descricao="Usado para vincular o diagnóstico e enviar o relatório." />
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field id="razao_social" label="Razão social / Nome fantasia" required error={erros.razao_social} full>
                        <TextInput id="razao_social" value={form.razao_social} onChange={set('razao_social')} error={erros.razao_social} placeholder="Ex.: Padaria Estrela Ltda" autoComplete="organization" />
                      </Field>
                      <Field id="cnpj" label="CNPJ" required error={erros.cnpj}>
                        <TextInput id="cnpj" value={form.cnpj} onChange={set('cnpj', 'cnpj')} error={erros.cnpj} placeholder="00.000.000/0000-00" inputMode="numeric" />
                      </Field>
                      <Field id="email" label="E-mail para envio do diagnóstico" required error={erros.email}>
                        <TextInput id="email" type="email" value={form.email} onChange={set('email')} error={erros.email} placeholder="voce@empresa.com.br" autoComplete="email" />
                      </Field>
                      <Field id="telefone" label="WhatsApp / Telefone" required error={erros.telefone}>
                        <TextInput id="telefone" value={form.telefone} onChange={set('telefone', 'fone')} error={erros.telefone} placeholder="(00) 00000-0000" inputMode="numeric" />
                      </Field>
                      <Field id="setor" label="Setor de atuação" required error={erros.setor}>
                        <Select id="setor" value={form.setor} onChange={set('setor')} error={erros.setor}>
                          <option value="">Selecione…</option>
                          {SETORES.map((s) => <option key={s}>{s}</option>)}
                        </Select>
                      </Field>
                      <Field id="mes_referencia" label="Mês de referência dos dados" required error={erros.mes_referencia}>
                        <TextInput id="mes_referencia" type="month" value={form.mes_referencia} onChange={set('mes_referencia')} error={erros.mes_referencia} />
                      </Field>
                      <Field id="faturamento_anual" label="Faturamento dos últimos 12 meses" hint="Opcional — ajuda a checar o enquadramento tributário.">
                        <TextInput id="faturamento_anual" {...money('faturamento_anual')} />
                      </Field>
                      <Field id="num_funcionarios" label="Número de funcionários" hint="Opcional — incluindo sócios que atuam na operação.">
                        <TextInput id="num_funcionarios" value={form.num_funcionarios} onChange={set('num_funcionarios', 'int')} placeholder="0" inputMode="numeric" />
                      </Field>
                    </div>
                  </section>

                  <section>
                    <Legend num="1" titulo="Dados da Demonstração de Resultados" descricao="DRE Simplificada — valores do mês de referência." />
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field id="faturamento_bruto" label="Faturamento Bruto" required hint="Volume total de vendas / prestação de serviços." error={erros.faturamento_bruto}>
                        <TextInput id="faturamento_bruto" {...money('faturamento_bruto')} />
                      </Field>
                      <Field id="impostos_vendas" label="Impostos sobre Vendas" required hint="Carga tributária direta (Simples Nacional, ISS, ICMS, etc.)." error={erros.impostos_vendas}>
                        <TextInput id="impostos_vendas" {...money('impostos_vendas')} />
                      </Field>
                      <Field id="custos_variaveis" label="Custos Variáveis (CMV / CSV)" required hint="Custo direto de produtos ou serviços vendidos (comissões, matéria-prima, frete)." error={erros.custos_variaveis}>
                        <TextInput id="custos_variaveis" {...money('custos_variaveis')} />
                      </Field>
                      <Field id="despesas_fixas" label="Despesas Fixas" required hint="Custos recorrentes para manter a operação (aluguel, sistemas, água/luz, salários da equipe)." error={erros.despesas_fixas}>
                        <TextInput id="despesas_fixas" {...money('despesas_fixas')} />
                      </Field>
                      <Field id="pro_labore" label="Pró-Labore dos Sócios" required hint="Remuneração real dos sócios (separada do lucro e das contas da empresa)." error={erros.pro_labore}>
                        <TextInput id="pro_labore" {...money('pro_labore')} />
                      </Field>
                      <Field id="lucro_liquido" label="Lucro Líquido" required hint="O que de fato sobra no final do mês após todas as deduções. Digite “-” para prejuízo." error={erros.lucro_liquido}>
                        <TextInput id="lucro_liquido" {...money('lucro_liquido')} onKeyDown={permitirNegativo('lucro_liquido')} />
                      </Field>

                      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/[0.07] px-4 py-3.5 sm:col-span-2 sm:flex-row sm:items-center">
                        <div className="text-[12.5px] leading-relaxed text-slate-300">
                          <b className="mb-0.5 block text-[13px] text-white">Resultado calculado pela DRE informada</b>
                          Faturamento − Impostos − Custos Variáveis − Despesas Fixas − Pró-Labore. Use como
                          conferência: se divergir muito do lucro informado, revise os lançamentos.
                        </div>
                        <div className={`whitespace-nowrap text-xl font-extrabold tracking-[-0.02em] ${resultadoCalculado < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {resultadoCalculado < 0 ? '- R$ ' : 'R$ '}
                          {fmtBRL(Math.abs(resultadoCalculado))}
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {etapa === 2 && (
                <>
                  <section className="mb-8">
                    <Legend num="2" titulo="Gestão de Caixa e Ciclo Operacional" descricao="Liquidez e saúde do fluxo de caixa diário." />
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field id="saldo_caixa" label="Saldo Atual de Caixa / Reservas" required hint="Total disponível em contas bancárias e investimentos de liquidez imediata." error={erros.saldo_caixa} full>
                        <TextInput id="saldo_caixa" {...money('saldo_caixa')} />
                      </Field>
                      <Field id="pmr" label="Prazo Médio de Recebimento (PMR)" required hint="Em quantos dias, em média, os clientes pagam." error={erros.pmr}>
                        <TextInput id="pmr" {...dias('pmr')} />
                      </Field>
                      <Field id="pmp" label="Prazo Médio de Pagamento (PMP)" required hint="Em quantos dias, em média, a empresa paga os fornecedores." error={erros.pmp}>
                        <TextInput id="pmp" {...dias('pmp')} />
                      </Field>
                      <Field id="pme" label="Prazo Médio de Estocagem (PME)" required hint="Quanto tempo o estoque fica parado antes de ser vendido. Empresas de serviço: informe 0." error={erros.pme}>
                        <TextInput id="pme" {...dias('pme')} />
                      </Field>
                      <Field id="inadimplencia" label="Inadimplência" required hint="Percentual de receita cobrada que não é recebida dentro do prazo." error={erros.inadimplencia}>
                        <TextInput id="inadimplencia" value={form.inadimplencia} onChange={set('inadimplencia', 'pct')} error={erros.inadimplencia} placeholder="0,00" inputMode="decimal" suffix="%" />
                      </Field>
                    </div>
                  </section>

                  <section className="mb-8">
                    <Legend num="3" titulo="Endividamento e Estrutura de Capital" descricao="Alavancagem financeira e peso dos juros." />
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field id="passivo_curto" label="Passivo de Curto Prazo" required hint="Dívidas, empréstimos, parcelamentos tributários e antecipações com vencimento em até 12 meses." error={erros.passivo_curto}>
                        <TextInput id="passivo_curto" {...money('passivo_curto')} />
                      </Field>
                      <Field id="passivo_longo" label="Passivo de Longo Prazo" required hint="Financiamentos de longo prazo e dívidas consolidadas." error={erros.passivo_longo}>
                        <TextInput id="passivo_longo" {...money('passivo_longo')} />
                      </Field>
                      <Field id="parcela_dividas_mensal" label="Parcela mensal de dívidas" required hint="Quanto sai do caixa por mês para pagar empréstimos, financiamentos e parcelamentos. Se não houver, informe 0,00." error={erros.parcela_dividas_mensal}>
                        <TextInput id="parcela_dividas_mensal" {...money('parcela_dividas_mensal')} />
                      </Field>
                      <Field id="custo_divida" label="Custo da Dívida (taxa média de juros)" required hint="Percentual médio de juros pago ao mês nas operações de crédito." error={erros.custo_divida}>
                        <TextInput id="custo_divida" value={form.custo_divida} onChange={set('custo_divida', 'pct')} error={erros.custo_divida} placeholder="0,00" inputMode="decimal" suffix="% a.m." />
                      </Field>
                      <Field id="uso_antecipacao" label="Uso de antecipação de recebíveis / cheque especial" required hint="Frequência de uso de crédito de emergência e alta taxa." error={erros.uso_antecipacao} full>
                        <Select id="uso_antecipacao" value={form.uso_antecipacao} onChange={set('uso_antecipacao')} error={erros.uso_antecipacao}>
                          <option value="">Selecione…</option>
                          <option value="nunca">Nunca utilizamos</option>
                          <option value="raramente">Raramente (situações pontuais)</option>
                          <option value="mensalmente">Mensalmente (parte da rotina)</option>
                          <option value="constantemente">Constantemente (dependência)</option>
                        </Select>
                      </Field>
                    </div>
                  </section>

                  <section>
                    <Legend num="4" titulo="Indicadores Qualitativos e Contexto" descricao="Riscos invisíveis que os números isolados não mostram." />
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field id="mistura_contas" label="Mistura de contas (PF vs. PJ)" required hint="Os sócios pagam despesas pessoais com a conta bancária da empresa?" error={erros.mistura_contas} full>
                        <RadioGroup
                          name="mistura_contas"
                          value={form.mistura_contas}
                          onChange={set('mistura_contas')}
                          error={erros.mistura_contas}
                          options={[
                            { value: 'nao', label: 'Não, contas 100% separadas' },
                            { value: 'as_vezes', label: 'Às vezes, de forma pontual' },
                            { value: 'sim', label: 'Sim, com frequência' },
                          ]}
                        />
                      </Field>
                      <Field id="regime_tributario" label="Regime tributário atual" required hint="Enquadramento vigente da empresa." error={erros.regime_tributario}>
                        <Select id="regime_tributario" value={form.regime_tributario} onChange={set('regime_tributario')} error={erros.regime_tributario}>
                          <option value="">Selecione…</option>
                          <option value="mei">MEI</option>
                          <option value="simples_nacional">Simples Nacional</option>
                          <option value="lucro_presumido">Lucro Presumido</option>
                          <option value="lucro_real">Lucro Real</option>
                          <option value="nao_sei">Não sei informar</option>
                        </Select>
                      </Field>
                      <Field id="percentual_maior_cliente" label="Participação do maior cliente na receita" required hint="Quanto o seu maior cliente representa do faturamento total." error={erros.percentual_maior_cliente}>
                        <TextInput id="percentual_maior_cliente" value={form.percentual_maior_cliente} onChange={set('percentual_maior_cliente', 'pct')} error={erros.percentual_maior_cliente} placeholder="0,00" inputMode="decimal" suffix="%" />
                      </Field>
                      <Field id="observacoes" label="Contexto adicional" hint="Opcional. Sazonalidade, mudanças recentes, dívidas em negociação, planos de expansão." full>
                        <textarea
                          id="observacoes"
                          name="observacoes"
                          value={form.observacoes}
                          onChange={set('observacoes')}
                          placeholder="Escreva aqui…"
                          className={`${INPUT_BASE} ${INPUT_OK} min-h-24 resize-y leading-relaxed`}
                        />
                      </Field>
                    </div>
                  </section>
                </>
              )}

              {etapa === 2 && (
                <div className="mt-7 border-t border-white/10 pt-5">
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition ${
                      aceite
                        ? 'border-emerald-500 bg-emerald-500/[0.12]'
                        : erroAceite
                        ? 'border-red-400 bg-white/[0.04]'
                        : 'border-white/[0.13] bg-white/[0.04] hover:border-emerald-500/[0.45]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={aceite}
                      onChange={(e) => {
                        setAceite(e.target.checked);
                        if (e.target.checked) setErroAceite('');
                      }}
                      className="mt-0.5 h-4 w-4 flex-none rounded accent-emerald-500"
                    />
                    <span className="text-[13.5px] leading-relaxed text-slate-200">
                      Li e concordo com o{' '}
                      <a
                        href="/privacidade"
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-emerald-400 underline underline-offset-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Termo de Privacidade e Confidencialidade
                      </a>
                      . Autorizo o uso dos dados informados para a geração do meu diagnóstico.
                    </span>
                  </label>
                  {erroAceite && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                      <AlertCircle className="h-3.5 w-3.5 flex-none" />
                      {erroAceite}
                    </p>
                  )}
                </div>
              )}

              {erroEnvio && (
                <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3.5 text-sm leading-relaxed text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                  {erroEnvio}
                </div>
              )}
            </form>
          )}
        </div>

        {!sucesso && (
          <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-navy-900/95 px-6 py-4">
            {etapa === 2 ? (
              <button
                type="button"
                onClick={() => { setEtapa(1); scrollRef.current?.scrollTo({ top: 0 }); }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.15] bg-white/5 px-5 py-3 text-[15px] font-bold text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>
            ) : (
              <p className="hidden text-xs text-slate-500 sm:block">
                Seus dados são confidenciais e usados apenas para o diagnóstico.
              </p>
            )}

            {etapa === 1 ? (
              <button
                type="button"
                onClick={avancar}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-7 py-3 text-[15px] font-bold text-white shadow-cta transition hover:brightness-110"
              >
                Continuar <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                form="bt-diag-form"
                disabled={enviando}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-7 py-3 text-[15px] font-bold text-white shadow-cta transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100"
              >
                {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
                {enviando ? 'Enviando…' : 'Enviar para diagnóstico'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
