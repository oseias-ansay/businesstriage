import { useState, type FormEvent } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { Logo } from '../components/ui';

interface LoginProps {
  onBack: () => void;
  onSubmit: () => void;
}

export default function Login({ onBack, onSubmit }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: substituir por autenticação real (API / OAuth).
    onSubmit();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy-900 to-navy-800 p-6">
      <div className="w-full max-w-[420px]">
        <Logo onClick={onBack} className="mb-8 justify-center" />

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-[18px] rounded-2xl bg-white p-9 shadow-panel"
        >
          <div className="mb-1.5 text-center">
            <div className="mx-auto mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-navy-900">
              <Lock className="h-6 w-6 text-emerald-500" />
            </div>
            <h1 className="m-0 mb-1.5 text-xl font-extrabold text-navy-900">Área do Cliente</h1>
            <p className="m-0 text-[13px] text-slate-500">Acesse seu painel de diagnóstico</p>
          </div>

          <div>
            <label className="label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className="field w-full"
              placeholder="voce@empresa.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              className="field w-full"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-accent mt-1.5 py-3.5 text-[15px]">
            Entrar
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onBack}
            className="cursor-pointer border-none bg-transparent text-center text-[13px] text-slate-500 hover:text-navy-900"
          >
            ← Voltar ao site
          </button>
        </form>
      </div>
    </div>
  );
}
