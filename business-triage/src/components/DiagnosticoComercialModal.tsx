import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Target, X, Check, ArrowRight, ArrowLeft, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { TERMO_PRIVACIDADE } from '../data/content';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_COMERCIAL ?? '';

/* ------------------------------- Máscaras -------------------------------- */
const digits = (s: unknown): string => String(s ?? '').replace(/\D/g, '');
const fmtBRL = (n: number): string =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type MaskId = 'money' | 'cnpj' | 'fone' | 'none';

const mask: Record<MaskId, (v: string) => string> = {
  money(v) {
    const d = digits(v).replace(/^0+(?=\d)/, '');
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
  const d = digits(display);
  return d ? parseInt(d, 10) / 100 : 0;
};

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

/* --------------------------- Perguntas do form --------------------------- */
interface Pergunta {
  id: CampoId;
  num: number;
  label: string;
  opcoes: { value: string; label: string }[];
}

const ESTADO_INICIAL = {
  razao_social: '', cnpj: '', email: '', telefone: '', setor: '', mes_referencia: '',
  uso_crm: '', processo_funil_definido: '', nivel_metricas_funil: '', ciclo_vendas: '',
  previsibilidade_leads: '', calcula_cac: '', cac_medio: '',
  gestao_metas: '', perfil_vendedores: '', modelo_remuneracao: '',
  ticket_medio: '', estrategia_upsell: '', pos_venda_estruturado: '',
  observacoes: '',
};

type FormState = typeof ESTADO_INICIAL;
type CampoId = keyof FormState;
type ErroId = CampoId | 'canais_leads';
type Erros = Partial<Record<ErroId, string>>;

const PILAR_1: Pergunta[] = [
  {
    id: 'uso_crm',
    num: 1,
    label: 'Vocês possuem um CRM (software de vendas) implementado e utilizado diariamente pela equipe?',
    opcoes: [
      { value: 'SIM', label: 'Sim — a equipe utiliza 100% para registrar oportunidades e histórico' },
      { value: 'PARCIAL', label: 'Temos CRM, mas o uso é inconsistente (muita coisa fica em planilhas ou papel)' },
      { value: 'NAO', label: 'Não — controlamos em planilhas, WhatsApp ou caderno' },
    ],
  },
  {
    id: 'processo_funil_definido',
    num: 2,
    label: 'O processo de vendas possui etapas bem definidas (funil de vendas)?',
    opcoes: [
      { value: 'SIM', label: 'Sim — sabemos exatamente quais são as fases (prospecção, qualificação, apresentação, negociação, fechamento)' },
      { value: 'PARCIAL', label: 'Parcialmente — temos etapas informais que variam de vendedor para vendedor' },
      { value: 'NAO', label: 'Não — cada venda acontece de um jeito diferente' },
    ],
  },
  {
    id: 'nivel_metricas_funil',
    num: 3,
    label: 'Vocês acompanham a taxa de conversão do funil?',
    opcoes: [
      { value: 'COMPLETO', label: 'Sim — sabemos o % de conversão de oportunidades em clientes fechados' },
      { value: 'BASICO', label: 'Sabemos apenas quantas vendas fechamos no mês, mas não a conversão por etapa' },
      { value: 'NENHUM', label: 'Não acompanhamos taxas de conversão' },
    ],
  },
];

const PILAR_3: Pergunta[] = [
  {
    id: 'gestao_metas',
    num: 8,
    label: 'Como são definidas e acompanhadas as metas de vendas?',
    opcoes: [
      { value: 'FREQUENTE', label: 'Temos metas claras (individuais e da equipe) com acompanhamento diário ou semanal' },
      { value: 'MENSAL', label: 'Temos uma meta geral mensal, mas só olhamos para ela no final do mês' },
      { value: 'SEM_METAS', label: 'Não temos metas formais de vendas' },
    ],
  },
  {
    id: 'perfil_vendedores',
    num: 9,
    label: 'Como é composta a equipe de vendas?',
    opcoes: [
      { value: 'DEDICADA', label: 'Vendedores dedicados (inside sales ou vendedores externos)' },
      { value: 'HIBRIDA', label: 'Equipe híbrida — os vendedores também fazem atendimento, pós-venda ou operação' },
      { value: 'SOCIOS', label: 'Apenas os sócios/donos vendem' },
    ],
  },
  {
    id: 'modelo_remuneracao',
    num: 10,
    label: 'Como funciona a remuneração da equipe comercial?',
    opcoes: [
      { value: 'FIXO_MAIS_COMISSAO', label: 'Salário fixo + comissão/bônus atrelado a metas bem definidas' },
      { value: 'APENAS_COMISSAO', label: 'Apenas comissão fixa por venda, sem metas gradativas' },
      { value: 'APENAS_FIXO', label: 'Apenas salário fixo' },
      { value: 'NAO_SE_APLICA', label: 'Não se aplica — os sócios não têm comissão de vendas' },
    ],
  },
];

const PILAR_4: Pergunta[] = [
  {
    id: 'estrategia_upsell',
    num: 12,
    label: 'Existem estratégias ativas de venda cruzada (cross-sell) e up-sell?',
    opcoes: [
      { value: 'ATIVA', label: 'Sim — oferecemos produtos complementares ou upgrade ativamente, na venda ou no pós-venda' },
      { value: 'REATIVA', label: 'Ocorre eventualmente, de forma reativa, quando o cliente pede' },
      { value: 'INEXISTENTE', label: 'Não oferecemos nada além do item principal' },
    ],
  },
  {
    id: 'pos_venda_estruturado',
    num: 13,
    label: 'Existe um processo estruturado de pós-venda / sucesso do cliente?',
    opcoes: [
      { value: 'ATIVO', label: 'Sim — fazemos pesquisas de satisfação (NPS) e acompanhamento contínuo' },
      { value: 'REATIVO', label: 'Fazemos pós-venda apenas para resolver problemas ou reclamações' },
      { value: 'INEXISTENTE', label: 'Não temos nenhum contato após o fechamento da venda' },
    ],
  },
];

const CANAIS_LEADS = [
  { value: 'indicacao', label: 'Indicação de clientes atuais e rede de contatos (boca a boca)' },
  { value: 'marketing_digital', label: 'Marketing digital (anúncios pagos, redes sociais, site/Google)' },
  { value: 'prospeccao_ativa', label: 'Prospecção ativa / outbound (ligações, mensagens frias, visitas)' },
  { value: 'parcerias_eventos', label: 'Parcerias estratégicas / eventos' },
];

const SETORES = [
  'Comércio / Varejo', 'Serviços', 'Indústria', 'Alimentação / Food service',
  'Saúde / Clínicas', 'Educação', 'Construção civil', 'Tecnologia / SaaS',
  'Agronegócio', 'Outro',
];

const OBRIGATORIOS_ETAPA_1: CampoId[] = [
  'razao_social', 'cnpj', 'email', 'telefone', 'setor', 'mes_referencia',
  'uso_crm', 'processo_funil_definido', 'nivel_metricas_funil', 'ciclo_vendas',
  'previsibilidade_leads', 'calcula_cac',
];
const OBRIGATORIOS_ETAPA_2: CampoId[] = [
  'gestao_metas', 'perfil_vendedores', 'modelo_remuneracao',
  'ticket_medio', 'estrategia_upsell', 'pos_venda_estruturado',
];

export interface EmpresaPrefill {
  razaoSocial?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  setor?: string;
}

export interface PayloadDiagnosticoComercial {
  meta: Record<string, unknown>;
  consentimento: {
    aceito: true;
    termo_versao: string;
    termo_atualizado_em: string;
    aceito_em: string;
  };
  identificacao: Record<string, unknown>;
  comercial: Record<string, unknown>;
}

interface Props {
  open: boolean;
  onClose: () => void;
  empresa?: EmpresaPrefill | null;
  onSuccess?: (payload: PayloadDiagnosticoComercial) => void;
  webhookUrl?: string;
}

/* ------------------------------ Estilos base ----------------------------- */
const INPUT_BASE =
  'w-full rounded-xl border bg-white/5 px-3.5 py-3 text-[15px] font-medium text-white ' +
  'outline-none transition placeholder:font-normal placeholder:text-slate-600 ' +
  'focus:border-emerald-500 focus:bg-emerald-500/[0.07] focus:ring-[3px] focus:ring-emerald-500/20';
const INPUT_OK = 'border-white/[0.13]';
const INPUT_ERR = 'border-red-400 ring-[3px] ring-red-400/[0.15]';
const OPCAO_BASE = 'flex cursor-pointer items-start gap-2.5 rounded-xl border px-3.5 py-3 transition';

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

function TextInput({
  id, value, onChange, error, prefix, suffix, ...props
}: {
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
}) {
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

function PerguntaUnica({
  pergunta, value, onChange, error,
}: {
  pergunta: Pergunta;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div className="sm:col-span-2">
      <p className="mb-2.5 text-[14px] font-semibold leading-snug text-slate-100">
        <span className="mr-1.5 font-extrabold text-emerald-400">{pergunta.num}.</span>
        {pergunta.label}
        <span className="ml-0.5 text-emerald-400">*</span>
      </p>
      <div className="flex flex-col gap-2">
        {pergunta.opcoes.map((o) => {
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              className={`${OPCAO_BASE} ${
                checked
                  ? 'border-emerald-500 bg-emerald-500/[0.12]'
                  : error
                  ? 'border-red-400 bg-white/[0.04]'
                  : 'border-white/[0.13] bg-white/[0.04] hover:border-emerald-500/[0.45] hover:bg-emerald-500/[0.06]'
              }`}
            >
              <input
                type="radio"
                name={pergunta.id}
                value={o.value}
                checked={checked}
                onChange={onChange}
                className="mt-0.5 h-4 w-4 flex-none accent-emerald-500"
              />
              <span className="text-[13.5px] font-medium leading-snug text-slate-200">{o.label}</span>
            </label>
          );
        })}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5 flex-none" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ============================ Componente principal ======================== */

export default function DiagnosticoComercialModal({
  open,
  onClose,
  empresa = null,
  onSuccess,
  webhookUrl = WEBHOOK_URL,
}: Props) {
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL);
  const [canais, setCanais] = useState<string[]>([]);
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
    setCanais([]);
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

  const toggleCanal = useCallback((valor: string) => {
    setCanais((c) => (c.includes(valor) ? c.filter((x) => x !== valor) : [...c, valor]));
    setErros((x) => (x.canais_leads ? { ...x, canais_leads: undefined } : x));
  }, []);

  /* Faixa derivada: 'indicacao' é o canal passivo, os demais são esforço ativo. */
  const origemLeads = useMemo<'PROPRIA' | 'MISTA' | 'INDICACAO' | null>(() => {
    if (canais.length === 0) return null;
    const temIndicacao = canais.includes('indicacao');
    const temProprios = canais.some((x) => x !== 'indicacao');
    if (temIndicacao && temProprios) return 'MISTA';
    if (temIndicacao) return 'INDICACAO';
    return 'PROPRIA';
  }, [canais]);

  function validar(campos: CampoId[], etapa1: boolean): boolean {
    const novos: Erros = {};
    campos.forEach((c) => {
      if (!form[c].trim()) novos[c] = 'Campo obrigatório.';
    });
    if (!novos.cnpj && form.cnpj && !cnpjValido(form.cnpj)) novos.cnpj = 'CNPJ inválido.';
    if (!novos.email && form.email && !emailValido(form.email)) novos.email = 'E-mail inválido.';
    if (!novos.telefone && digits(form.telefone).length < 10) novos.telefone = 'Telefone incompleto.';

    if (etapa1) {
      if (canais.length === 0) novos.canais_leads = 'Selecione ao menos um canal.';
      if (form.calcula_cac === 'SIM' && !form.cac_medio) novos.cac_medio = 'Informe o CAC médio.';
    }

    setErros((anteriores) => ({ ...anteriores, ...novos }));
    if (Object.keys(novos).length > 0) {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    return true;
  }

  function avancar() {
    if (!validar(OBRIGATORIOS_ETAPA_1, true)) return;
    setEtapa(2);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function montarPayload(): PayloadDiagnosticoComercial {
    return {
      meta: {
        formulario: 'diagnostico-comercial',
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
      },
      comercial: {
        uso_crm: form.uso_crm,
        processo_funil_definido: form.processo_funil_definido,
        nivel_metricas_funil: form.nivel_metricas_funil,
        ciclo_vendas: form.ciclo_vendas,
        canais_leads: canais,
        origem_leads: origemLeads,
        previsibilidade_leads: form.previsibilidade_leads,
        calcula_cac: form.calcula_cac,
        cac_medio: form.calcula_cac === 'SIM' ? toNumber(form.cac_medio) : null,
        gestao_metas: form.gestao_metas,
        perfil_vendedores: form.perfil_vendedores,
        modelo_remuneracao: form.modelo_remuneracao,
        ticket_medio: toNumber(form.ticket_medio),
        estrategia_upsell: form.estrategia_upsell,
        pos_venda_estruturado: form.pos_venda_estruturado,
        observacoes: form.observacoes.trim() || null,
      },
    };
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validar(OBRIGATORIOS_ETAPA_1, true)) { setEtapa(1); return; }
    if (!validar(OBRIGATORIOS_ETAPA_2, false)) return;
    if (!aceite) {
      setErroAceite('É necessário aceitar o Termo de Privacidade e Confidencialidade para enviar.');
      return;
    }
    if (!webhookUrl) {
      setErroEnvio('Webhook não configurado. Defina VITE_N8N_WEBHOOK_COMERCIAL no ambiente.');
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

  const radio = (id: CampoId) => ({
    value: form[id],
    onChange: set(id),
    error: erros[id],
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#04101F]/80 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bt-com-titulo"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="my-4 flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy-900 shadow-panel outline-none"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-navy-900/95 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Target className="h-[26px] w-[26px] flex-none text-emerald-500" />
            <div>
              <h2 id="bt-com-titulo" className="text-lg font-extrabold tracking-[-0.02em] text-white">
                Diagnóstico Comercial
              </h2>
              <p className="text-xs font-medium text-slate-400">
                Business Triage · maturidade da operação de vendas
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
              { n: 1 as const, label: 'Processo & Demanda' },
              { n: 2 as const, label: 'Equipe & Pós-venda' },
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
                Respostas recebidas com sucesso
              </h3>
              <p className="mx-auto max-w-md text-[15px] leading-relaxed text-slate-400">
                Seu diagnóstico comercial está sendo processado. O relatório completo será enviado para{' '}
                <span className="font-semibold text-slate-200">{sucesso.email}</span> em até 24 horas úteis.
              </p>
              <span className="mt-6 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-[18px] py-2 text-[13px] font-semibold text-emerald-400">
                Protocolo: {sucesso.protocolo}
              </span>
            </div>
          ) : (
            <form id="bt-com-form" onSubmit={enviar} noValidate>
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
                      <Field id="mes_referencia" label="Mês de referência" required error={erros.mes_referencia}>
                        <TextInput id="mes_referencia" type="month" value={form.mes_referencia} onChange={set('mes_referencia')} error={erros.mes_referencia} />
                      </Field>
                    </div>
                  </section>

                  <section className="mb-8">
                    <Legend num="1" titulo="Estrutura, Processo e Funil de Vendas" descricao="Maturidade das etapas de vendas e previsibilidade da receita." />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {PILAR_1.map((p) => (
                        <PerguntaUnica key={p.id} pergunta={p} {...radio(p.id)} />
                      ))}
                      <div className="sm:col-span-2">
                        <Field id="ciclo_vendas" label="4. Qual é o tempo médio do ciclo de vendas (do primeiro contato até o fechamento)?" required error={erros.ciclo_vendas}>
                          <Select id="ciclo_vendas" value={form.ciclo_vendas} onChange={set('ciclo_vendas')} error={erros.ciclo_vendas}>
                            <option value="">Selecione…</option>
                            <option value="MENOS_7">Menos de 7 dias</option>
                            <option value="DE_8_A_30">De 8 a 30 dias</option>
                            <option value="DE_31_A_90">De 31 a 90 dias</option>
                            <option value="MAIS_90">Mais de 90 dias</option>
                            <option value="NAO_SEI">Não sei informar</option>
                          </Select>
                        </Field>
                      </div>
                    </div>
                  </section>

                  <section>
                    <Legend num="2" titulo="Atração de Leads e Prospecção" descricao="Dependência de canais e capacidade de atrair novos clientes." />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <p className="mb-1.5 text-[14px] font-semibold leading-snug text-slate-100">
                          <span className="mr-1.5 font-extrabold text-emerald-400">5.</span>
                          Quais são as origens das suas oportunidades de vendas (leads)?
                          <span className="ml-0.5 text-emerald-400">*</span>
                        </p>
                        <p className="mb-2.5 text-xs leading-relaxed text-slate-500">
                          Marque todos os canais que geram oportunidades hoje. A combinação define se a sua
                          geração de demanda é própria, mista ou dependente de indicação.
                        </p>
                        <div className="flex flex-col gap-2">
                          {CANAIS_LEADS.map((o) => {
                            const checked = canais.includes(o.value);
                            return (
                              <label
                                key={o.value}
                                className={`${OPCAO_BASE} ${
                                  checked
                                    ? 'border-emerald-500 bg-emerald-500/[0.12]'
                                    : erros.canais_leads
                                    ? 'border-red-400 bg-white/[0.04]'
                                    : 'border-white/[0.13] bg-white/[0.04] hover:border-emerald-500/[0.45] hover:bg-emerald-500/[0.06]'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleCanal(o.value)}
                                  className="mt-0.5 h-4 w-4 flex-none rounded accent-emerald-500"
                                />
                                <span className="text-[13.5px] font-medium leading-snug text-slate-200">{o.label}</span>
                              </label>
                            );
                          })}
                        </div>
                        {erros.canais_leads && (
                          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                            <AlertCircle className="h-3.5 w-3.5 flex-none" />
                            {erros.canais_leads}
                          </p>
                        )}
                      </div>

                      {origemLeads && (
                        <div className="rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/[0.07] px-4 py-3 text-[12.5px] leading-relaxed text-slate-300 sm:col-span-2">
                          <b className="mb-0.5 block text-[13px] text-white">
                            Classificação da geração de demanda:{' '}
                            <span className="text-emerald-400">
                              {origemLeads === 'PROPRIA' ? 'Própria' : origemLeads === 'MISTA' ? 'Mista' : 'Dependente de indicação'}
                            </span>
                          </b>
                          {origemLeads === 'PROPRIA' && 'Você gera demanda com esforço próprio e controlável — o cenário de maior previsibilidade.'}
                          {origemLeads === 'MISTA' && 'Você combina indicação com canais próprios. É o cenário mais comum e o mais fácil de evoluir.'}
                          {origemLeads === 'INDICACAO' && 'Toda a sua demanda depende de boca a boca. Funciona, mas você não controla o volume — é o principal risco de estagnação em PMEs.'}
                        </div>
                      )}

                      <PerguntaUnica
                        pergunta={{
                          id: 'previsibilidade_leads',
                          num: 6,
                          label: 'A geração de novos leads/oportunidades é previsível no mês?',
                          opcoes: [
                            { value: 'ALTA', label: 'Sim — sabemos quantos leads chegam e se serão suficientes para bater a meta' },
                            { value: 'MEDIA', label: 'Oscila bastante — temos meses de vacas magras e meses de excesso de demanda' },
                            { value: 'BAIXA', label: 'Não temos controle — vivemos da demanda espontânea' },
                          ],
                        }}
                        {...radio('previsibilidade_leads')}
                      />

                      <PerguntaUnica
                        pergunta={{
                          id: 'calcula_cac',
                          num: 7,
                          label: 'Vocês calculam o Custo de Aquisição de Clientes (CAC)?',
                          opcoes: [
                            { value: 'SIM', label: 'Sim, calculamos e acompanhamos o CAC' },
                            { value: 'NAO', label: 'Não calculamos o CAC' },
                          ],
                        }}
                        {...radio('calcula_cac')}
                      />

                      {form.calcula_cac === 'SIM' && (
                        <div className="sm:col-span-2">
                          <Field id="cac_medio" label="CAC médio" required hint="Quanto a empresa gasta, em média, para conquistar um cliente novo." error={erros.cac_medio}>
                            <TextInput id="cac_medio" value={form.cac_medio} onChange={set('cac_medio', 'money')} error={erros.cac_medio} placeholder="0,00" inputMode="numeric" prefix="R$" />
                          </Field>
                        </div>
                      )}
                    </div>
                  </section>
                </>
              )}

              {etapa === 2 && (
                <>
                  <section className="mb-8">
                    <Legend num="3" titulo="Equipe, Metas e Gestão Comercial" descricao="Liderança, metas, remuneração e cobrança de resultados." />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {PILAR_3.map((p) => (
                        <PerguntaUnica key={p.id} pergunta={p} {...radio(p.id)} />
                      ))}
                    </div>
                  </section>

                  <section>
                    <Legend num="4" titulo="Produto, Ticket Médio e Pós-Venda" descricao="Retenção, recorrência e expansão de receita na base de clientes." />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Field id="ticket_medio" label="11. Qual é o ticket médio das suas vendas?" required hint="Valor médio por venda fechada." error={erros.ticket_medio}>
                          <TextInput id="ticket_medio" value={form.ticket_medio} onChange={set('ticket_medio', 'money')} error={erros.ticket_medio} placeholder="0,00" inputMode="numeric" prefix="R$" />
                        </Field>
                      </div>

                      {PILAR_4.map((p) => (
                        <PerguntaUnica key={p.id} pergunta={p} {...radio(p.id)} />
                      ))}

                      <div className="sm:col-span-2">
                        <Field id="observacoes" label="Contexto adicional" hint="Opcional. Sazonalidade, mudanças na equipe, lançamentos, concorrência." full>
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
                form="bt-com-form"
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
