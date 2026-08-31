# Conecta Campus · SPEC.md (V1)

Documento oficial da primeira versão. Nasce da oficina da Aula 3: a turma (stakeholders e futuros usuários) respondeu como o app deve funcionar no campus. Este arquivo **congela** essas decisões para humanos e para agentes.

Este arquivo descreve **só a V1**. O que não entra nesta versão vive em [`FORA-DE-ESCOPO.md`](./FORA-DE-ESCOPO.md), não aqui.

Catálogo da oficina: [`REQUISITOS-FUNCIONAIS.md`](./REQUISITOS-FUNCIONAIS.md), [`REQUISITOS-NAO-FUNCIONAIS.md`](./REQUISITOS-NAO-FUNCIONAIS.md). Norte do produto: [`PROJECT.md`](./PROJECT.md).

**Contrato HTTP:** [`../contract/openapi.yaml`](../contract/openapi.yaml).

Se este SPEC e o OpenAPI discordarem, **o OpenAPI ganha em path/JSON/código HTTP**. Este SPEC ganha em comportamento de produto. Corrija o perdedor no mesmo commit.

---

## Como usar este documento (humano e agente)

1. Leia o **loop da V1**. Só implemente o que está neste arquivo e no OpenAPI.
2. Cada requisito funcional tem **Given / When / Then**, a **operação OpenAPI** e os **estados de tela**.
3. Não invente campo, path ou status que não existam no OpenAPI.
4. Requisitos não funcionais (seção 4) fazem parte deste SPEC.
5. Prompt curto: “implemente RF-13 conforme docs/SPEC.md e `postCandidatura` no OpenAPI”.

**Vocabulário da V1:** **demanda** (não “post” genérico). **Candidatura** (não chat). **Responsável** = quem publicou.

**Loop:** autenticar → ver o feed → publicar demanda → candidatar-se → obter contato → mudar status → concluir com link.

---

## 1. Problema e contexto

### 1.1 Proposta de valor

Na SETREM os cursos quase não se falam. Agronomia tem estufa e não programa sensores. Saúde precisa de app e análise. Professores têm pesquisa e não acham aluno de TI. Alunos de TI querem projeto real e não conhecem as dores das outras áreas.

O Conecta Campus é o lugar no celular onde uma demanda de pesquisa, TCC ou extensão encontra quem tem a habilidade que falta. Destino real: API no LARK, uso pela comunidade da SETREM.

### 1.2 Usuários e papéis

| Papel | O que precisa | O que faz na V1 |
| --- | --- | --- |
| **Aluno** | Publicar necessidade ou achar projeto real | Publica, busca, candidata-se, acompanha |
| **Professor** | Encontrar colaboradores | Igual ao aluno, com selo de papel visível |
| **Moderador** | Manter o espaço usável | Oculta conteúdo impróprio (papel atribuído no servidor) |

O papel vem do **servidor**. Ninguém se marca moderador no cadastro.

### 1.3 Contexto de uso mobile

Uso rápido no corredor e no laboratório, Wi-Fi do campus oscilando, 4G fraco. A pessoa não pode perder o texto ao publicar. Tela branca = app quebrado.

---

## 2. Requisitos funcionais (V1)

Cada RF abaixo tem **Given / When / Then** (rótulos em inglês, frases em português). Isso é o requisito.

```text
ID · nome curto
O que é (uma ou duas frases)
Given: mundo antes
When: ação da pessoa
Then: resultado observável
Regras: limites e recusas
Falhas: o que a tela faz quando quebra
API: operationId no OpenAPI
Estados: se a tela tiver lista ou envio
```

### 2.1 Autenticação e papéis

**RF-01 · Login com a conta Google da SETREM**

A V1 entra com **Google Sign-In**. A conta tem de ser a do campus (Workspace da SETREM, e-mail institucional, hoje `@setrem.com.br`). Gmail pessoal não entra.

Fluxo:

