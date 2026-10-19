---
version: alpha
name: Conecta-Campus
description: Campus paper, not fintech neon. Warm cream screens ({colors.paper}) with a single navy primary ({colors.primary}) for the one CTA per view. Serif titles, system sans for UI. Radius 4 on buttons, inputs and cards. 1px {colors.line} borders, no drop shadow, no pills. Coverage is the V1 mobile app: Google SETREM login, feed of demandas, publish form, candidatura, contact, status, empty/error/offline.
colors:
  primary: "#1E3A5F"
  primary-deep: "#162C48"
  on-primary: "#FFFFFF"
  primary-soft: "#E7EEF6"
  paper: "#FBF8F1"
  paper-deep: "#F3EFE6"
  ink: "#1C1917"
  muted: "#44403C"
  faint: "#78716C"
  line: "#DDD6CB"
  line-strong: "#C9C1B4"
  canvas: "#FBF8F1"
  danger: "#7A2E22"
  danger-soft: "#F5E8E4"
  on-danger: "#7A2E22"
  ok: "#2F4F42"
  ok-soft: "#E7EFE9"
  on-ok: "#2F4F42"
  warn: "#6B4423"
  warn-soft: "#F4EBE0"
  link: "#1E3A5F"
typography:
  screen-title:
    fontFamily: Georgia
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.20
    letterSpacing: 0
  heading-1:
    fontFamily: Georgia
    fontSize: 28px
    fontWeight: 400
    lineHeight: 1.20
  heading-card:
    fontFamily: System
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.30
  body-md:
    fontFamily: System
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.40
  body-md-medium:
    fontFamily: System
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.40
  body-sm:
    fontFamily: System
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.40
  caption:
    fontFamily: System
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.40
  micro:
    fontFamily: System
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.40
  micro-uppercase:
    fontFamily: System
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.40
    letterSpacing: 0.8px
  button-md:
    fontFamily: System
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.20
  code-md:
    fontFamily: ui-monospace
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.40
rounded:
  xs: 2px
  sm: 4px
  md: 4px
  lg: 4px
  full: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  screen-gutter: 16px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
    height: 44px
  button-primary-pressed:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
  button-primary-disabled:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    opacity: 0.4
  button-primary-loading:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
    height: 44px
    border: "1px solid {colors.line}"
  button-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
    height: 44px
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body-md-medium}"
    padding: "0"
  card-demanda:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
    border: "1px solid {colors.line}"
  card-detail:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "{spacing.lg}"
    border: "1px solid {colors.line}"
  chip:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.micro}"
    rounded: "{rounded.xs}"
    padding: "4px 8px"
    border: "1px solid {colors.line}"
  chip-status-aberta:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
  chip-status-concluida:
    backgroundColor: "{colors.ok-soft}"
    textColor: "{colors.ok}"
  banner-offline:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.muted}"
    typography: "{typography.body-sm}"
    padding: "{spacing.sm} {spacing.md}"
    border: "0 0 1px {colors.line} solid"
  banner-error:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    typography: "{typography.body-sm}"
    padding: "{spacing.sm} {spacing.md}"
  empty-state:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    typography: "{typography.body-md}"
    padding: "{spacing.xl} {spacing.md}"
  skeleton-card:
    backgroundColor: "{colors.paper-deep}"
    rounded: "{rounded.sm}"
    height: 88px
  text-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm} {spacing.md}"
    border: "1px solid {colors.line-strong}"
    height: 44px
  text-input-focused:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    border: "2px solid {colors.primary}"
  text-input-error:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    border: "2px solid {colors.danger}"
  text-area:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
    border: "1px solid {colors.line-strong}"
    minHeight: 120px
  form-panel:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "0"
  top-bar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.screen-title}"
    padding: "{spacing.sm} {spacing.md}"
    border: "0 0 1px {colors.line} solid"
    height: 56px
  list-screen:
    backgroundColor: "{colors.paper}"
    padding: "0 {spacing.screen-gutter}"
---

## Overview

O Conecta Campus parece **papel de campus**. Tela cream ({colors.paper}), texto {colors.ink}, um azul-marinho só ({colors.primary}) no botão principal da view. Não é fintech neon, não é card SaaS com sombra, não é pílula.

Títulos de tela em serif (Georgia / Palatino / Iowan se o sistema tiver). Corpo e UI em sans do sistema. Botão, input e card usam `{rounded.sm}` (4px). Borda 1px `{colors.line}`. Sem blur, sem gradiente, sem glass.

