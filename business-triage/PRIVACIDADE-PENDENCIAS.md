# Privacidade — pendências internas

Checklist de controle. **Não publicar esta página no site** — declarar publicamente o que ainda não está definido enfraquece o documento principal.

## Antes de cobrar do primeiro cliente

- [ ] **Termos de Uso** — o `PRIVACIDADE.md` cobre privacidade, não a relação contratual: disponibilidade, responsabilidade, cancelamento, reajuste
- [ ] **Definir e declarar o prazo de retenção** (hoje marcado como [CONFIRMAR] no documento)
- [ ] **Registrar a base legal de cada tratamento** — execução de contrato, consentimento ou legítimo interesse
- [ ] **Aceite com registro de data e hora** no formulário e no cadastro
- [ ] **Revisão de advogado** antes de o produto ser cobrado

## Confirmações técnicas pendentes

- [ ] O site usa Google Analytics, Meta Pixel ou similar? Se sim, declarar na seção "Que dados coletamos"
- [ ] A restauração de backup já foi testada de fato? Só afirmar se sim
- [ ] A cifragem GPG do backup está ativa?
- [ ] Limitar a retenção de execuções no n8n em **Settings → Executions → Save data** — hoje o payload completo de cada diagnóstico fica armazenado por prazo indeterminado

## Alterações já aplicadas

- [x] CPF removido do documento público — apenas o CNPJ identifica o controlador
- [x] Razão social e CNPJ removidos do prompt enviado à IA, nos dois workflows
- [x] Instrução acrescentada ao prompt para o modelo referir-se sempre a "a empresa"
- [x] Tabela de fornecedores corrigida: Brevo e Google Drive removidos (não utilizados), Gmail declarado
- [x] Cópia dos relatórios redirecionada de conta pessoal para `contato@businesstriage.com.br`
- [x] Localização do servidor confirmada: Campinas-SP
- [x] Ressalva acrescentada: o isolamento por RLS vale para o sistema financeiro, não para os diagnósticos públicos

## Implementação no produto

- [x] Checkbox de consentimento obrigatório nos dois modais, com link para o documento
- [x] Registro no payload: `consentimento.aceito`, `termo_versao`, `termo_atualizado_em`, `aceito_em`
- [x] Página `/privacidade` publicada, com link no rodapé
- [x] CNPJ de exemplo (`00.000.000/0001-00`) substituído pelo real no rodapé
- [x] Menção a "Termos de Uso" removida do rodapé até o documento existir

## Bloqueadores de publicação

- [ ] **`try_files` no nginx** — com React Router, `/privacidade`, `/login` e `/painel` retornam 404 ao serem acessados direto ou recarregados. Só a raiz funciona:
      ```nginx
      location / {
          try_files $uri $uri/ /index.html;
      }
      ```
- [ ] **Variáveis do Supabase ausentes no `.env.production`** — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_API_URL` estão só no `.env.example`. Sem elas, o build de produção sai com `undefined` e o login não funciona, sem erro visível.

## Versionamento do termo

A constante `TERMO_PRIVACIDADE` em `src/data/content.ts` guarda versão e data. Ao alterar o texto de forma relevante, **incremente a versão** — o registro de consentimento de cada cliente aponta para a redação vigente no momento do aceite, e é isso que dá valor probatório ao registro.
