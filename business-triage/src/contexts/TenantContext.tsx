import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Tenant {
  id: string;
  name: string;
  tax_id: string | null;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

interface TenantContextValue {
  tenants: Tenant[];
  current: Tenant | null;
  loading: boolean;
  error: string | null;
  select: (id: string) => void;
  /** Somente leitura: viewer não escreve. Usado para esconder botões de ação. */
  readOnly: boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);
const STORAGE_KEY = 'bt-tenant';

/**
 * Descobre as empresas do usuário a partir de `memberships`.
 *
 * A consulta não filtra por user_id de propósito: o RLS já devolve apenas os
 * vínculos do usuário logado. Filtrar aqui seria redundante — e daria a falsa
 * impressão de que a segurança está no front.
 */
export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTenants([]);
      setLoading(false);
      return;
    }

    let cancelado = false;
    setLoading(true);

    supabase
      .from('memberships')
      .select('role, tenants(id, name, tax_id, is_active)')
      .eq('is_active', true)
      .then(({ data, error: err }) => {
        if (cancelado) return;

        if (err) {
          setError('Não foi possível carregar suas empresas.');
          setLoading(false);
          return;
        }

        const lista: Tenant[] = (data ?? [])
          .map((row: any) => {
            const t = Array.isArray(row.tenants) ? row.tenants[0] : row.tenants;
            return t && t.is_active
              ? { id: t.id, name: t.name, tax_id: t.tax_id, role: row.role }
              : null;
          })
          .filter(Boolean) as Tenant[];

        lista.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        setTenants(lista);

        // Mantém a empresa escolhida se ela ainda existir; senão, pega a primeira.
        setCurrentId((atual) =>
          atual && lista.some((t) => t.id === atual) ? atual : (lista[0]?.id ?? null),
        );
        setError(null);
        setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [user]);

  useEffect(() => {
    if (currentId) localStorage.setItem(STORAGE_KEY, currentId);
    else localStorage.removeItem(STORAGE_KEY);
  }, [currentId]);

  const current = tenants.find((t) => t.id === currentId) ?? null;

  const value = useMemo<TenantContextValue>(
    () => ({
      tenants,
      current,
      loading,
      error,
      select: setCurrentId,
      readOnly: current?.role === 'viewer',
    }),
    [tenants, current, loading, error],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant precisa estar dentro de <TenantProvider>');
  return ctx;
}
