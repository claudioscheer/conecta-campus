# Conecta Campus

App da SETREM: demandas de pesquisa e TCC encontram quem tem a habilidade.

## Pastas

| Pasta | Conteúdo |
| --- | --- |
| `docs/SPEC.md` | O que o produto faz |
| `contract/openapi.yaml` | HTTP: paths, JSON, erros |
| `api/` | Servidor. Bun, `Bun.serve`, Zod |
| `app/` | Mobile. Expo, TypeScript |

## Comandos

```bash
cd api && bun install && bun --watch src/index.ts
```

Health: `GET http://localhost:3000/v1/health`

## Regras

- Não crie path, campo ou status fora do OpenAPI.
- No app: UI → estado → repositório. A tela não chama a rede.
- Login: Google da conta SETREM. Rotas privadas exigem `Authorization: Bearer`.
- Sem chat, push ou upload de arquivo.

## Se os docs discordarem

1. `contract/openapi.yaml` (HTTP)
2. `docs/SPEC.md` (comportamento)
3. `docs/FORA-DE-ESCOPO.md` (não fazer)
4. este arquivo (pastas e comandos)
