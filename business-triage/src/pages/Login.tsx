import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Loader2, Lock } from 'lucide-react';
import { Logo } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, session, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Para onde ir depois de entrar: o destino que o usuário tentou acessar,
  // ou o painel.
  const destino = (location.state as { from?: string } | null)?.from ?? '/painel';

  // Já logado (voltou pela URL ou tem sessão salva): não mostra o formulário.
  useEffect(() => {
    if (!loading && session) navigate(destino, { replace: true });
  }, [loading, session, destino, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro(null);

    if (!email.trim() || !password) {
      setErro('Preencha e-mail e senha.');
      return;
    }

    setEnviando(true);
    try {
      await signIn(email.trim(), password);
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível entrar.');
      setPassword('');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy-900 to-navy-800 p-6">
      <div className="w-full max-w-[420px]">
        <Logo onClick={() => navigate('/')} className="mb-8 justify-center" />

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

          {erro && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-700"
            >
              <AlertCircle className="mt-px h-4 w-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <div>
            <label className="label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="field w-full"
              placeholder="voce@empresa.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={enviando}
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="field w-full"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={enviando}
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="btn-accent mt-1.5 py-3.5 text-[15px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Entrando…
              </>
            ) : (
              <>
                Entrar
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="cursor-pointer border-none bg-transparent text-center text-[13px] text-slate-500 hover:text-navy-900"
          >
            ← Voltar ao site
          </button>
        </form>
      </div>
    </div>
  );
}
