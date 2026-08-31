# Conecta Campus · Requisitos não funcionais (V1)

Fonte: oficina da Aula 3. O que a pessoa **consegue fazer** está em [`REQUISITOS-FUNCIONAIS.md`](./REQUISITOS-FUNCIONAIS.md) e no Given / When / Then de [`SPEC.md`](./SPEC.md). Aqui entra qualidade: rede, servidor, privacidade, tempo de resposta.

A V1 precisa sobreviver ao Wi-Fi da SETREM. Offline, cache e retry **não** são fase 2.

Como ler cada item: a regra, por que existe, como conferir.

---

## 1. Rede, cache e falha

**RNF-01 · Sem tela branca**  
Feed, detalhe e publicar sempre mostram cache, vazio com ação, ou erro com ação. Tela branca = bug.  
Conferir: airplane mode e 500 forçado em cada uma das três telas.

**RNF-02 · Leitura com cache**  
Mostra o último feed conhecido e revalida quando a rede volta. O aviso “Sem conexão” é um banner, não um modal que trava o app.  
Conferir: carregar o feed, cortar a rede, matar o app, abrir de novo. O último feed ainda está lá.

**RNF-03 · Escrita honesta**  
Publicar ou candidatar-se offline **não** mostra sucesso. Ou o rascunho fica visível, ou a tela diz que precisa de rede.  
Conferir: preencher o form, airplane mode, tocar Publicar. Sem toast de “publicado”.

**RNF-04 · Retry localizado**  
Refaz só a operação que falhou. Não reinicia o aplicativo. Não zera scroll, filtro nem texto.  
Conferir: 500 no detalhe com o feed já na tela. Só o detalhe pede “Tentar novamente”.

**RNF-05 · Mapa HTTP → UI**  
Timeout e 5xx: retry. 401: tenta renovar a sessão **uma** vez, depois login. 403 e 404: sem loop. 400: volta ao campo. A pessoa nunca vê `500 Internal Server Error` cru.  
Conferir: tabela da seção 3 do SPEC.

**RNF-06 · Idempotência**  
`POST /demandas` e `POST .../candidaturas` mandam `Idempotency-Key` (UUID gerado antes do envio). Dois toques ou um retry = um recurso. Validação 400 não usa a mesma chave para “forçar” create.  
Conferir: dois POST byte a byte iguais com a mesma chave.

---

## 2. Autoridade do servidor

**RNF-07 · Fonte da verdade**  
Id, timestamps, status, papéis, contagem de candidaturas e aceite existem de verdade no servidor. O cliente pode otimizar a tela; o estado oficial é o da API.  
Conferir: matar o app depois de um aceite. Reabrir. O aceite continua lá.

**RNF-08 · Validar de novo no servidor**  
Campos obrigatórios, domínio de e-mail e transições de status. Um curl sem título ainda toma 400.  
Conferir: request sem o app.

**RNF-09 · Papel no token**  
Aluno, professor, moderador vêm do backend. Autodeclarar moderador no cadastro é inválido.  
Conferir: token forjado com `papel=moderador` sem ser no banco → 403 em `ocultar`.

---

## 3. Formulários e payload

**RNF-10 · Rascunho no aparelho**  
O texto da publicação permanece até sucesso ou descarte explícito. Oscilação de Wi-Fi não é “limpar form”.  
Conferir: RF-12.

**RNF-11 · Texto e URL, não bytes**  
4G fraco e custo de disco no LARK. Sem multipart nas rotas da V1.  
Conferir: OpenAPI sem `multipart/form-data`.

---

## 4. Desempenho e celular

**RNF-12 · Lista usável**  
Cursor (`after` / `limit`), card leve, prévia curta. Não mandar `problema` completo no feed. Default 20, máximo 50.  
Conferir: payload do card vs detalhe.

**RNF-13 · Primeira pintura**  
Esqueleto ou cache. Spinner eterno no meio da tela é falha.  
Conferir: primeira abertura com rede lenta.

**RNF-14 · Cabe no telefone**  
Área de toque, texto legível, contraste mínimo, leitor de tela básico. Barato agora, caro depois.  
Conferir: olho no aparelho, não só no simulador desktop.

**RNF-11 no SPEC (p95)**  
`listDemandas` e `getDemanda` abaixo de **400 ms** no servidor, `limit=20`, sem contar a rede do celular. Medir no mock e no LARK. Índice em `created_at` + `status`.

---

## 5. Segurança e instituição

**RNF-15 · HTTPS**  
Sem HTTP claro. Sem prontuário, paciente ou dado de terceiros no payload. Pesquisa de campo descreve o problema, não cola planilha de aluno.

**RNF-16 · E-mail fora do card**  
`contato` só depois do aceite, no detalhe. Vazar no feed é bug.

**RNF-17 · Soft delete**  
Ocultar guarda `hidden_at`. Se um dia houver exclusão de conta: anonimizar autoria, não apagar o histórico dos colaboradores. LGPD completa (exportar/apagar com fluxo jurídico) pode evoluir.

**RNF-18 · Domínio SETREM**  
Sem cadastro aberto. O domínio vigente é o que o servidor aceita.

---

## 6. Contrato (LARK)

**RNF-19 · `/v1`**  
App na loja atualiza devagar. Path novo não pode quebrar quem ficou numa build antiga.

**RNF-20 · Erro → estado de produto**  
Lista vazia ≠ 500 ≠ offline com cache. A copy é humana. O JSON de erro não aparece na tela.

---

## 7. O que medimos (sem tela de coordenação)

A turma pediu impacto, não “número de cadastros”. Na V1 os **eventos** existem no banco. O painel fica fora.

- demandas publicadas
- percentual com pelo menos uma candidatura aceita
- tempo até a primeira candidatura
- projetos concluídos no semestre, de preferência **entre cursos diferentes**

Colunas: participação, aceite, conclusão, `lastActivityAt`. Sem dashboard na V1.
