# AGENTS.md · Conecta Campus

Instruções para humanos e agentes que implementam este repositório.

**Objetivo agora:** deixar o projeto pronto para um agente começar a V1 sem inventar chat, push ou upload.

---

## Se os documentos discordarem

1. `contract/openapi.yaml` ganha em path, JSON e código HTTP.
2. `docs/SPEC.md` ganha em comportamento e no que a V1 corta.
3. Este `AGENTS.md` ganha em pastas e no passo a passo de mudança.
4. `README.md` só explica como clonar e rodar.

Corrija o perdedor no mesmo commit.

---

## Layout

```text
conecta-campus/
  AGENTS.md              ← este arquivo
  docs/SPEC.md           ← requisitos (Given / When / Then)
  contract/openapi.yaml  ← contrato HTTP
  api/                   ← Next.js + TypeScript (servidor)
  app/                   ← React Native (Expo) + TypeScript
```

- `api/` implementa o OpenAPI. Não inventa path.
- `app/` consome o OpenAPI. A tela não chama a rede sozinha.
- Camadas no app: UI → estado → repositório → cache local e cliente HTTP.

---

## Loop da V1

autenticar → feed → publicar demanda → candidatar-se → contato → status → concluir com link

Estados em toda lista ou envio: loading, vazio, erro, offline com cache.

**Não implementar:** chat, push, upload de imagem, horas em PDF, ranking, diário de bordo.

---

## Como mudar um endpoint

1. Editar `contract/openapi.yaml` e um JSON em `contract/examples/`.
2. Ajustar a linha RF no `docs/SPEC.md` se o comportamento mudou.
3. Implementar em `api/`.
4. Ajustar o repositório em `app/` (não o `fetch` na tela).

---

## Como pedir trabalho

Bom: “Implemente RF-13 conforme `docs/SPEC.md` e `postCandidatura` no OpenAPI. Sem path novo.”

Ruim: “Faz o feed do Conecta Campus.”