O SPEC diz o que a tela **faz**. Este arquivo diz o que ela **parece**. Hex e espaço no código: `app/theme/tokens.ts`. Se o hex aparecer no meio de um componente de tela, extraia.

Cobertura V1: login Google SETREM, feed de demandas, publicar, candidatar, contato, status, estados vazio / loading / erro / offline.

**Assinatura:**
- Fundo `{colors.paper}` em toda tela
- Um `{colors.primary}` por view (Publicar, Entrar com Google, Quero ajudar)
- Card de demanda: borda 1px, raio 4, sem sombra, lista vertical
- Offline: faixa fina `{colors.primary-soft}` no topo, cache embaixo
- Vazio: frase humana + um primário. Nunca branco.

Formato: [DESIGN.md](https://getdesign.md/) (Google Stitch). Tokens no YAML. Agente lê o YAML e as seções abaixo.

## Colors

> Telas da V1: login, feed, detalhe, publicar, candidatura, contato. Mesma paleta em todas.

### Brand
- **Primary** ({colors.primary}): único azul. CTA, link, foco, chip de curso
- **Primary deep** ({colors.primary-deep}): pressionado
- **On primary** ({colors.on-primary}): texto no botão primário
- **Primary soft** ({colors.primary-soft}): chip, faixa offline, fundo de destaque

### Paper
- **Paper** ({colors.paper}): fundo de tela e de card
- **Paper deep** ({colors.paper-deep}): esqueleto de loading, lista panel
- **Line** ({colors.line}): borda 1px
- **Line strong** ({colors.line-strong}): borda de input

### Text
- **Ink** ({colors.ink}): título e corpo
- **Muted** ({colors.muted}): corpo secundário, faixa offline
- **Faint** ({colors.faint}): label, meta, timestamp

### Semantic
- **Danger** / **Danger soft** ({colors.danger}, {colors.danger-soft}): erro, denúncia, recusar
- **Ok** / **Ok soft** ({colors.ok}, {colors.ok-soft}): concluída, aceite
- **Warn** / **Warn soft** ({colors.warn}, {colors.warn-soft}): aviso, não é erro duro
- **Link** ({colors.link}): igual ao primary. Sem cor extra de link

Não acrescente acento. Sem laranja, sem roxo, sem neon.

## Typography

### Font Family
**Georgia** (display): título de tela e heading-1. Fallback: Palatino, Iowan Old Style, serif. Não baixe fonte web só para o título.

**System** (UI): corpo, card, botão, chip, input. No Expo: fonte do sistema (SF no iOS, Roboto no Android). Fallback: ui-sans-serif, sans-serif.

**ui-monospace** (código): só debug. A pessoa no app **não** vê hex, path nem status HTTP.

### Hierarchy

| Token | Size | Weight | Line Height | Family | Use |
|---|---|---|---|---|---|
| `{typography.heading-1}` | 28px | 400 | 1.20 | Georgia | Título grande (login, vazio) |
| `{typography.screen-title}` | 22px | 400 | 1.20 | Georgia | Top bar, nome da tela |
| `{typography.heading-card}` | 17px | 600 | 1.30 | System | Título da demanda no card |
| `{typography.body-md}` | 16px | 400 | 1.40 | System | Corpo |
| `{typography.body-md-medium}` | 16px | 500 | 1.40 | System | Ênfase, link |
| `{typography.body-sm}` | 14px | 400 | 1.40 | System | Meta, preview do card |
| `{typography.caption}` | 13px | 400 | 1.40 | System | Ajuda de campo |
| `{typography.micro}` | 12px | 500 | 1.40 | System | Chip |
| `{typography.micro-uppercase}` | 11px | 600 | 1.40 | System | Trilho curto (label de seção) |
| `{typography.button-md}` | 16px | 600 | 1.20 | System | Rótulo de botão (verbo) |
| `{typography.code-md}` | 13px | 400 | 1.40 | mono | Debug só |

### Principles
- Serif no título de tela. Sans no resto. Esse contraste é a voz.
- Corpo 16 / 1.40. Não comprima para caber mais card.
- Uppercase só em `{typography.micro-uppercase}` e só em trilho de 1–3 palavras.
- Botão é verbo: Publicar, Entrar com Google, Quero ajudar, Tentar novamente.

## Layout

### Spacing
- Base **4px**. Use 4, 8, 12, 16, 24, 32. Não use 7, 13, 15, 18.
- Tokens: `{spacing.xxs}` 4 · `{spacing.xs}` 8 · `{spacing.sm}` 12 · `{spacing.md}` 16 · `{spacing.lg}` 24 · `{spacing.xl}` 32
- Lateral de tela: `{spacing.screen-gutter}` (16px)
- Gap entre cards no feed: `{spacing.sm}` (12px)
- Padding interno do card: `{spacing.md}` (16px)

### Grid
- Uma coluna. Feed é **lista**, não grade.
- Largura = tela do telefone. Sem max-width de marketing.
- Formulário: campos empilhados, gap `{spacing.md}`.

### Whitespace
Tela de lista é densa o bastante para 3 cards acima da dobra. Tela vazia e login ganham `{spacing.xl}` acima da mensagem. Não encha de card vazio decorativo.

## Elevation & Depth

Sistema **plano**. A profundidade vem da borda, não da sombra.

| Level | Treatment | Use |
|---|---|---|
| 0 (flat) | Sem sombra. Borda `1px {colors.line}` | Card, input, botão secundário, tela |
| 1 (focus) | Borda `2px {colors.primary}` | Input focado |
| 2 (error) | Borda `2px {colors.danger}` | Campo inválido |

Sem `box-shadow`. Sem blur. Sem overlay escuro de modal na V1 (erro mora na seção).

## Shapes

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 2px | Chip |
| `{rounded.sm}` | 4px | Botão, input, card, top bar inner |
| `{rounded.md}` | 4px | Igual ao sm. Não suba para 8 |
| `{rounded.lg}` | 4px | Igual. Sem card 12/16 |
| `{rounded.full}` | 9999px | **Proibido** em botão. Não use pílula |

Geometria editorial, quase quadrada. Igual ao deck da disciplina: canto quase reto, borda fina.

## Components

Estados documentados: default, pressed, disabled, loading. Sem hover (é app touch).

### Buttons

**`button-primary`** — ação principal da tela. Uma por view.
- Fundo `{colors.primary}`, texto `{colors.on-primary}`, `{typography.button-md}`, altura 44, padding `12px 16px`, `{rounded.sm}`.
- Pressed: `{colors.primary-deep}`.
- Disabled: opacidade 0.4. Não mude a cor.
- Loading: o texto some, indicador claro no lugar. Largura do botão não colapsa.
- Uso: Entrar com Google, Publicar, Quero ajudar, Publicar a primeira.

**`button-secondary`** — cancelar, limpar filtros, tentar novamente.
- Fundo transparente, texto `{colors.ink}`, borda `1px {colors.line}`, altura 44, `{rounded.sm}`.

**`button-danger`** — recusar, ocultar.
- Fundo `{colors.danger-soft}`, texto `{colors.danger}`, altura 44, `{rounded.sm}`.

**`button-link`** — ação textual.
- Texto `{colors.primary}`, `{typography.body-md-medium}`, sem sublinhado permanente.

### Cards

**`card-demanda`** — item do feed.
- Fundo `{colors.paper}`, borda `1px {colors.line}`, `{rounded.sm}`, padding `{spacing.md}`.
- Título `{typography.heading-card}` `{colors.ink}`. Preview `{typography.body-sm}` `{colors.muted}`. Sem o campo `problema` completo (isso é detalhe).
- Chips de curso e status na base do card. Sem avatar, sem foto.

**`card-detail`** — tela de uma demanda.
- Mesmo tratamento. Padding `{spacing.lg}`. Corpo `{typography.body-md}`.

### Chips

**`chip`** — curso (Agronomia, TI). Fundo `{colors.primary-soft}`, texto `{colors.primary}`, `{rounded.xs}`, padding `4px 8px`.
**`chip-status-aberta`** / **`chip-status-concluida`** — status. Concluída usa ok, não primary.

### Banners and empty

**`banner-offline`** — faixa no topo. Fundo `{colors.primary-soft}`, texto `{colors.muted}`: “Sem conexão. Mostrando o que estava salvo.” Lista em cache continua embaixo. Não bloqueia a tela.

**`banner-error`** — erro da **seção**. Fundo `{colors.danger-soft}`, texto `{colors.danger}`. Sem código HTTP. Ação: `button-secondary` “Tentar novamente”.

**`empty-state`** — “Nenhuma demanda ainda.” + `button-primary` “Publicar a primeira”. Nunca tela em branco.

**`skeleton-card`** — primeiro load. Blocos `{colors.paper-deep}`, altura ~88px, 3 no feed. Sem spinner no centro da tela.

### Inputs

**`text-input`** — altura 44, borda `{colors.line-strong}`, `{rounded.sm}`, texto `{typography.body-md}`.
**`text-input-focused`** — borda 2px `{colors.primary}`.
**`text-input-error`** — borda 2px `{colors.danger}` + caption `{colors.danger}` abaixo.
**`text-area`** — publicar demanda. minHeight 120. Rascunho não some no retry.

### Chrome

**`top-bar`** — “Conecta Campus” em `{typography.screen-title}`. Fundo paper, borda inferior 1px `{colors.line}`, altura 56.
**`list-screen`** — fundo paper, gutter 16.

## Screens (V1)

| Tela | Primário | Notas |
|---|---|---|
| Login | Entrar com Google | Serif 28 no nome do app. Sem segundo CTA de cadastro |
| Feed | Publicar demanda | Lista + busca. Offline = banner + cache |
| Feed vazio | Publicar a primeira | Mensagem + um primário |
| Detalhe | Quero ajudar (se aberta) | Card ≠ detalhe: aqui entra o problema completo |
| Publicar | Publicar | Form. 400 no campo, não toast genérico |
| Candidatura | Enviar | Mensagem curta + categoria |
| Contato | (secundário voltar) | Só depois de aceite. Sem chat |
| Erro de seção | Tentar novamente (secundário) | |

## Do's and Don'ts

### Do
- Reserve `{colors.primary}` para o único CTA da view, link e foco
- Use `{colors.paper}` como fundo de **toda** tela
- `{rounded.sm}` (4px) em botão, input e card
- Altura de toque 44
- Copie de vazio / offline / erro deste arquivo (ou do SPEC)
- Extraia hex para `app/theme/tokens.ts`

### Don't
- Não use pílula (`{rounded.full}`) em botão
- Não invente cor de acento (laranja, roxo, lima)
- Não ponha dois primários na mesma view
- Não use sombra, glass, gradiente, radius 16/24
- Não mostre HTTP, hex ou JSON para a pessoa
- Não copie Dribbble / screenshot pago sem passar por este arquivo
- Não desenhe chat, push nativo ou upload. Fora da V1

## Responsive Behavior

App nativo. Sem breakpoint de marketing site.

| Name | Width | Key Changes |
|---|---|---|
| Phone | 320–430 | Layout canônico. Gutter 16. Um primário no rodapé ou abaixo do conteúdo |
| Large phone | 430–500 | Mesma coluna. Não abra duas colunas de card |
| Tablet | ≥ 600 | Continua uma coluna, max 560 no conteúdo. Sem sidebar na V1 |

### Touch
- Botão e input: 44px
- Chip: área de toque 32px de altura, mesmo se o desenho for menor
- Card inteiro é tocável no feed

### Collapsing
- Top bar fica. Título pode truncar com ellipsis
- Banner offline full width
- Teclado: o primário do form sobe com o teclado ou fica acima dele, não esconde o campo focado

## Iteration Guide

1. Um componente por vez (`button-primary`, `card-demanda`)
2. Cite o token: `{colors.primary}`, `{rounded.sm}`, `button-primary-pressed`
3. Corpo default: `{typography.body-md}`. Título de tela: `{typography.screen-title}`
4. Cards e botões: `{rounded.sm}` (4px)
5. Hex só em `app/theme/tokens.ts`
6. Depois de mudar token, atualize este YAML e o código no mesmo PR
7. Prompt: “implemente o feed RF-05 com `card-demanda`, `banner-offline` e `empty-state` conforme DESIGN.md”

## Code

```text
app/theme/tokens.ts     colors, spacing, rounded, type
app/ui/Button.tsx       variants: primary, secondary, danger
app/ui/Card.tsx         card-demanda
app/ui/Chip.tsx
app/ui/Banner.tsx       offline, error
```

## Known Gaps

- `tokens.ts` ainda não existe. Crie na primeira tela, copiando o YAML
- Sem dark mode na V1
- Sem tab bar documentada: V1 pode ser stack (login → feed → detalhe)
- Sem ícone de marca desenhado. Wordmark “Conecta Campus” em serif basta
- Motion: 150ms no press. Sem bounce
