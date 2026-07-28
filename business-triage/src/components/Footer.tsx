import { AtSign, Globe, MessageSquare } from 'lucide-react';
import { Logo } from './ui';
import { SITE } from '../data/content';

const SOCIALS = [
  { icon: AtSign, label: 'Instagram' },
  { icon: Globe, label: 'Site' },
  { icon: MessageSquare, label: 'WhatsApp' },
];

export default function Footer() {
  return (
    <footer className="bg-navy-900 px-6 pb-7 pt-12 text-slate-400">
      <div className="mx-auto flex max-w-shell flex-wrap justify-between gap-8 border-b border-white/10 pb-7">
        <Logo size="sm" />
        <div className="flex gap-3.5">
          {SOCIALS.map(({ icon: Icon, label }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] transition-colors hover:bg-white/[0.14]"
            >
              <Icon className="h-[17px] w-[17px]" />
            </a>
          ))}
        </div>
      </div>
      <div className="mx-auto flex max-w-shell flex-wrap justify-between gap-3 pt-6 text-[13px]">
        <span>
          © {new Date().getFullYear()} {SITE.name}. Todos os direitos reservados.
        </span>
        <span>CNPJ {SITE.cnpj} · Termos de Uso · Política de Privacidade</span>
      </div>
    </footer>
  );
}