```text
1. No app, a pessoa toca “Entrar com Google”
2. O SDK do Google devolve um idToken
3. O app manda POST /v1/auth { "idToken": "..." }
4. O servidor valida o token no Google
5. Se o e-mail não for do domínio SETREM → 403, sem sessão
6. Se for → cria ou encontra o usuário, devolve token do Conecta Campus
7. O app guarda o token e chama GET /v1/me
```

Rotas **públicas** (sem Bearer): `GET /v1/health`, `POST /v1/auth`.  
Todo o resto: **401** se faltar token, se estiver expirado ou se for inválido.

When o servidor **bloqueia**:

| Caso | HTTP |
| --- | --- |
| Sem `Authorization: Bearer` nas rotas privadas | 401 |
| Token expirado ou assinado errado | 401 |
| `idToken` do Google inválido | 401 |
| E-mail Google fora do domínio SETREM | 403 |
| Papel insuficiente (ex.: aluno em `ocultar`) | 403 |
| Demanda ocultada para quem não é moderador | 404 |

Given: pessoa com conta Google do campus.  
When: completa o Sign-In e o app envia o `idToken`.  
Then: recebe `token` do Conecta Campus e o `usuario` (id, nome, email, papel).

Regras: o cliente não “libera o app” sem token. O domínio vale o que o **servidor** lista, não um filtro só no celular. O papel vem do servidor (RF-02), não do Google.  
Falhas: 401 token Google ruim; 403 “Use a conta Google da SETREM.”  
API: `postAuth` · `getMe`

**RF-02 · Papéis no token**

Aluno, professor e moderador não se escolhem na tela de cadastro. O servidor manda o papel.

Given: usuário autenticado.  
When: o app lê `getMe`.  
Then: `papel` é `aluno`, `professor` ou `moderador`. A UI só mostra o que esse papel permite.

Regras: checkbox “sou moderador” no cliente é inválido. Mudar papel é operação de administração, fora do app do aluno.  
Falhas: token sem papel → tratar como 401 e pedir login de novo.  
API: `getMe`

**RF-03 · Aluno e professor publicam e apoiam**

Na V1 os dois papéis fazem o loop principal. O professor só se diferencia visualmente.

Given: aluno ou professor autenticado.  
When: publica uma demanda ou envia candidatura.  
Then: a ação é permitida. No card e no detalhe o professor aparece com selo de papel.

Regras: validar pesquisa, assinar extensão e “desafio de laboratório com destaque” **não** entram. Moderador também pode usar o app como pessoa, mas ocultar é RF-23.  
Falhas: 403 se a sessão for de um papel que o servidor recusar nessa rota (não esperado para aluno/professor na V1).  
API: `postDemanda` · `postCandidatura`

**RF-04 · Um responsável por demanda**

Quem publicou é dono do ciclo de vida. Os outros não “tomam” o projeto.

Given: demanda existente.  
When: alguém tenta mudar status, fechar vagas, editar campos ou concluir.  
Then: só o `responsavel_id` (ou admin no servidor) recebe 200. Qualquer outro recebe 403.

Regras: o responsável não se transfere na V1. Candidato aceito não herda o patch.  
Falhas: 403 “Só quem publicou pode alterar esta demanda.”; 404 se a demanda foi ocultada.  
API: `patchDemanda`

### 2.2 Feed e descoberta

**RF-05 · Feed cronológico**

A lista padrão é previsível: o que acabou de entrar aparece em cima.

Given: usuário autenticado.  
When: abre o feed sem filtro especial.  
Then: vê demandas `aberta` e `em_andamento`, da mais nova para a mais antiga. Não há “urgente no topo” nem ranking.

Regras: `concluida`, `arquivada`, `cancelada` e ocultas não entram no feed padrão. Paginação: `after` + `limit` (20, máx. 50).  
Estados: loading (esqueleto), vazio real, erro, offline com cache.  
Falhas: ver seção 3.  
API: `listDemandas`

