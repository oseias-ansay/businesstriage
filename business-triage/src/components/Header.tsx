import { useState } from 'react';
import { Lock, Menu, X } from 'lucide-react';
import { Logo } from './ui';
import { useIsMobile } from '../hooks/useIsMobile';

const NAV = [
  { href: '#hero', label: 'Início' },
  { href: '#services', label: 'Serviços' },
  { href: '#contact', label: 'Contato' },
];

interface HeaderProps {
  onLogin: () => void;
  onHome: () => void;
}

export default function Header({ onLogin, onHome }: HeaderProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((v) => !v);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-navy-900/[0.97] shadow-header backdrop-blur-lg">
      <div className="mx-auto flex h-[76px] max-w-shell items-center justify-between px-6">
        <Logo onClick={onHome} />

        {!isMobile && (
          <nav className="flex items-center gap-10">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
            <button type="button" onClick={onLogin} className="btn-accent">
              <Lock className="h-[15px] w-[15px]" />
              Área do Cliente
            </button>
          </nav>
        )}

        {isMobile && (
          <button
            type="button"
            onClick={toggle}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            className="cursor-pointer border-none bg-transparent p-1.5 text-white"
          >
            {open ? <X className="h-[26px] w-[26px]" /> : <Menu className="h-[26px] w-[26px]" />}
          </button>
        )}
      </div>

      {isMobile && open && (
        <div className="flex flex-col gap-[18px] border-t border-white/10 bg-navy-900 px-6 pb-6 pt-4">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={toggle}
              className="text-[15px] font-medium text-slate-200"
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogin();
            }}
            className="btn-accent py-3"
          >
            <Lock className="h-[15px] w-[15px]" />
            Área do Cliente
          </button>
        </div>
      )}
    </header>
  );
}
