# Conecta Campus

Aplicativo da SETREM para publicar demandas de pesquisa e TCC e encontrar quem tem a habilidade que falta.

Repositório: [github.com/claudioscheer/conecta-campus](https://github.com/claudioscheer/conecta-campus)

## Por onde começar

| Arquivo | Para quê |
| --- | --- |
| [docs/SPEC.md](./docs/SPEC.md) | O que o produto faz |
| [contract/openapi.yaml](./contract/openapi.yaml) | Paths, JSON, erros |
| [AGENTS.md](./AGENTS.md) | Instruções para qualquer agente (Codex, Cursor, Copilot) |
| [CLAUDE.md](./CLAUDE.md) | Ponte para o Claude Code (`@AGENTS.md`) |
| [api/](./api/) | Servidor: Bun + Zod |
| [app/](./app/) | Mobile: Expo + TypeScript |

## Loop

autenticar → feed → publicar demanda → candidatar-se → contato → status → concluir com link

## Como pedir algo ao agente

O agente lê `AGENTS.md` sozinho. No chat, cite o RF e o `operationId`:

```text
Implemente RF-05 (feed) conforme docs/SPEC.md.
Use só listDemandas no contract/openapi.yaml.
Card = DemandaCard. Sem problema completo.
Estados: esqueleto, vazio, erro, offline com cache.
Não crie path novo.
```

Ruim: “faz o feed”. O modelo inventa campo, chat e foto.

## API local

```bash
cd api && bun install && bun --watch src/index.ts
```