**RF-06 · Card compacto**

O card decide em dois segundos se vale abrir. Não carrega o problema inteiro no 4G.

Given: uma demanda no feed.  
When: a pessoa olha o card, sem abrir.  
Then: vê título, área/curso, habilidades, prévia de 1-2 linhas, status. Autor e data podem aparecer. O texto completo **não** aparece.

Regras: schema `DemandaCard`. Sem `problema` completo, sem `contato`, sem lista de candidaturas.  
API: schema `DemandaCard`

**RF-07 · Busca e filtros**

Quem procura “sensores” ou “Agronomia” não rola o campus inteiro.

Given: feed visível.  
When: digita busca e/ou escolhe área, habilidade, status.  
Then: a lista reflete os filtros. Zero itens: mensagem + botão “Limpar filtros” (não tela branca).

Regras: busca em título e descrição. Filtros combinam (AND). Cursor recomeça quando o filtro muda.  
Estados: busca sem resultado ≠ feed vazio de verdade.  
API: `listDemandas` (`q`, `area`, `habilidade`, `status`, `after`, `limit`)

**RF-08 · Detalhe**

A tela cheia é o contrato da demanda: o que falta, o que se espera, quem é dono.

Given: a pessoa toca um card.  
When: abre a demanda.  
Then: vê problema completo, resultado esperado, habilidades, status, links, responsável. Campo `contato` só depois de candidatura aceita (ou se o autor publicou um canal no próprio texto/link).

Regras: demanda ocultada → 404 para quem não é moderador. Candidaturas no detalhe: o responsável vê a fila; os outros veem o próprio status, se tiverem uma.  
Estados: loading, erro, offline (detalhe em cache se já visitou).  
API: `getDemanda` · schema `DemandaDetalhe`

### 2.3 Publicação

**RF-09 · Quem publica**

A V1 não espera coordenação para nascer demanda. Qualquer conta institucional publica. Moderação trata o resto.

Given: aluno ou professor autenticado.  
When: envia `postDemanda` com os campos obrigatórios.  
Then: 201, status inicial `aberta`, `id` e timestamps gerados no servidor.

Regras: um grupo da oficina queria só professor. Recusado na V1.  
Falhas: RF-10 e RF-12.  
API: `postDemanda`

**RF-10 · Campos obrigatórios**

Sem estrutura vira desabafo. Título, área, problema, resultado esperado e pelo menos uma habilidade.

Given: formulário de nova demanda.  
When: envia faltando qualquer obrigatório, ou com lista de habilidades vazia.  
Then: 400 `VALIDATION_ERROR` com `fields` por campo. O cliente mostra o erro no campo. O servidor valida de novo.

Regras: validar só no celular não conta. Comprimento mínimo do problema: o suficiente para não ser um título repetido (o OpenAPI manda no schema).  
Copy: “Corrija os campos destacados.”  
API: `postDemanda` · `DemandaCreate`

**RF-11 · Texto e links, não arquivo**

Evidência na V1 é URL. A oficina dividiu voto em foto. O corte é explícito.

Given: formulário de publicação.  
When: a pessoa quer anexar evidência.  
Then: só o campo `links[]` (Drive, GitHub, Lattes, página). Sem seletor de imagem, PDF ou vídeo.

Regras: URL malformada → 400 no campo `links`. Bytes no body → recusar.  
API: `DemandaCreate.links[]`

**RF-12 · Rascunho e idempotência**

Wi-Fi do campus cai. O texto não pode sumir. Um segundo toque não cria duas demandas.

Given: formulário preenchido; a rede falha no “Publicar”.  
When: a chamada não completa (timeout, 5xx, offline).  
Then: o texto permanece no aparelho; aviso + “Tentar novamente”. O cliente manda `Idempotency-Key` (UUID). O servidor devolve o mesmo recurso se a chave se repetir.

