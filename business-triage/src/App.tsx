import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PublicSite from './pages/PublicSite';
import Privacidade from './pages/Privacidade';
import Login from './pages/Login';
import PainelLayout from './pages/PainelLayout';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { TenantProvider } from './contexts/TenantContext';

/**
 * O módulo financeiro entra por import dinâmico.
 *
 * Ele carrega o Recharts, que sozinho responde por boa parte do bundle. Sem
 * esta separação, um visitante que só quer ler a landing page baixa a
 * biblioteca de gráficos inteira — custo que recai justamente sobre a primeira
 * impressão e sobre quem está no celular com rede ruim.
 */
const FinanceiroLayout = lazy(() => import('./modules/financeiro/FinanceiroLayout'));
const VisaoGeral = lazy(() => import('./modules/financeiro/pages/VisaoGeral'));
const Contas = lazy(() => import('./modules/financeiro/pages/Contas'));
const Dre = lazy(() => import('./modules/financeiro/pages/Dre'));
const Cadastros = lazy(() => import('./modules/financeiro/pages/Cadastros'));

function CarregandoModulo() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicSite />} />
      <Route path="/privacidade" element={<Privacidade />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/painel"
          element={
            <TenantProvider>
              <PainelLayout />
            </TenantProvider>
          }
        >
          <Route index element={<Dashboard />} />

          <Route
            path="financeiro"
            element={
              <Suspense fallback={<CarregandoModulo />}>
                <FinanceiroLayout />
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<CarregandoModulo />}>
                  <VisaoGeral />
                </Suspense>
              }
            />
            <Route
              path="contas"
              element={
                <Suspense fallback={<CarregandoModulo />}>
                  <Contas />
                </Suspense>
              }
            />
            <Route
              path="dre"
              element={
                <Suspense fallback={<CarregandoModulo />}>
                  <Dre />
                </Suspense>
              }
            />
            <Route
              path="cadastros"
              element={
                <Suspense fallback={<CarregandoModulo />}>
                  <Cadastros />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
