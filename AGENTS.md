# Conecta Campus

App da SETREM: demandas de pesquisa e TCC encontram quem tem a habilidade.

## Stack

- Linguagem: **TypeScript** em todo o repositório. Sem JavaScript solto. Sem `any`.
- API: **Bun** (`Bun.serve`). Sem Next.js, sem Express.
- App: **React Native** via **Expo**.
- Validação: **Zod** na API (body e query) e no app (formulário e resposta HTTP).

## Onde ler o quê

Estes dois ficam na **raiz**, ao lado deste arquivo. O SPEC fica em `docs/` sozinho.

| Arquivo | Para quê |
| --- | --- |
| `AGENTS.md` | Como trabalhar neste repositório (este arquivo) |
| `DESIGN.md` | Decisões visuais: paleta, tipo, espaço, botão, raio, tokens |
| `docs/SPEC.md` | O que o produto faz (Given / When / Then, estados, RNF) |
| `contract/openapi.yaml` | HTTP: paths, JSON, erros |
| `api/` | Servidor Bun |
| `app/` | Cliente Expo |

Não compartilhe um pacote de Zod entre `api/` e `app/`. O OpenAPI é o contrato comum.

Não invente cor, tipo ou botão. Isso está em `DESIGN.md`. Hex e espaço no código: `app/theme/tokens.ts`.

## Comandos

```bash
docker compose up -d
cd api && bun install && bun run db:migrate && bun --watch src/index.ts
cd api && bun test
cd api && bun run db:generate   # depois de mudar api/db/schema.ts
cd api && bun run db:ping       # SELECT 1 pelo Drizzle
```

Health: `GET http://localhost:3000/v1/health` (200 só se o Postgres responder).

Env: `api/.env` (gitignored). Modelo: `api/.env.example`. Sem client secret no git.

## API

Postgres local (Docker na raiz). Sem Cloud SQL, sem site, sem Firebase.

Banco: **Drizzle** + `drizzle-kit` (não Prisma). Schema TypeScript em `api/db/schema.ts`. Migration gerada: `bun run db:generate`. Aplicar: `bun run db:migrate`. Não edite SQL já aplicado: mude o schema e gere a próxima. Tabelas não nascem no `index.ts`. Queries da API usam o client Drizzle, não SQL solto no handler.

Rotas públicas: `GET /v1/health`, `POST /v1/auth`. O resto exige `Authorization: Bearer`.

`POST /v1/auth`: body `{ idToken }` (JWT **do Google**, não a string `dev`). A API chama `verifyIdToken` (audience = `GOOGLE_CLIENT_ID`). E-mail / `hd` em `GOOGLE_ALLOWED_HOSTED_DOMAINS` (`setrem.com.br`). 401 token ruim. 403 domínio outro. Upsert `usuarios` por `google_sub`. Papel sai da nossa tabela, não do Google. Resposta: `{ token, usuario }` (JWT nosso). Sem `AUTH_DEV`. Sem idToken fake.

`GET /dev/login`: HTML local (Google Identity Services) para a pessoa escolher a conta e **copiar o idToken real**. Mesma origem (`http://localhost:3000`). Não é produto. Não é o app Android. O Android, depois, manda o mesmo JSON para `POST /v1/auth`.

Não crie `/login`, `/signin`, `/oauth/callback`. Não use o client secret no Sign-In nativo. Não compartilhe Zod entre `api/` e `app/`.

## Testes

`api/tests/*.behavior.test.ts` trava o contrato (Given / When / Then do SPEC, via `bun test`).

- Rota nova: escreva o teste primeiro. Ele tem de falhar. Depois o código.
- Não altere teste para ficar verde. Altere o código.
- Se o SPEC mudar, o teste muda no mesmo PR.

## Como escrever código

- Tipar parâmetros, retorno e JSON. Campo novo: primeiro o OpenAPI, depois o código.
- Na API, parse com Zod antes de gravar.
- No app: UI → estado → repositório. A tela não chama a rede.
- Qualquer tela: leia `DESIGN.md` antes de gerar UI.
- Login: Google da conta SETREM. Rotas privadas exigem `Authorization: Bearer`.
- Sem chat, push ou upload de arquivo.

## Se os docs discordarem

1. `contract/openapi.yaml` (HTTP)
2. `docs/SPEC.md` (comportamento)
3. `DESIGN.md` (visual)
4. este arquivo (pastas, stack, comandos)