Regras: 400 de validação **não** entra em retry automático. Descartar rascunho é ação explícita da pessoa.  
Estados: falha ao publicar.  
API: `postDemanda` + header `Idempotency-Key`

### 2.4 Colaboração e contato

**RF-13 · Quero ajudar**

Não é um like. É uma candidatura com categoria e mensagem.

Given: demanda com status `aberta` e usuário autenticado (não precisa ser o responsável).  
When: envia categoria (`programar`, `desenhar`, `analisar_dados`, `sensores`, `escrita`, `campo`, `outro`) e mensagem curta.  
Then: 201, candidatura `pendente`. Segunda candidatura da mesma pessoa na mesma demanda: 409.

Regras: demanda `em_andamento` / `concluida` / `arquivada` / `cancelada` recusa novas candidaturas (409). Idempotency-Key no POST. O responsável não “se candidata” a si mesmo de forma útil: o servidor pode recusar ou ignorar.  
Copy 409: “Você já se candidatou a esta demanda.”  
API: `postCandidatura`

**RF-14 · Aceitar, recusar, cancelar**

A fila é do responsável. O candidato pode desistir enquanto está pendente.

Given: candidatura `pendente`.  
When: o responsável manda `aceita` ou `recusada`, ou o candidato manda `cancelada`.  
Then: o status muda. Recusa não publica um “motivo” para o campus inteiro.

Regras: só o responsável aceita/recusa. Só o dono da candidatura cancela. Transição inválida (aceitar de novo, cancelar depois de aceita) → 409. Aceitar dispara notificação (RF-25) e libera `contato` (RF-15).  
API: `patchCandidatura`

**RF-15 · Contato depois do aceite**

Sem chat. O app só mostra como as duas pessoas se falam fora dele.

Given: candidatura `aceita`.  
When: responsável ou candidato abre o detalhe.  
Then: aparece `contato.email` institucional (e `contato.link` se o autor tiver informado). Antes do aceite o e-mail **não** vai no JSON do card nem do detalhe público.

Regras: vazar e-mail no feed é bug de privacidade. Chat interno está no fora de escopo.  
API: `getDemanda` (campo `contato` só após aceite)

**RF-16 · Encerrar vagas**

O projeto continua visível. Só para de receber gente nova.

Given: responsável da demanda `aberta`.  
When: marca `em_andamento` (equipe completa).  
Then: o botão “Quero ajudar” some. `postCandidatura` devolve 409. Candidaturas já pendentes o responsável ainda pode aceitar ou recusar.

Regras: reabrir vagas na V1 = voltar para `aberta` (só o responsável).  
API: `patchDemanda`

**RF-17 · Vários projetos**

Ninguém é obrigado a escolher um único TCC no app.

Given: usuário autenticado, já candidato em uma demanda.  
When: candidata-se a outra.  
Then: 201, se a outra estiver `aberta` e ainda não houver candidatura dele lá.

Regras: sem teto numérico na V1.  
API: `postCandidatura`

### 2.5 Status, conclusão e perfil

**RF-18 · Máquina de estados**

Status ambíguo gera demanda “concluída que ainda recebe apoio”. O servidor é o juiz.

Given: responsável autenticado e uma transição.  
When: envia `patchDemanda` com `status`.  
Then: o servidor aceita só as setas abaixo e recusa o resto com 409.

```text
aberta → em_andamento → concluida
aberta → arquivada | cancelada
em_andamento → concluida | arquivada | cancelada
```

Regras: `concluida`, `arquivada` e `cancelada` não recebem candidatura. Não há `aberta` de novo a partir de `concluida` na V1 (reabrir é versão futura).  
API: `patchDemanda`

**RF-19 · Concluir com link**

Fechar o ciclo: o campus vê que deu em alguma coisa.

Given: responsável, demanda `aberta` ou `em_andamento`.  
When: marca `concluida` e, se quiser, manda `resultadoUrl`.  
Then: some do feed padrão; permanece no perfil dos envolvidos; o link aparece no detalhe.

