# Área do Cliente — autenticação e empresas

Migração de `useState<View>` para rotas, com login real via Supabase Auth.

## O que mudou

| Arquivo | Mudança |
|---|---|
| `src/main.tsx` | Envolve o app em `BrowserRouter`, `QueryClientProvider` e `AuthProvider` |
| `src/App.tsx` | Virou tabela de rotas: `/`, `/login`, `/painel` (protegida) |
| `src/pages/Login.tsx` | Autenticação real, estados de erro e carregando |
| `src/pages/Dashboard.tsx` | Empresa vinda das `memberships`, logout de verdade |
| `src/pages/PublicSite.tsx` | Usa `useNavigate` no lugar da prop `onLogin` |
| `src/types.ts` | `View` marcado como obsoleto |

**Novos:** `lib/supabase.ts`, `lib/api.ts`, `contexts/AuthContext.tsx`,
`contexts/TenantContext.tsx`, `components/ProtectedRoute.tsx`,
`components/TenantSwitcher.tsx`.

`Header`, `Hero`, `Footer`, as seções e as ferramentas **não foram tocados**.

## Instalar e rodar

```bash
cd "C:\Projetos\Site da GO Admnistração e Consultoria\business-triage"
npm install
cp .env.example .env.local     # preencha VITE_SUPABASE_ANON_KEY
npm run dev
```

A `ANON_KEY` está no `.env` do Supabase no VPS (`/opt/supabase/.env`), ou no
Studio em Settings → API.

## Criar o primeiro usuário

Ainda não há tela de cadastro — e isso é proposital: quem contrata a Business
Triage é cliente, não se auto-cadastra. Crie pelo Studio, em
**Authentication → Users → Add user**, marcando "Auto Confirm User".

Depois vincule o usuário a uma empresa (SQL Editor):

```sql
-- 1. Empresa
insert into public.tenants (name, tax_id)
values ('Empresa do Cliente Ltda', '12345678000199')
returning id;

-- 2. Vínculo (troque os dois UUIDs)
insert into public.memberships (tenant_id, user_id, role)
values ('UUID_DA_EMPRESA', 'UUID_DO_USUARIO', 'owner');

-- 3. Plano de contas padrão
select public.fn_seed_default_categories('UUID_DA_EMPRESA');
```

Sem o passo 2 o usuário entra, mas vê o aviso de conta não vinculada — que é
o comportamento correto, não um bug.

## Decisões

**A `ANON_KEY` no bundle é segura.** Ela identifica o projeto, não autoriza
nada: o RLS decide o que cada usuário enxerga. A `SERVICE_ROLE_KEY`, essa sim,
nunca pode entrar em variável `VITE_`.

**`ProtectedRoute` é conveniência, não segurança.** Ele evita que a tela pisque
para quem não está logado. Quem burlar o front continua barrado pelo RLS no
banco e pela validação de JWT na API.

**O `TenantProvider` não filtra por `user_id`.** A consulta em `memberships`
confia no RLS, que já devolve só os vínculos do usuário logado. Filtrar no
front seria redundante e passaria a impressão errada de onde está a proteção.

**Empresa ativa no `localStorage`.** O consultor com vários clientes não perde
o contexto a cada F5. Se a empresa salva não existir mais, cai na primeira
da lista.

## Pendências

1. **Recuperação de senha.** O `resetPassword` já existe no `AuthContext`, mas
   falta o link no formulário e a rota `/redefinir-senha`.
2. **Servidor precisa de fallback SPA.** Com rotas reais, abrir
   `businesstriage.com.br/painel` direto faz o nginx procurar um arquivo que
   não existe e devolver 404. Adicione no bloco do site:

   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

   Sem isso funciona ao navegar, mas quebra no F5 e em link compartilhado.
3. **Módulo financeiro** (`/painel/financeiro`) — próxima etapa.
4. **Sem testes.** O fluxo de login e a troca de empresa merecem cobertura
   antes de virar produto pago.
