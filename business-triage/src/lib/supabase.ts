import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Faltam VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY. Crie o arquivo .env.local a partir do .env.example.',
  );
}

/**
 * Cliente único do navegador.
 *
 * Usa a ANON key — que é pública e vai no bundle. Isso é seguro porque toda
 * proteção real está no RLS do Postgres: mesmo com a chave em mãos, um
 * usuário só enxerga as empresas em que tem membership ativo.
 *
 * A SERVICE_ROLE key ignora o RLS e jamais pode aparecer aqui.
 */
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'bt-auth',
  },
});
