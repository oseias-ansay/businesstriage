import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../contexts/TenantContext';

/**
 * CRUD dos cadastros — direto no supabase-js.
 *
 * Não passa pela API de propósito: são operações simples numa tabela só, sem
 * regra de negócio nem atomicidade envolvida. O RLS garante o isolamento, e
 * o `tenant_id` é enviado explicitamente porque o INSERT precisa dele (o RLS
 * valida, mas não preenche).
 */

export type DreGroup =
  | 'receita_bruta'
  | 'deducao'
  | 'custo_variavel'
  | 'despesa_fixa'
  | 'outras_receitas'
  | 'outras_despesas';

export interface Categoria {
  id: string;
  name: string;
  type: 'receita' | 'despesa';
  dre_group: DreGroup;
  color: string | null;
  is_active: boolean;
}

export interface Entidade {
  id: string;
  name: string;
  kind: 'cliente' | 'fornecedor' | 'ambos';
  tax_id: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
}

export interface ContaBancaria {
  id: string;
  name: string;
  opening_balance: number;
  opening_balance_date: string;
  is_default: boolean;
  is_active: boolean;
}

/** Combinações válidas — espelham o CHECK do banco. */
export const GRUPOS_DRE: Record<'receita' | 'despesa', { valor: DreGroup; rotulo: string; ajuda: string }[]> =
  {
    receita: [
      { valor: 'receita_bruta', rotulo: 'Receita bruta', ajuda: 'Vendas e serviços do dia a dia.' },
      {
        valor: 'outras_receitas',
        rotulo: 'Outras receitas',
        ajuda: 'Não operacionais: juros recebidos, venda de ativo.',
      },
    ],
    despesa: [
      {
        valor: 'custo_variavel',
        rotulo: 'Custo variável',
        ajuda: 'Cresce junto com as vendas: mercadoria, comissão, taxa de cartão.',
      },
      {
        valor: 'despesa_fixa',
        rotulo: 'Despesa fixa',
        ajuda: 'Existe mesmo sem vender: aluguel, salários, contabilidade.',
      },
      {
        valor: 'deducao',
        rotulo: 'Dedução da receita',
        ajuda: 'Impostos sobre venda, devoluções e descontos concedidos.',
      },
      {
        valor: 'outras_despesas',
        rotulo: 'Outras despesas',
        ajuda: 'Não operacionais: juros pagos, compra de equipamento.',
      },
    ],
  };

// ------------------------------------------------------------- Leituras
export function useCategorias() {
  const { current } = useTenant();
  return useQuery({
    queryKey: ['fin', 'cad', 'categorias', current?.id],
    enabled: !!current,
    queryFn: async (): Promise<Categoria[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, type, dre_group, color, is_active')
        .eq('tenant_id', current!.id)
        .order('type')
        .order('name');
      if (error) throw new Error(error.message);
      return (data ?? []) as Categoria[];
    },
  });
}

export function useEntidades() {
  const { current } = useTenant();
  return useQuery({
    queryKey: ['fin', 'cad', 'entidades', current?.id],
    enabled: !!current,
    queryFn: async (): Promise<Entidade[]> => {
      const { data, error } = await supabase
        .from('entities')
        .select('id, name, kind, tax_id, email, phone, is_active')
        .eq('tenant_id', current!.id)
        .order('name');
      if (error) throw new Error(error.message);
      return (data ?? []) as Entidade[];
    },
  });
}

export function useContasBancarias() {
  const { current } = useTenant();
  return useQuery({
    queryKey: ['fin', 'cad', 'contas', current?.id],
    enabled: !!current,
    queryFn: async (): Promise<ContaBancaria[]> => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('id, name, opening_balance, opening_balance_date, is_default, is_active')
        .eq('tenant_id', current!.id)
        .order('name');
      if (error) throw new Error(error.message);
      return (data ?? []) as ContaBancaria[];
    },
  });
}

// ------------------------------------------------------------- Escritas
type Tabela = 'categories' | 'entities' | 'bank_accounts';

/** Traduz os erros do Postgres que o usuário pode provocar. */
function traduzir(msg: string, tabela: Tabela): string {
  const m = msg.toLowerCase();
  if (m.includes('duplicate key') || m.includes('unique')) {
    return tabela === 'categories'
      ? 'Já existe uma categoria com esse nome para este tipo.'
      : 'Já existe um registro com esse nome.';
  }
  if (m.includes('categories_type_group_ck')) {
    return 'A classificação no DRE não combina com o tipo escolhido.';
  }
  if (m.includes('entities_tax_id_digits')) {
    return 'CPF/CNPJ deve conter apenas números (11 ou 14 dígitos).';
  }
  if (m.includes('violates foreign key') || m.includes('still referenced')) {
    return 'Este registro está em uso por lançamentos e não pode ser excluído. Desative-o.';
  }
  return 'Não foi possível salvar. Verifique os dados e tente novamente.';
}

type Dados = Record<string, unknown>;

function useSalvar(tabela: Tabela) {
  const { current } = useTenant();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dados }: { id?: string; dados: Dados }) => {
      // O cast é necessário porque o client do front não usa os tipos gerados
      // do banco — sem eles, o supabase-js não consegue inferir o shape da linha.
      const resposta = id
        ? await supabase
            .from(tabela)
            .update(dados as never)
            .eq('id', id)
            .eq('tenant_id', current!.id)
        : await supabase.from(tabela).insert({ ...dados, tenant_id: current!.id } as never);

      if (resposta.error) throw new Error(traduzir(resposta.error.message, tabela));
      return true;
    },
    // Invalida tudo: uma categoria nova aparece no formulário de lançamento,
    // e um nome alterado muda o rótulo no DRE e nas listas.
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fin'] }),
  });
}

function useDesativar(tabela: Tabela) {
  const { current } = useTenant();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      // Desativar em vez de excluir: o registro pode estar em lançamentos
      // antigos, e apagá-lo distorceria o histórico do DRE.
      const { error } = await supabase
        .from(tabela)
        .update({ is_active: ativo } as never)
        .eq('id', id)
        .eq('tenant_id', current!.id);
      if (error) throw new Error(traduzir(error.message, tabela));
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fin'] }),
  });
}

export const useSalvarCategoria = () => useSalvar('categories');
export const useSalvarEntidade = () => useSalvar('entities');
export const useSalvarConta = () => useSalvar('bank_accounts');

export const useDesativarCategoria = () => useDesativar('categories');
export const useDesativarEntidade = () => useDesativar('entities');
export const useDesativarConta = () => useDesativar('bank_accounts');
