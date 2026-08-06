import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, LayoutDashboard, Plus, Receipt, Settings2 } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import LancamentoModal from './components/LancamentoModal';

const ABAS = [
  { to: '.', end: true, label: 'Visão geral', icone: LayoutDashboard },
  { to: 'contas', end: false, label: 'Contas', icone: Receipt },
  { to: 'dre', end: false, label: 'DRE', icone: BarChart3 },
  { to: 'cadastros', end: false, label: 'Cadastros', icone: Settings2 },
];

export default function FinanceiroLayout() {
  const navigate = useNavigate();
  const { current, readOnly } = useTenant();
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate('/painel')}
            className="mb-2 flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[13px] text-slate-500 transition-colors hover:text-navy-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao painel
          </button>
          <h1 className="m-0 text-2xl font-extrabold text-navy-900">Controle Financeiro</h1>
          <p className="m-0 mt-0.5 text-sm text-slate-500">
            {current?.name ?? 'Nenhuma empresa selecionada'}
          </p>
        </div>

        {!readOnly && (
          <button type="button" onClick={() => setModalAberto(true)} className="btn-accent py-3">
            <Plus className="h-4 w-4" />
            Novo lançamento
          </button>
        )}
      </div>

      <nav className="mb-6 flex gap-1 border-b border-slate-200">
        {ABAS.map(({ to, end, label, icone: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? 'border-emerald-500 text-navy-900'
                  : 'border-transparent text-slate-500 hover:text-navy-900'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <Outlet />

      {modalAberto && <LancamentoModal onClose={() => setModalAberto(false)} />}
    </div>
  );
}
