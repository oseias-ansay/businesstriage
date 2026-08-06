import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/** Tela de espera enquanto verificamos a sessão salva. */
function Carregando() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy-900 to-navy-800">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-emerald-500" />
        <p className="text-sm text-slate-300">Carregando…</p>
      </div>
    </div>
  );
}

/**
 * Barreira de acesso da Área do Cliente.
 *
 * O `loading` existe para não piscar a tela de login enquanto o supabase-js
 * lê a sessão do storage — sem ele, quem já está logado vê o formulário por
 * um instante a cada F5.
 *
 * Isto é conveniência de navegação, não segurança: quem burlar o front
 * continua barrado pelo RLS no banco e pelo JWT na API.
 */
export default function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Carregando />;

  if (!session) {
    // Guarda o destino para voltar a ele depois do login.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