Regras: `resultadoUrl` é opcional na V1, mas o SPEC recomenda pedir. Página “portfólio do campus” agregada fica fora.  
API: `patchDemanda`

**RF-20 · Arquivar na mão**

Sumir do feed sem apagar história.

Given: responsável.  
When: marca `arquivada`.  
Then: sai do feed padrão. O registro permanece. Arquivamento automático por 90 dias **não** roda na V1. O campo `lastActivityAt` já é gravado para isso no futuro.

Regras: arquivar ≠ ocultar por moderação. Ocultar é RF-23.  
API: `patchDemanda`

**RF-21 · Perfil básico**

Credibilidade mínima: nome, curso, o que a pessoa já tocou.

Given: usuário autenticado.  
When: abre o próprio perfil ou o de outra pessoa da instituição.  
Then: nome, curso, semestre, listas de demandas publicadas, em que participa, concluídas.

Regras: sem ranking, pontos, badges. Perfil visível só para autenticados.  
API: `getUsuario`

### 2.6 Moderação

**RF-22 · Denunciar**

Qualquer conta institucional pode sinalizar. A denúncia não é um voto de exclusão.

Given: usuário autenticado.  
When: denuncia uma demanda com motivo (`spam`, `ofensivo`, `fora_do_tema`, `outro`).  
Then: 201, item na fila. O conteúdo **continua visível**.

Regras: a denúncia não oculta sozinha (evita censura entre colegas). Motivo obrigatório.  
API: `postDenuncia`

**RF-23 · Ocultar**

Moderador tira da vista. O banco guarda.

Given: sessão com `papel=moderador`.  
When: chama `postOcultarDemanda`.  
Then: 204. Some do feed e do detalhe para o restante. Soft delete (`hidden_at`).

Regras: aluno e professor recebem 403. Hard delete (apagar linha) fora da V1. Painel completo de fila fica fora; a V1 precisa da ação de ocultar.  
API: `postOcultarDemanda`

### 2.7 Notificações no aplicativo

**RF-24 · Central**

Sino dentro do app. Sem push no sistema operacional.

Given: usuário autenticado.  
When: abre o sino.  
Then: lista paginada, lida/não lida. Toque abre a demanda ou a candidatura alvo. Marcar lida: `patchNotificacao`.

Regras: push nativo e silenciar projeto ficam fora.  
API: `listNotificacoes` · `patchNotificacao`

**RF-25 · Quando avisar**

Poucos eventos. Notificar demais treina a pessoa a ignorar.

Given: um destes aconteceu no servidor.  
When: nova candidatura na minha demanda; minha candidatura foi aceita ou recusada; status mudou em demanda que eu publico ou em que fui aceito.  
Then: nasce uma linha na central da pessoa certa. Sem “sentimos sua falta”. Sem aviso de marketing.

Regras: agrupar depois é futuro. V1 pode ser um evento por ação.  
API: criação no servidor + `listNotificacoes`

---

## 3. Estados de produto e falhas

Valem em **toda** tela de lista ou envio. Não são “depois”. Empty, loading, erro e offline entram no mesmo documento dos RFs porque o usuário os vê como parte do produto.

O feed vazio (ninguém publicou ainda) **não** é o mesmo que busca sem resultado, **não** é 500, **não** é offline com cache. Quatro UIs diferentes.

| Estado | O que a pessoa vê | Ação |
| --- | --- | --- |
| **Loading** | Esqueleto de cards no primeiro load. Não trava o app. | Esperar |
| **Vazio real** | “Ainda não há demandas.” | Botão publicar |
| **Busca sem resultado** | “Nada para esses filtros.” | Limpar filtros |
| **Erro 5xx / timeout** | Mensagem na **seção** que falhou. Sem código HTTP. | Tentar novamente (só aquela chamada) |
| **400 validação** | Erro no campo do formulário | Corrigir e reenviar |
| **401** | Sessão inválida | Entrar de novo (uma renovação automática) |
| **403 / 404** | Ação indisponível ou demanda sumiu | Sem retry em loop |
| **Offline com cache** | Último feed + aviso “Sem conexão” | Ler; escritas não fingem sucesso |
| **Offline sem cache** | Explica que não há dados salvos | Tentar de novo |
| **Falha ao publicar** | Rascunho intacto | Tentar novamente + Idempotency-Key |

