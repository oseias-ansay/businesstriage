import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '../components/ui';
import Footer from '../components/Footer';
import { SITE, TERMO_PRIVACIDADE } from '../data/content';
import type { ReactNode } from 'react';

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="m-0 mb-3 text-[22px] font-extrabold tracking-[-0.01em] text-navy-900">
        {titulo}
      </h2>
      <div className="space-y-3.5 text-[15px] leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

function Nota({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border-l-[3px] border-emerald-500 bg-slate-50 px-4 py-3.5 text-sm leading-relaxed text-slate-600">
      {children}
    </div>
  );
}

export default function Privacidade() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-navy-900 px-6 py-5">
        <div className="mx-auto flex max-w-[820px] items-center justify-between">
          <Logo size="sm" />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[820px] px-6 py-14">
        <div className="eyebrow">Documento</div>
        <h1 className="m-0 text-[34px] font-extrabold leading-tight tracking-[-0.02em] text-navy-900">
          Privacidade e Confidencialidade
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Versão {TERMO_PRIVACIDADE.versao} · Última atualização em{' '}
          {new Date(TERMO_PRIVACIDADE.atualizadoEm).toLocaleDateString('pt-BR')}
        </p>

        <div className="mt-9 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="m-0 mb-3 text-[17px] font-bold text-navy-900">Em resumo</h2>
          <p className="m-0 mb-3 text-sm text-slate-500">
            Se você ler só esta parte, já sabe o essencial:
          </p>
          <ul className="m-0 list-none space-y-2.5 p-0 text-[15px] leading-relaxed text-slate-600">
            {[
              'Os dados financeiros da sua empresa são seus. Não vendemos, não cedemos e não compartilhamos com outros clientes.',
              'Cada empresa fica isolada no banco de dados por uma regra do próprio banco, não por uma verificação do programa. Um cliente não consegue enxergar os dados de outro nem por erro de programação.',
              'Para escrever a parte textual do diagnóstico, os números da sua empresa são enviados a um serviço de inteligência artificial — sem o nome da empresa, sem CNPJ e sem contato.',
              'Você pode pedir a exclusão dos seus dados a qualquer momento, e isso é atendido.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Secao titulo="Que dados coletamos">
          <p>
            <strong className="text-navy-900">No diagnóstico gratuito:</strong> razão social, CNPJ,
            setor, e-mail e telefone de contato, mês de referência, e os números que você informa no
            formulário — faturamento, custos, despesas, saldo em caixa, prazos médios, dívidas e as
            respostas qualitativas.
          </p>
          <p>
            <strong className="text-navy-900">No sistema financeiro:</strong> além dos acima, os
            lançamentos que você registra (descrição, valor, data, categoria, cliente ou fornecedor),
            suas contas bancárias com o saldo de abertura, e os comprovantes que você anexar.
          </p>
          <p>
            <strong className="text-navy-900">Da sua conta de acesso:</strong> nome, e-mail e a
            senha, que é guardada apenas como resumo criptográfico — nem nós conseguimos lê-la.
          </p>
          <p>
            Não coletamos dados de navegação para publicidade e não usamos rastreadores de terceiros
            para esse fim.
          </p>
        </Secao>

        <Secao titulo="Para que usamos">
          <p>
            Para gerar o seu diagnóstico, operar o sistema financeiro e prestar a consultoria que
            você contratou. Nada além disso.
          </p>
          <p>
            Podemos usar dados agregados e anonimizados — por exemplo, “a margem mediana das
            empresas de alimentação atendidas foi de X%” — em materiais próprios. Agregado significa
            que nenhuma empresa é identificável, nem por combinação de características.
          </p>
        </Secao>

        <Secao titulo="Quem tem acesso">
          <p>O acesso é restrito ao responsável pela Business Triage.</p>
          <p>
            Vale ser preciso sobre uma coisa, porque a diferença é real: o painel administrativo da
            Business Triage <strong className="text-navy-900">não exibe os lançamentos financeiros
            dos clientes</strong>. Ele mostra apenas as empresas cadastradas e seus usuários. Isso é
            uma restrição do próprio banco de dados, não uma escolha de tela.
          </p>
          <p>
            Por outro lado, o responsável técnico tem acesso administrativo ao banco, como em
            qualquer sistema. Não seria honesto dizer “não temos como ver seus dados” — o correto é
            dizer que o acesso existe, é restrito a uma pessoa e só é usado para manutenção e
            suporte.
          </p>
        </Secao>

        <Secao titulo="Com quem compartilhamos">
          <p>
            Não vendemos nem cedemos dados. Mas o serviço depende de fornecedores, e é justo você
            saber quais e o que cada um recebe:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {['Fornecedor', 'O que recebe', 'Para quê'].map((th) => (
                    <th
                      key={th}
                      className="bg-navy-900 px-3.5 py-2.5 text-left font-semibold text-white"
                    >
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    'Anthropic (Claude)',
                    'Os números e o contexto do negócio, sem razão social, CNPJ, e-mail ou telefone',
                    'Escrever a parte textual do relatório de diagnóstico',
                  ],
                  [
                    'Google (Gmail)',
                    'Seu e-mail e o conteúdo das mensagens enviadas, incluindo o relatório',
                    'Envio dos relatórios e das notificações do sistema',
                  ],
                  [
                    'Hostinger',
                    'Toda a base, por ser onde o servidor está hospedado',
                    'Hospedagem',
                  ],
                ].map(([forn, recebe, para]) => (
                  <tr key={forn}>
                    <td className="border-b border-slate-200 px-3.5 py-3 align-top font-semibold text-navy-900">
                      {forn}
                    </td>
                    <td className="border-b border-slate-200 px-3.5 py-3 align-top text-slate-600">
                      {recebe}
                    </td>
                    <td className="border-b border-slate-200 px-3.5 py-3 align-top text-slate-600">
                      {para}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>Sobre a inteligência artificial, dois pontos que costumam ser a dúvida real:</p>
          <p>
            <strong className="text-navy-900">
              A pontuação e todos os indicadores são calculados por código auditável, não pela IA.
            </strong>{' '}
            O modelo apenas redige a interpretação sobre números que já chegam prontos. Mesmo input
            produz sempre o mesmo score.
          </p>
          <p>
            <strong className="text-navy-900">
              Os dados enviados para redação não identificam a empresa.
            </strong>{' '}
            Razão social, CNPJ, e-mail e telefone ficam no nosso servidor e não são transmitidos ao
            modelo. O nome que aparece no cabeçalho do seu relatório é inserido depois, já no envio.
          </p>
          <p>
            Uma cópia de cada relatório emitido é mantida na caixa de e-mail corporativa da Business
            Triage ({SITE.email}), para histórico de atendimento.
          </p>
        </Secao>

        <Secao titulo="Como protegemos">
          <p>Descrito de forma concreta, porque promessa genérica não vale nada:</p>
          <ul className="m-0 list-none space-y-2.5 p-0">
            {[
              ['Transmissão cifrada.', 'Todo tráfego entre o seu navegador e o sistema usa HTTPS com certificado válido.'],
              ['Isolamento no banco.', 'No sistema financeiro, cada empresa só enxerga as próprias linhas, por regra aplicada pelo PostgreSQL a cada consulta. Não depende de o programa lembrar de filtrar.'],
              ['Senhas não são armazenadas.', 'Guardamos apenas o resumo criptográfico.'],
              ['Backup diário,', 'com sete cópias diárias e oito semanais.'],
              ['Servidor próprio,', 'não compartilhado com outros clientes de hospedagem, localizado em Campinas-SP.'],
            ].map(([forte, resto]) => (
              <li key={forte} className="flex items-start gap-2.5">
                <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-emerald-500" />
                <span>
                  <strong className="text-navy-900">{forte}</strong> {resto}
                </span>
              </li>
            ))}
          </ul>
          <p>
            Nenhum sistema é imune a falhas. Se houver incidente de segurança que afete os seus
            dados, você será avisado.
          </p>
          <Nota>
            <strong className="text-navy-900">Nota sobre o diagnóstico gratuito:</strong> o
            isolamento por regra de banco descrito acima vale para o sistema financeiro, onde há
            conta e login. Os formulários públicos de diagnóstico não passam por esse banco — os
            dados seguem direto para o processamento e para o e-mail informado por você.
          </Nota>
        </Secao>

        <Secao titulo="Seus direitos">
          <p>Pela LGPD, você pode a qualquer momento pedir:</p>
          <ul className="m-0 list-none space-y-2.5 p-0">
            {[
              'confirmação de que tratamos seus dados, e acesso a eles',
              'correção de dado incompleto ou desatualizado',
              'exclusão dos dados',
              'informação sobre com quem compartilhamos',
              'revogação do consentimento',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
          <p>
            Basta escrever para o contato abaixo. O prazo de resposta é de até 15 dias.
          </p>
          <Nota>
            Sobre exclusão, uma nota honesta: os backups são mantidos por até oito semanas. Um dado
            excluído do sistema pode permanecer nas cópias de segurança até esse prazo, quando são
            sobrescritas pela rotação.
          </Nota>
        </Secao>

        <Secao titulo="Confidencialidade">
          <p>
            Além da obrigação legal, o compromisso comercial: as informações financeiras que você
            nos entrega não são divulgadas, comentadas com terceiros nem usadas para qualquer
            finalidade além de atendê-lo.
          </p>
          <p>
            Isso vale inclusive entre clientes. Se duas empresas do mesmo setor forem atendidas,
            nenhuma saberá da outra por nós.
          </p>
        </Secao>

        <Secao titulo="Contato">
          <p>
            <strong className="text-navy-900">E-mail:</strong> {SITE.email}
          </p>
          <p>
            <strong className="text-navy-900">Responsável pelo tratamento dos dados:</strong> Oseias
            Soares Ansay — CNPJ {SITE.cnpj}
          </p>
        </Secao>
      </main>

      <Footer />
    </div>
  );
}
