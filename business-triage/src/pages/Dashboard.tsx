import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Logo } from '../components/ui';
import AssistantChat from '../components/AssistantChat';
import ToolPanel from '../tools/ToolPanel';
import { DIAG_TOOLS, FIN_TOOLS, TOOLS, TRAF_TOOLS } from '../data/content';
import type { Tool, ToolId } from '../types';

const CLIENT = { name: 'Empresa Modelo Ltda.', initials: 'EM' };

interface DashboardProps {
  onLogout: () => void;
}

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

export default function Dashboard({ onLogout }: DashboardProps) {
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

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex h-[68px] items-center justify-between bg-navy-900 px-6">
        <Logo size="sm" />
        <div className="flex items-center gap-[18px]">
          <div className="flex items-center gap-2 text-[13px] text-slate-300">
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-emerald-500 text-[13px] font-bold text-navy-ink">
              {CLIENT.initials}
            </div>
            <span className="hidden sm:inline">{CLIENT.name}</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-white/[0.08] px-3.5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/[0.16]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-6 pb-20 pt-9">
        {tool ? (
          <ToolPanel tool={tool} onBack={close} />
        ) : (
          <div>
            <div className="mb-8">
              <h1 className="m-0 mb-1 text-2xl font-extrabold text-navy-900">Painel do Cliente</h1>
              <p className="m-0 text-sm text-slate-500">
                Acesse suas ferramentas de diagnóstico e performance.
              </p>
            </div>

            <AssistantChat />

            <div className="flex flex-col gap-7">
              <ToolGroup title="Relatórios de Diagnósticos" tools={DIAG_TOOLS} onOpen={open} />
              <ToolGroup title="Módulo Financeiro" tools={FIN_TOOLS} onOpen={open} />
              <ToolGroup
                title="Módulo de Tráfego & Marketing Digital"
                tools={TRAF_TOOLS}
                onOpen={open}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
