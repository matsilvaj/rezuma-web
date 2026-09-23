# rezuma-web

Frontend do **Rezuma**: resumos automáticos, feitos com IA, dos documentos que FIIs e ações publicam na B3 e na CVM (relatórios gerenciais, fatos relevantes, ITR/DFP etc.). O usuário cadastra os ativos que acompanha e recebe os resumos no painel, por e-mail e pelo Telegram.

O projeto é gratuito e se mantém com doações via Pix.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + componentes **shadcn/ui** (Radix UI) + ícones `lucide-react`
- **Supabase** (`@supabase/ssr`) para autenticação e sessão
- `sonner` para toasts, `next-themes` para tema claro/escuro, `qrcode.react` para o QR Code do Pix
- Vercel Analytics e Speed Insights

O backend fica em [`../rezuma-api`](../rezuma-api): FastAPI, com os resumos gerados pelo Claude Haiku.

## Estrutura

```
src/
├── app/
│   ├── (auth)/        login, cadastro, esqueci/redefinir senha
│   ├── (app)/         área logada: dashboard, detalhe do relatório, ativos, configurações
│   ├── api/auth/      rota de logout
│   ├── _components/   seções da landing page
│   ├── contato, faq, sobre, privacidade, termos
│   └── page.tsx       landing page
├── components/ui/     componentes base (shadcn)
├── lib/               cliente da API, Supabase, sessão, validação, Pix, formatação de relatórios
├── types/             tipos compartilhados
└── proxy.ts           renova a sessão do Supabase e protege as rotas logadas
```

## Como funciona

- **Autenticação:** o Supabase Auth cuida da sessão. O `proxy.ts` (o antigo middleware, que o Next 16 chama de proxy) renova a sessão a cada requisição e manda para o login quem tenta abrir uma rota logada sem estar autenticado.
- **Dados:** o `src/lib/api.ts` chama o `rezuma-api` e envia o token do Supabase no header `Authorization: Bearer <token>`. O backend valida esse token.

## Rodando localmente

Pré-requisitos: Node.js 20+ e o `rezuma-api` rodando (ou uma URL dele já publicada).

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```

Depois é só abrir [http://localhost:3000](http://localhost:3000).

### Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase |
| `NEXT_PUBLIC_API_URL` | URL base do `rezuma-api` |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site, usada no redirecionamento do logout (padrão: `http://localhost:3000`) |
| `NEXT_PUBLIC_PIX_KEY` | Chave Pix para doações |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Usuário do bot do Telegram (padrão: `RezumaAppBot`) |

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | ESLint |

## Deploy

Feito na **Vercel**. Configure as mesmas variáveis de ambiente no painel do projeto.
