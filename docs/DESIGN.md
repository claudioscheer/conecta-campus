# DESIGN.md · Conecta Campus

O que o app **parece**. O SPEC diz o que faz. Este arquivo diz cor, tipo, espaço e botão.

Antes de gerar ou mudar tela, leia isto. Não invente paleta.

Estilos no código: `app/theme/tokens.ts` (ainda a criar). Hex e espaço vivem lá, não soltos no componente.

---

## Direção

Campus, papel, calmo. Não é fintech neon, não é card SaaS com sombra grande.

Referências para olhar (não copiar pixel a pixel):

- [Mobbin](https://mobbin.com): telas reais de app, fluxo de feed e form
- [Refero](https://refero.design): padrões de UI (lista, vazio, erro)
- [Get Designs](https://www.getdesigns.ai): mood e direção visual
- Material e Human Interface só para gesto e área de toque, não para colar o visual do iOS/Android

---

## Cor

| Token | Hex | Uso |
| --- | --- | --- |
| `ink` | `#1C1917` | Título, texto principal |
| `muted` | `#44403C` | Corpo |
| `faint` | `#78716C` | Label, meta |
| `paper` | `#FBF8F1` | Fundo da tela |
| `line` | `#DDD6CB` | Borda |
| `primary` | `#1E3A5F` | Botão principal, link, foco |
| `primarySoft` | `#E7EEF6` | Chip, fundo de destaque |
| `danger` | `#7A2E22` | Erro, denúncia |
| `dangerSoft` | `#F5E8E4` | Fundo de erro |
| `ok` | `#2F4F42` | Sucesso, status concluída |
| `okSoft` | `#E7EFE9` | Fundo de sucesso |

Não acrescente cor de acento. `primary` é o único azul.

---

## Tipo

- Título: serif do sistema se existir, senão a serif padrão do Expo. Tamanho 22–28.
- Corpo: sans (System). Tamanho 16, line-height 1.4.
- Label / `num`: sans 11–12, letter-spacing um pouco aberto, uppercase só em trilho curto.
- Código / id: mono, só em debug. Usuário não vê hex nem HTTP.

---

## Espaço e borda

- Grade: 4. Use 8, 12, 16, 24. Não use 7 nem 13.
- Padding de tela: 16 nas laterais.
- Raio: **4** em botão e input. **2** em chip. Sem pílula (999).
- Borda: 1px `line`. Sem sombra grande. Sem blur.

---

## Botão

| Variante | Visual | Quando |
| --- | --- | --- |
| Primário | fundo `primary`, texto branco | Ação principal da tela (Publicar, Entrar com Google, Quero ajudar) |
| Secundário | fundo transparente, borda `line`, texto `ink` | Cancelar, Limpar filtros |
| Perigo | fundo `dangerSoft`, texto `danger` | Ocultar, recusar |

Altura mínima 44. Texto do botão é verbo. Um primário por tela.

Estados: default, pressionado (um pouco mais escuro), desabilitado (opacidade 0.4), loading (o texto some, indicador no lugar).

---

## Telas

- **Feed:** lista, não grade. Card com borda `line`, fundo `paper`. Sem sombra.
- **Vazio:** mensagem + um primário. Nunca tela em branco.
- **Erro:** texto humano + secundário “Tentar novamente”. Sem código HTTP.
- **Offline:** banner fino no topo (`muted` em `primarySoft`), conteúdo em cache embaixo.

---

## Onde vai no código

```text
app/theme/tokens.ts     cores, espaço, raio, tipo
app/ui/Button.tsx       usa tokens, não hex
app/ui/Card.tsx
```

Se o hex aparecer no meio de uma tela, está errado. Extraia para `tokens.ts`.

## Não faça

- Gradiente neon, glass, card com radius 24
- Cor nova “só nesta tela”
- Botão primário duplicado na mesma view
- Copiar Dribbble sem passar por este arquivo