Cópia de exemplo (pode ir para o app):

- Vazio: “Nenhuma demanda ainda. Publique a primeira necessidade do seu curso.”
- Offline: “Sem conexão. Mostrando o que estava salvo.”
- Erro: “Não foi possível carregar. Tente de novo.”
- 409 candidatura: “Você já se candidatou a esta demanda.”

---

## 4. Requisitos não funcionais

Detalhe e como verificar: [`REQUISITOS-NAO-FUNCIONAIS.md`](./REQUISITOS-NAO-FUNCIONAIS.md).

| ID | Regra | Como saber que passou |
| --- | --- | --- |
| **RNF-01** | Servidor é a fonte da verdade: id, timestamps, status, papéis, contagem. | Cliente não inventa `id` oficial nem “aceita” localmente para valer. |
| **RNF-02** | Validação de negócio **repete no servidor**. | Request sem campo obrigatório via curl ainda toma 400. |
| **RNF-03** | Nenhuma tela crítica termina em branco. | Feed, detalhe e publicar sempre têm cache, vazio ou erro. |
| **RNF-04** | Cache local para leitura. Banner de offline não bloqueia. | Airplane mode: último feed visível. |
| **RNF-05** | Retry localizado. Formulário não apaga texto. | 500 no publicar: texto intacto, retry só daquele POST. |
| **RNF-06** | POST de demanda e candidatura exigem `Idempotency-Key`. | Dois POST iguais = um recurso. |
| **RNF-07** | HTTPS. Sem prontuário, paciente ou dado de terceiros no payload. | Revisão do schema OpenAPI. |
| **RNF-08** | E-mail de contato não aparece no card. | JSON de `listDemandas` sem `contato`. |
| **RNF-09** | API `/v1`. App antigo não quebra por path novo. | Prefixos versionados. |
| **RNF-10** | Feed paginado (`after`, `limit` 20, máx. 50). Card ≠ detalhe. | Card sem `problema` completo. |
| **RNF-11** | p95 `listDemandas` e `getDemanda` abaixo de **400 ms** no servidor (sem a rede do celular). | Medir no mock e no LARK. |
| **RNF-12** | Banco **PostgreSQL**. | Ver seção 6. |
| **RNF-13** | Sem mídia binária na V1. Capa futura: object store, no banco só URL. | Sem multipart nas rotas da V1. |
| **RNF-14** | Eventos no banco: publicada, aceite, concluída, `lastActivityAt`. Sem dashboard. | Colunas existem mesmo sem tela de coordenação. |

---

## 5. Contrato de API

Arquivo: [`../contract/openapi.yaml`](../contract/openapi.yaml).

Protocolo: **REST JSON**, iniciado pelo cliente. Sem GraphQL e sem WebSocket na V1.

### 5.1 Mapa (tela → operação)

| Tela / ação | Método e path | operationId |
| --- | --- | --- |
| Saúde | `GET /v1/health` | `getHealth` |
| Entrar | `POST /v1/auth` | `postAuth` |
| Eu | `GET /v1/me` | `getMe` |
| Feed | `GET /v1/demandas` | `listDemandas` |
| Detalhe | `GET /v1/demandas/{id}` | `getDemanda` |
| Publicar | `POST /v1/demandas` | `postDemanda` |
| Status / arquivar / concluir | `PATCH /v1/demandas/{id}` | `patchDemanda` |
| Quero ajudar | `POST /v1/demandas/{id}/candidaturas` | `postCandidatura` |
| Aceitar / recusar / cancelar | `PATCH /v1/demandas/{id}/candidaturas/{cid}` | `patchCandidatura` |
| Denunciar | `POST /v1/demandas/{id}/denuncias` | `postDenuncia` |
| Ocultar | `POST /v1/demandas/{id}/ocultar` | `postOcultarDemanda` |
| Perfil | `GET /v1/usuarios/{id}` | `getUsuario` |
| Sino | `GET /v1/notificacoes` | `listNotificacoes` |
| Marcar lida | `PATCH /v1/notificacoes/{id}` | `patchNotificacao` |

