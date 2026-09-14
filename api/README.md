# api/

API do Conecta Campus.

**Stack (simples):**

- [Bun](https://bun.sh) (TypeScript nativo, `bun src/index.ts`)
- HTTP com `Bun.serve` (nada de Next.js, Express ou framework extra)
- [Zod](https://zod.dev) para validar body e query no formato do OpenAPI

Implementa [../contract/openapi.yaml](../contract/openapi.yaml). Não crie path que não esteja lá.

Comportamento: [../docs/SPEC.md](../docs/SPEC.md). Login: Google ID token, só e-mail da SETREM.

```bash
cd api
bun install
bun --watch src/index.ts
```

Copie `.env.example` para `.env`. Suba o Postgres (`docker compose up -d` na raiz). Schema: `db/schema.ts` (Drizzle). `bun run db:generate` depois de mudar o schema; `bun run db:migrate` para aplicar. Depois o Bun.

`GET http://localhost:3000/dev/login` é HTML local para obter um `idToken` real do Google (sem o app Android). Não é produto. Sem `AUTH_DEV`.

Hoje o servidor só responde `GET /v1/health` até o agente implementar o contrato, uma rota por vez, com Zod.
