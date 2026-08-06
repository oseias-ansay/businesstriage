import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, LineChart } from 'lucide-react';
import AssistantChat from '../components/AssistantChat';
import ToolPanel from '../tools/ToolPanel';
import { DIAG_TOOLS, FIN_TOOLS, TOOLS, TRAF_TOOLS } from '../data/content';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import type { Tool, ToolId } from '../types';

function ToolCard({ tool, onOpen }: { tool: Tool; onOpen: (id: ToolId) => void }) {
  const Icon = tool.icon;
  return (
    <button
      type="button"
      onClick={() => onOpen(tool.id)}
      className="cursor-pointer rounded-[14px] border border-slate-200 bg-white p-[22px] text-left transition-all hover:border-emerald-500 hover:shadow-hover"
    >
      <div className="mb-3.5 flex h-[38px] w-[38px] items-center justify-center rounded-[9px] bg-green-50">
        <Icon className="h-[19px] w-[19px] text-emerald-600" />
      </div>
      <div className="mb-1.5 text-pretty text-sm font-bold text-navy-900">{tool.title}</div>
      <div className="text-pretty text-xs leading-relaxed text-slate-500">{tool.desc}</div>
    </button>
  );
}

function ToolGroup({
  title,
  tools,
  onOpen,
}: {
  title: string;
  tools: Tool[];
  onOpen: (id: ToolId) => void;
}) {
  return (
    <div>
      <h3 className="m-0 mb-3.5 text-[13px] font-bold uppercase tracking-[0.05em] text-slate-500">
        {title}
      </h3>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

/**
 * Chamada do módulo financeiro.
 *
 * Recebe destaque próprio em vez de virar mais um card na grade: as demais
 * ferramentas são calculadoras de uso pontual; esta é a que o cliente abre
 * todo dia. Tratar as duas coisas como iguais esconderia o produto principal.
 */
function CardFinanceiro({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group mb-7 flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-navy-800 bg-navy-900 p-6 text-left transition-colors hover:bg-navy-800"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500">
        <LineChart className="h-6 w-6 text-navy-ink" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-base font-extrabold text-white">Controle Financeiro</div>
        <div className="mt-0.5 text-[13px] text-slate-300">
          Contas a pagar e receber, fluxo de caixa projetado e DRE gerencial.
        </div>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-emerald-500 transition-transform group-hover:translate-x-1" />
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { current, tenants, loading, error } = useTenant();
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);

  const open = (id: ToolId) => {
    setActiveTool(id);
    window.scrollTo(0, 0);
  };

  const close = () => {
    setActiveTool(null);
    window.scrollTo(0, 0);
  };

  const tool = TOOLS.find((t) => t.id === activeTool) ?? null;

  if (tool) return <ToolPanel tool={tool} onBack={close} />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="m-0 mb-1 text-2xl font-extrabold text-navy-900">Painel do Cliente</h1>
        <p className="m-0 text-sm text-slate-500">
          Acesse suas ferramentas de diagnóstico e performance.
        </p>
      </div>

      {/* Autenticado mas sem vínculo: estado real, precisa de aviso claro. */}
      {!loading && tenants.length === 0 && (
        <div className="mb-7 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="mt-px h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <div className="text-sm font-bold text-amber-900">
              Sua conta ainda não está vinculada a uma empresa
            </div>
            <div className="mt-0.5 text-[13px] text-amber-800">
              Entre em contato com a Business Triage para liberar seu acesso
              {user?.email ? ` (${user.email})` : ''}.
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-7 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
          {error}
        </div>
      )}

      {current && <CardFinanceiro onOpen={() => navigate('financeiro')} />}

      <AssistantChat />

      <div className="flex flex-col gap-7">
        <ToolGroup title="Relatórios de Diagnósticos" tools={DIAG_TOOLS} onOpen={open} />
        <ToolGroup title="Módulo Financeiro" tools={FIN_TOOLS} onOpen={open} />
        <ToolGroup title="Módulo de Tráfego & Marketing Digital" tools={TRAF_TOOLS} onOpen={open} />
      </div>
    </div>
  );
}