### 5.2 Entrada e saída (resumo)

Tudo autenticado com `Authorization: Bearer <token>`, exceto `getHealth` e `postAuth`.

**POST /v1/auth** (`postAuth`)  
Entrada: `{ "idToken": "<Google ID token>" }`  
Saída 200: `{ "token": "<JWT do app>", "usuario": { id, nome, email, papel } }`  
Falhas: 401 token Google inválido; 403 e-mail fora da SETREM.

**GET /v1/me** (`getMe`)  
Entrada: Bearer.  
Saída 200: usuário da sessão. 401 sem sessão.

**GET /v1/demandas** (`listDemandas`)  
Entrada: query `q`, `area`, `habilidade`, `status`, `after`, `limit`.  
Saída 200: `{ "items": [DemandaCard], "paging": { nextCursor, hasMore } }`. Card sem problema completo e sem contato.

**GET /v1/demandas/{id}** (`getDemanda`)  
Saída 200: `DemandaDetalhe`. `contato` só se a candidatura da sessão foi aceita. 404 se ocultada.

**POST /v1/demandas** (`postDemanda`)  
Entrada: header `Idempotency-Key`; body `titulo`, `area`, `problema`, `resultadoEsperado`, `habilidades[]`, `links[]?`.  
Saída 201: detalhe, status `aberta`. 400 por campo.

**PATCH /v1/demandas/{id}** (`patchDemanda`)  
Entrada: `status` e/ou `resultadoUrl` (e campos editáveis). Só o responsável.  
Saída 200: detalhe. 403 outro usuário. 409 transição inválida.

**POST /v1/demandas/{id}/candidaturas** (`postCandidatura`)  
Entrada: `Idempotency-Key`; `{ "categoria", "mensagem" }`.  
Saída 201: candidatura `pendente`. 409 se já candidatou ou se a demanda não está `aberta`.

**PATCH /v1/demandas/{id}/candidaturas/{cid}** (`patchCandidatura`)  
Entrada: `{ "status": "aceita" | "recusada" | "cancelada" }`.  
Saída 200: candidatura. 403 se não for o responsável (aceite/recusa) nem o candidato (cancelar).

JSON completo: [`../contract/openapi.yaml`](../contract/openapi.yaml). Exemplos: [`../contract/examples/`](../contract/examples/).

### 5.3 Por que estes campos

| Campo | Onde | Por quê |
| --- | --- | --- |
| `titulo`, `area`, `habilidades`, `preview`, `status` | card | Decidir em 2 segundos se abre |
| `problema`, `resultadoEsperado`, `links` | detalhe | Não inflar o feed no 4G |
| `contato` | detalhe, só pós-aceite | Privacidade |
| `after` + `limit` | lista | Paginação estável (não offset) |
| `Idempotency-Key` | POST | Retry no celular não duplica |
| `lastActivityAt` | demanda | Habilita arquivo automático depois, sem migração |

