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

Hoje o servidor só responde `GET /v1/health`. O agente completa as rotas do contrato, uma a uma, validando com Zod.
