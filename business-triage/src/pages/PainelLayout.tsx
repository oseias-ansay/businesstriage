import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Logo } from '../components/ui';
import TenantSwitcher from '../components/TenantSwitcher';
import { useAuth } from '../contexts/AuthContext';

/**
 * Casca da Área do Cliente: cabeçalho fixo + área de conteúdo.
 *
 * Extraído do Dashboard para que o módulo financeiro (e o que vier depois)
 * apareça dentro da mesma moldura, sem duplicar o header.
 */
export default function PainelLayout() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const sair = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex h-[68px] items-center justify-between bg-navy-900 px-6">
        <Logo size="sm" onClick={() => navigate('/painel')} />
        <div className="flex items-center gap-[18px]">
          <TenantSwitcher />
          <button
            type="button"
            onClick={sair}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-white/[0.08] px-3.5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/[0.16]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-6 pb-20 pt-9">
        <Outlet />
      </main>
    </div>
  );
}