### 5.4 Erro padrão (todo 4xx/5xx)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Corrija os campos destacados.",
    "fields": { "titulo": "obrigatório" }
  }
}
```

O app mapeia `code` + HTTP para a tabela da seção 3. Nunca mostra o JSON cru.

### 5.5 Como mudar o contrato

1. Editar `contract/openapi.yaml` e um exemplo em `contract/examples/`.
2. Ajustar API.
3. Ajustar o cliente (repositório, não a tela direto).
4. Atualizar a linha RF ↔ operationId neste SPEC se o comportamento mudar.

---

## 6. Dados e arquitetura

### 6.1 Por que SQL (PostgreSQL), não documento

A V1 é **relacional**: usuário tem muitas demandas; demanda tem muitas candidaturas; **uma candidatura por par (usuário, demanda)**; transições de status precisam de transação (aceitar + liberar contato + notificar).

| Critério | SQL (Postgres) | Documento (Mongo etc.) |
| --- | --- | --- |
| Relações e unique composto | Forte | Frágil |
| Transação aceite + notificação | Nativa | Mais trabalho |
| Feed filtrado + cursor | Índice + `created_at` | Ok, mas unique é o ponto |
| Schema que o OpenAPI já descreve | Encaixa | Facilita “campo a mais” sem contrato |

**Escolha V1: PostgreSQL.** Documento só faria sentido se o payload fosse livre e sem joins. Aqui não é.

### 6.2 Tabelas

```text
usuarios          id, nome, email, papel, curso, semestre, created_at
demandas          id, responsavel_id, titulo, area, problema,
                  resultado_esperado, status, resultado_url,
                  hidden_at, last_activity_at, created_at, updated_at
demanda_habilidades  demanda_id, habilidade
demanda_links        demanda_id, url
candidaturas      id, demanda_id, usuario_id, categoria, mensagem,
                  status, created_at, updated_at
                  UNIQUE (demanda_id, usuario_id)
denuncias         id, demanda_id, autor_id, motivo, created_at
notificacoes      id, usuario_id, tipo, alvo_id, lida_at, created_at
idempotency_keys  key, usuario_id, operation, resource_id, created_at
```

O banco **não** guarda bytes de imagem. Só URL, se um dia existir capa.

### 6.3 Camadas no cliente (Aula 4 em diante)

```text
UI  →  state holder  →  repository  →  cache local
                                   →  cliente HTTP (OpenAPI)
```

A tela não chama `fetch`. O servidor dono de id, status e papel.

### 6.4 Imagens (decisão explícita)

A oficina dividiu voto em foto de capa. **V1: sem binário.** Evidência = link.

Se a V1.1 adicionar uma capa: comprimir no cliente, enviar a um **object store**, gravar só `capaUrl` na demanda. Postgres não é disco de foto. 4G e custo no LARK são o motivo do corte.

### 6.5 Como testar se a API está boa o bastante

Não é “sentir que está rápido”. Medir:

| Teste | O que prova |
| --- | --- |
| Contrato: exemplos OpenAPI batem com a resposta | Agente e app não inventam JSON |
| p95 `GET /v1/demandas` < 400 ms no servidor, `limit=20` | Índice em `created_at` + `status` |
| Cursor: página 2 não repete id da página 1 | `after` estável |
| Dois POST iguais com a mesma `Idempotency-Key` | Um recurso só |
| `PATCH` de não-responsável → 403 | Autorização |
| Transição `concluida` → candidatura → 409 | Máquina de estados |
| Payload do card sem `problema` completo | Não over-fetch |

Ferramenta: script de k6 ou coleção HTTP contra o mock; depois contra o LARK. O app mede TTI da lista (esqueleto → cards) no dispositivo, não só o tempo do servidor.

---

## 7. Critério de pronto da V1

1. Aluno ou professor entra com e-mail institucional.
2. Publica uma demanda válida (ou vê 400 por campo).
3. Outro encontra no feed (busca/filtro) e se candidata.
4. O responsável aceita; os dois veem contato.
5. Status vai até concluída com link.
6. Wi-Fi cai: cache ou rascunho, nunca tela branca.
7. Chat, push e upload **não** existem.

Se um agente entregar o que está em [`FORA-DE-ESCOPO.md`](./FORA-DE-ESCOPO.md), a V1 não está pronta: está fora do combinado.
