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
cd api && bun install && bun --watch src/index.ts
```

Health: `GET http://localhost:3000/v1/health`

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
