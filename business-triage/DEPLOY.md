# Deploy — Business Triage

Publicação do site em `businesstriage.com.br`.

## Como está montado

| Item | Valor |
|---|---|
| Servidor | Ubuntu 24.04 · `187.77.232.125` |
| Clone do repositório | `/var/www/businestriage` |
| Raiz servida pelo nginx | `/var/www/businestriage/business-triage/dist` |
| Repositório | `github.com/oseias-ansay/businesstriage` (público) |
| n8n | `n8n.businesstriage.com.br` |

O site é estático: o nginx serve a pasta `dist` gerada pelo build. **O build passa a ser feito no servidor** — o Git versiona apenas código-fonte.

---

## Migração inicial (uma única vez)

Até agora o `dist/` estava commitado no repositório e o deploy era só `git clone`/`git pull`. Vamos tirar os artefatos do Git e passar a construir no servidor.

### 1. Na sua máquina — levar as alterações para o repositório

A pasta de trabalho atual não é um clone do Git. Clone o repositório num diretório novo e copie os arquivos para dentro dele:

```powershell
cd C:\Projetos
git clone https://github.com/oseias-ansay/businesstriage.git bt-repo

robocopy "C:\Projetos\Site da GO Admnistração e Consultoria\business-triage" `
         "C:\Projetos\bt-repo\business-triage" `
         /E /XD node_modules dist .git
```

O `/XD` exclui `node_modules`, `dist` e `.git` da cópia — só o que interessa é levado.

```powershell
cd C:\Projetos\bt-repo

# Tira o dist do controle de versão, sem apagar da sua máquina
git rm -r --cached business-triage/dist

git status          # revise antes de gravar
git add .
git commit -m "Diagnósticos financeiro e comercial integrados ao site"
git push origin main
```

> Confira no `git status` que `node_modules` não aparece. Se aparecer, algo escapou do `.gitignore`.

### 2. No servidor — instalar o Node

```bash
ssh root@187.77.232.125

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v && npm -v      # confirme Node 20.x
```

### 3. No servidor — backup antes de qualquer coisa

**Importante:** o `git pull` vai *apagar* a pasta `dist` (ela deixou de ser rastreada). O site fica fora do ar entre o pull e o fim do build. O backup é a rede de segurança:

```bash
cd /var/www/businestriage/business-triage
cp -r dist /var/www/dist-backup-$(date +%F)
```

### 4. No servidor — atualizar e construir

```bash
cd /var/www/businestriage
git pull origin main

cd business-triage
npm ci
npm run build
```

O `npm ci` instala exatamente as versões do `package-lock.json` — mais rápido e reproduzível que o `npm install`.

O build recria `dist/` no mesmo caminho que o nginx já aponta. Não é preciso mexer na configuração de raiz.

### 5. Se o build falhar

```bash
rm -rf /var/www/businestriage/business-triage/dist
cp -r /var/www/dist-backup-AAAA-MM-DD /var/www/businestriage/business-triage/dist
```

O site volta ao ar na versão anterior enquanto você investiga.

---

## Corrigir o `server_name` do nginx

A configuração atual tem um erro de digitação:

```nginx
server_name businestriage.com.br www.businestriage.com.br;   # falta um "s"
```

O domínio real é `busine**ss**triage.com.br`. O site funciona hoje porque este é o primeiro bloco e acaba servindo como `default_server`, capturando o que não casa com nenhum outro. É frágil: ao adicionar outro site ao servidor, este pode parar de responder sem motivo evidente.

```bash
# Descubra o arquivo do bloco
grep -rl 'businestriage' /etc/nginx/sites-available/

nano /etc/nginx/sites-available/ARQUIVO
```

Corrija para:

```nginx
server_name businesstriage.com.br www.businesstriage.com.br;
```

Depois:

```bash
nginx -t          # NUNCA recarregue sem testar
systemctl reload nginx
```

Se o `nginx -t` acusar erro, **não recarregue** — corrija primeiro. O nginx continua rodando com a configuração antiga enquanto você resolve.

> O nome da pasta `/var/www/businestriage` também tem o erro, mas renomeá-la exige ajustar o `root` do nginx junto. Como não afeta o funcionamento, dá para deixar para uma manutenção futura.

---

## Rotina de deploy (depois da migração)

```powershell
# Na sua máquina
npm run build          # valida os tipos antes de commitar
git add .
git commit -m "descrição da alteração"
git push origin main
```

```bash
# No servidor
cd /var/www/businestriage && git pull origin main
cd business-triage && npm ci && npm run build
```

O `npm run build` local não é obrigatório para o deploy, mas roda o `tsc` e pega erro de tipo antes de o servidor tentar construir.

---

## Verificação pós-deploy

Em **aba anônima** (para não pegar cache):

- [ ] `https://businesstriage.com.br` carrega
- [ ] Os dois cards de diagnóstico na home têm o botão verde
- [ ] O modal financeiro abre, valida campos e envia
- [ ] O modal comercial abre, valida campos e envia
- [ ] No painel: grupo "Relatórios de Diagnósticos" com os dois botões
- [ ] Os e-mails chegam, renderizados (não como código HTML)

Se o site não parecer atualizado, force `Ctrl+Shift+R`. O Vite versiona JS e CSS com hash, mas o `index.html` costuma ficar em cache. Para resolver de vez:

```nginx
location = /index.html {
    add_header Cache-Control "no-cache, must-revalidate";
}
```

---

## Pendências técnicas conhecidas

**Login sem autenticação.** `App.tsx` faz `onSubmit={() => go('dashboard')}` — qualquer credencial entra no painel. Na prática a Área do Cliente é pública.

**Repositório público.** `.env.development` e `.env.production` estão versionados. As URLs de webhook vão para o bundle público de qualquer forma, então não são segredo — mas ficam indexáveis por bots que varrem o GitHub. A proteção efetiva é rate limit no nginx à frente do n8n, não sigilo.

**Sem CI.** O deploy é manual. Um GitHub Actions que faça build e `rsync` no push resolveria, mas exige guardar uma chave SSH nos secrets do repositório.

**Acesso por root com senha.** O SSH está sendo usado como `root` com autenticação por senha. Migrar para um usuário comum com chave pública reduz bastante a superfície de ataque.
