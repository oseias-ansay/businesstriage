import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../contexts/TenantContext';

/**
 * Onde cada dado é buscado, e por quê:
 *
 * • Cadastros e KPIs -> direto no supabase-js. São leituras simples e o RLS
 *   já protege; passar por um proxy na API seria reescrever à mão o que o
 *   PostgREST entrega pronto.
 * • Listas, DRE, projeção e escrita -> pela API. Precisam de paginação com
 *   contagem, montagem de comparativos ou atomicidade (parcelas).
 */

// ---------------------------------------------------------------- KPIs
export interface Kpis {
  saldo_hoje: number;
  receber_atrasado: number;
  pagar_atrasado: number;
  receber_30d: number;
  pagar_30d: number;
}

export function useKpis() {
  const { current } = useTenant();
  return useQuery({
    queryKey: ['fin', 'kpis', current?.id],
    enabled: !!current,
    queryFn: async (): Promise<Kpis> => {
      const { data, error } = await supabase
        .from('vw_dashboard_kpis')
        .select('*')
        .eq('tenant_id', current!.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return {
        saldo_hoje: Number(data?.saldo_hoje ?? 0),
        receber_atrasado: Number(data?.receber_atrasado ?? 0),
        pagar_atrasado: Number(data?.pagar_atrasado ?? 0),
        receber_30d: Number(data?.receber_30d ?? 0),
        pagar_30d: Number(data?.pagar_30d ?? 0),
      };
    },
  });
}

// ------------------------------------------------------- Projeção de caixa
export interface DiaProjecao {
  data: string;
  dias_a_frente: number;
  entradas_previstas: number;
  saidas_previstas: number;
  saldo_projetado: number;
  alerta_saldo_negativo: boolean;
}

export interface Projecao {
  saldo_atual: number;
  dias: DiaProjecao[];
  resumo: Record<
    'd30' | 'd60' | 'd90',
    { entradas: number; saidas: number; saldo_final: number; primeiro_dia_negativo: string | null }
  >;
}

export function useProjecao() {
  const { current } = useTenant();
  return useQuery({
    queryKey: ['fin', 'projecao', current?.id],
    enabled: !!current,
    queryFn: () =>
      api<Projecao>('/api/v1/reports/cashflow-projection', { tenantId: current!.id }),
  });
}

// ------------------------------------------------------------------ DRE
export interface MesDre {
  competencia: string;
  receita_bruta: number;
  deducoes: number;
  receita_liquida: number;
  custos_variaveis: number;
  margem_contribuicao: number;
  margem_contribuicao_pct: number | null;
  despesas_fixas: number;
  resultado_operacional: number;
  ponto_equilibrio: number | null;
  variacao: Record<string, number | null> | null;
}

export function useDre(from: string, to: string) {
  const { current } = useTenant();
  return useQuery({
    queryKey: ['fin', 'dre', current?.id, from, to],
    enabled: !!current,
    queryFn: () =>
      api<{ meses: MesDre[]; acumulado: Record<string, number> }>(
        `/api/v1/reports/dre?from=${from}&to=${to}`,
        { tenantId: current!.id },
      ),
  });
}

// --------------------------------------------------------- Despesas/categoria
export function useDespesasPorCategoria(competencia: string) {
  const { current } = useTenant();
  return useQuery({
    queryKey: ['fin', 'despesas-cat', current?.id, competencia],
    enabled: !!current,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_expenses_by_category')
        .select('category_name, total, color')
        .eq('tenant_id', current!.id)
        .eq('competencia', competencia)
        .order('total', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []).map((r: any) => ({
        nome: r.category_name as string,
        total: Number(r.total),
        cor: r.color as string | null,
      }));
    },
  });
}

// ------------------------------------------------------------ Lançamentos
export interface Lancamento {
  id: string;
  type: 'receita' | 'despesa';
  description: string;
  amount: number;
  status: 'pendente' | 'liquidado' | 'cancelado';
  due_date: string;
  paid_date: string | null;
  competence_date: string;
  situacao: string;
  category_name: string | null;
  entity_name: string | null;
  installment_number: number | null;
  installment_total: number | null;
  has_attachment: boolean;
}

export interface FiltroContas {
  type?: 'receita' | 'despesa';
  situacao?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
}

export function useContas(filtro: FiltroContas) {
  const { current } = useTenant();
  const params = new URLSearchParams({ status: 'pendente', per_page: '100' });
  Object.entries(filtro).forEach(([k, v]) => v && params.set(k, String(v)));

  return useQuery({
    queryKey: ['fin', 'contas', current?.id, params.toString()],
    enabled: !!current,
    queryFn: () =>
      api<{ data: Lancamento[]; pagination: { total: number }; totals: { amount: number } }>(
        `/api/v1/transactions?${params}`,
        { tenantId: current!.id },
      ),
  });
}

// ------------------------------------------------------------- Cadastros
export function useCadastros() {
  const { current } = useTenant();
  return useQuery({
    queryKey: ['fin', 'cadastros', current?.id],
    enabled: !!current,
    staleTime: 5 * 60_000, // muda pouco
    queryFn: async () => {
      const [cat, ent, contas] = await Promise.all([
        supabase
          .from('categories')
          .select('id, name, type')
          .eq('tenant_id', current!.id)
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('entities')
          .select('id, name, kind')
          .eq('tenant_id', current!.id)
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('bank_accounts')
          .select('id, name, is_default')
          .eq('tenant_id', current!.id)
          .eq('is_active', true)
          .order('name'),
      ]);

      return {
        categorias: (cat.data ?? []) as { id: string; name: string; type: string }[],
        entidades: (ent.data ?? []) as { id: string; name: string; kind: string }[],
        contas: (contas.data ?? []) as { id: string; name: string; is_default: boolean }[],
      };
    },
  });
}

// --------------------------------------------------------------- Mutações
/** Invalida tudo do módulo: um lançamento afeta KPI, projeção, DRE e listas. */
function useInvalidarFinanceiro() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['fin'] });
}

export interface NovoLancamento {
  type: 'receita' | 'despesa';
  description: string;
  amount: number;
  due_date: string;
  competence_date?: string;
  category_id?: string;
  entity_id?: string;
  bank_account_id?: string;
  installments: number;
  amount_mode: 'total' | 'parcela';
  competence_mode: 'origem' | 'parcela';
  document_number?: string;
  notes?: string;
}

export function useCriarLancamento() {
  const { current } = useTenant();
  const invalidar = useInvalidarFinanceiro();
  return useMutation({
    mutationFn: (input: NovoLancamento) =>
      api<{ installments_created: number }>('/api/v1/transactions', {
        method: 'POST',
        body: input,
        tenantId: current!.id,
      }),
    onSuccess: invalidar,
  });
}

export function useBaixar() {
  const { current } = useTenant();
  const invalidar = useInvalidarFinanceiro();
  return useMutation({
    mutationFn: (input: { ids: string[]; paid_date?: string }) =>
      api<{ settled: number }>('/api/v1/transactions/settle', {
        method: 'POST',
        body: input,
        tenantId: current!.id,
      }),
    onSuccess: invalidar,
  });
}
