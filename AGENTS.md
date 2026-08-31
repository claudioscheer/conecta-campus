# Conecta Campus

App da SETREM: demandas de pesquisa e TCC encontram quem tem a habilidade.

## Stack

- Linguagem: **TypeScript** em todo o repositório. Sem JavaScript solto. Sem `any`.
- API: **Bun** (`Bun.serve`). Sem Next.js, sem Express.
- App: **React Native** via **Expo**.
- Validação: **Zod** na API (body e query) e no app (formulário e resposta HTTP).

## Pastas

| Pasta | Conteúdo |
| --- | --- |
| `docs/SPEC.md` | O que o produto faz |
| `docs/DESIGN.md` | O que a tela parece (cor, tipo, botão) |
| `contract/openapi.yaml` | Contrato HTTP (paths, JSON, erros) |
| `api/` | Servidor Bun |
| `app/` | Cliente Expo |

Não compartilhe um pacote de tipos ou de Zod entre `api/` e `app/`. O OpenAPI é o contrato comum. Cada lado tem o próprio schema na borda: a API valida o que entra no servidor; o app valida o que o usuário digitou e o JSON que chegou.

## Comandos

```bash
cd api && bun install && bun --watch src/index.ts
```

Health: `GET http://localhost:3000/v1/health`

## Como escrever código

- Tipar parâmetros, retorno e JSON. Se o tipo não existe no OpenAPI, não invente no código: mude o YAML primeiro.
- Nomes e pastas iguais ao que já está no repo.
- Na API, parse com Zod antes de gravar.
- No app: UI → estado → repositório. A tela não chama a rede.
- Tela nova ou tela mudada: leia `docs/DESIGN.md`. Cores e espaço vêm de `app/theme/tokens.ts`, não de hex solto.
- Login: Google da conta SETREM. Rotas privadas exigem `Authorization: Bearer`.
- Sem chat, push ou upload de arquivo.

## Se os docs discordarem

1. `contract/openapi.yaml` (HTTP)
2. `docs/SPEC.md` (comportamento)
3. `docs/DESIGN.md` (aparência)
4. `docs/FORA-DE-ESCOPO.md` (não fazer)
5. este arquivo (pastas, stack, comandos)
