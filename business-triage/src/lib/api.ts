import { supabase } from './supabase';

const BASE = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Empresa ativa. A API exige em toda rota autenticada. */
  tenantId?: string | null;
}

/**
 * Wrapper de fetch para a API financeira.
 *
 * Pega o access_token da sessão a cada chamada em vez de guardá-lo numa
 * variável: o supabase-js renova o token sozinho, e ler na hora garante que
 * nunca mandamos um token vencido depois de a aba ficar aberta a manhã toda.
 */
export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, tenantId, headers, ...rest } = options;

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { 'X-Tenant-Id': tenantId } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 204) return undefined as T;

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const err = payload?.error;
    throw new ApiError(
      res.status,
      err?.message ?? 'Não foi possível concluir a operação.',
      err?.code,
      err?.details,
    );
  }

  return payload as T;
}
