# Privacidade e Confidencialidade

**Última atualização:** [CONFIRMAR data de publicação]

---

## Em resumo

Se você ler só esta parte, já sabe o essencial:

- Os dados financeiros da sua empresa são seus. Não vendemos, não cedemos e não compartilhamos com outros clientes.
- Cada empresa fica isolada no banco de dados por uma regra do próprio banco, não por uma verificação do programa. Um cliente não consegue enxergar os dados de outro nem por erro de programação.
- Para escrever a parte textual do diagnóstico, os números da sua empresa são enviados a um serviço de inteligência artificial — **sem o nome da empresa, sem CNPJ e sem contato**. Está explicado abaixo.
- Você pode pedir a exclusão dos seus dados a qualquer momento, e isso é atendido.

---

## Que dados coletamos

**No diagnóstico gratuito:** razão social, CNPJ, setor, e-mail e telefone de contato, mês de referência, e os números que você informa no formulário — faturamento, custos, despesas, saldo em caixa, prazos médios, dívidas e as respostas qualitativas.

**No sistema financeiro:** além dos acima, os lançamentos que você registra (descrição, valor, data, categoria, cliente ou fornecedor), suas contas bancárias com o saldo de abertura, e os comprovantes que você anexar.

**Da sua conta de acesso:** nome, e-mail e a senha, que é guardada apenas como resumo criptográfico — nem nós conseguimos lê-la.

Não coletamos dados de navegação para publicidade e não usamos rastreadores de terceiros para esse fim. *[CONFIRMAR se o site tem Google Analytics, Meta Pixel ou similar — se tiver, precisa ser declarado aqui.]*

## Para que usamos

Para gerar o seu diagnóstico, operar o sistema financeiro e prestar a consultoria que você contratou. Nada além disso.

Podemos usar dados agregados e anonimizados — por exemplo, *"a margem mediana das empresas de alimentação atendidas foi de X%"* — em materiais próprios. Agregado significa que nenhuma empresa é identificável, nem por combinação de características.

## Quem tem acesso

O acesso é restrito ao responsável pela Business Triage.

Vale ser preciso sobre uma coisa, porque a diferença é real: o painel administrativo da Business Triage **não exibe os lançamentos financeiros dos clientes**. Ele mostra apenas as empresas cadastradas e seus usuários. Isso é uma restrição do próprio banco de dados, não uma escolha de tela.

Por outro lado, o responsável técnico tem acesso administrativo ao banco, como em qualquer sistema. Não seria honesto dizer *"não temos como ver seus dados"* — o correto é dizer que o acesso existe, é restrito a uma pessoa e só é usado para manutenção e suporte.

## Com quem compartilhamos

Não vendemos nem cedemos dados. Mas o serviço depende de fornecedores, e é justo você saber quais e o que cada um recebe:

| Fornecedor | O que recebe | Para quê |
|---|---|---|
| Anthropic (Claude) | Os números e o contexto do negócio, **sem razão social, CNPJ, e-mail ou telefone** | Escrever a parte textual do relatório de diagnóstico |
| Google (Gmail) | Seu e-mail e o conteúdo das mensagens enviadas, incluindo o relatório | Envio dos relatórios e das notificações do sistema |
| Hostinger | Toda a base, por ser onde o servidor está hospedado | Hospedagem |

Sobre a inteligência artificial, dois pontos que costumam ser a dúvida real:

**A pontuação e todos os indicadores são calculados por código auditável, não pela IA.** O modelo apenas redige a interpretação sobre números que já chegam prontos. Mesmo input produz sempre o mesmo score.

**Os dados enviados para redação não identificam a empresa.** Razão social, CNPJ, e-mail e telefone ficam no nosso servidor e não são transmitidos ao modelo. O nome que aparece no cabeçalho do seu relatório é inserido depois, já no envio.

Uma cópia de cada relatório emitido é mantida na caixa de e-mail corporativa da Business Triage (`contato@businesstriage.com.br`), para histórico de atendimento.

## Como protegemos

Descrito de forma concreta, porque promessa genérica não vale nada:

- **Transmissão cifrada.** Todo tráfego entre o seu navegador e o sistema usa HTTPS com certificado válido.
- **Isolamento no banco.** No sistema financeiro, cada empresa só enxerga as próprias linhas, por regra aplicada pelo PostgreSQL a cada consulta. Não depende de o programa lembrar de filtrar.
- **Senhas não são armazenadas.** Guardamos apenas o resumo criptográfico.
- **Backup diário**, com sete cópias diárias e oito semanais. *[CONFIRMAR se a restauração já foi testada — só afirme se tiver feito. CONFIRMAR se a cifragem GPG do backup está ativa.]*
- **Servidor próprio**, não compartilhado com outros clientes de hospedagem, localizado em Campinas-SP.

Nenhum sistema é imune a falhas. Se houver incidente de segurança que afete os seus dados, você será avisado.

> **Nota sobre o diagnóstico gratuito:** o isolamento por regra de banco descrito acima vale para o sistema financeiro, onde há conta e login. Os formulários públicos de diagnóstico não passam por esse banco — os dados seguem direto para o processamento e para o e-mail informado por você.

## Por quanto tempo guardamos

*[CONFIRMAR — você precisa decidir e declarar.]* Sugestão razoável:

- **Diagnósticos de quem não virou cliente:** 12 meses, depois excluídos.
- **Dados de clientes ativos:** enquanto durar a relação.
- **Após o encerramento:** 90 dias para você exportar o que quiser, depois exclusão. Ressalvados prazos legais de guarda fiscal.

*[CONFIRMAR: definir também a retenção dos registros de execução do sistema de automação, que hoje armazena o conteúdo de cada diagnóstico processado.]*

## Seus direitos

Pela LGPD, você pode a qualquer momento pedir:

- confirmação de que tratamos seus dados, e acesso a eles
- correção de dado incompleto ou desatualizado
- exclusão dos dados
- informação sobre com quem compartilhamos
- revogação do consentimento

Basta escrever para o contato abaixo. O prazo de resposta é de até 15 dias.

Sobre exclusão, uma nota honesta: os backups são mantidos por até oito semanas. Um dado excluído do sistema pode permanecer nas cópias de segurança até esse prazo, quando são sobrescritas pela rotação.

## Confidencialidade

Além da obrigação legal, o compromisso comercial: as informações financeiras que você nos entrega não são divulgadas, comentadas com terceiros nem usadas para qualquer finalidade além de atendê-lo.

Isso vale inclusive entre clientes. Se duas empresas do mesmo setor forem atendidas, nenhuma saberá da outra por nós.

## Contato

**E-mail:** contato@businesstriage.com.br

**Responsável pelo tratamento dos dados:** Oseias Soares Ansay — CNPJ 32.923.569/0001-15
