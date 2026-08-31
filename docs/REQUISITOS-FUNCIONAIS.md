# Conecta Campus · Requisitos funcionais (V1)

Fonte: oficina da Aula 3 (10 respostas distintas; Emerson, Tiago e Wesley enviaram o mesmo documento).

Este arquivo é o **catálogo** do que a V1 faz, com regra e tela. O formato Given / When / Then de cada RF (o que o agente implementa) está em [`SPEC.md`](./SPEC.md). Qualidade e rede: [`REQUISITOS-NAO-FUNCIONAIS.md`](./REQUISITOS-NAO-FUNCIONAIS.md). Cortes: [`FORA-DE-ESCOPO.md`](./FORA-DE-ESCOPO.md). Contrato HTTP: [`../contract/openapi.yaml`](../contract/openapi.yaml).

**Como priorizamos:** maioria da turma + estados de tela obrigatórios no curso. Onde o voto dividiu, a decisão está no fora de escopo.

**Loop da V1:** autenticar com e-mail institucional → ver o feed → publicar demanda → candidatar-se → obter contato → mudar status → concluir com link.

---

## 1. Autenticação e papéis

**RF-01 · Login institucional**  
Só e-mail da SETREM. Sem isso a pessoa não publica e não se candidata. E-mail pessoal é recusa com mensagem clara, não um “cadastro aberto”.  
Tela: formulário de entrada. Falha: “Use o e-mail institucional da SETREM.”

**RF-02 · Papéis no servidor**  
`aluno`, `professor`, `moderador`. Vêm no token. Não existe checkbox “sou moderador” no cadastro. Se o token não tiver papel, o app pede login de novo.

**RF-03 · Aluno e professor no loop**  
Os dois publicam e se candidatam. Professor leva selo visível no card/detalhe. Validar pesquisa, assinar extensão e desafio de laboratório **não** entram nesta versão.

**RF-04 · Um responsável**  
Quem publicou edita status, fecha vagas e conclui. Outra pessoa toma 403. Candidato aceito não vira dono. Troca de responsável fica para depois.

---

## 2. Feed e descoberta

**RF-05 · Ordem cronológica**  
Demandas `aberta` e `em_andamento`, mais novas em cima. Sem urgente no topo (todo mundo marcaria urgente). Sem recomendação. Concluídas e arquivadas saem do feed padrão. Lista paginada (`after`, 20 itens).  
Tela: esqueleto no primeiro load; se não houver nada, convite para publicar.

**RF-06 · Card curto**  
Título, área/curso, habilidades, prévia de 1-2 linhas, status. Autor e data podem aparecer. Problema completo e e-mail **não** vão no card. Motivo: 4G e decisão em dois segundos.

**RF-07 · Busca e filtros**  
Texto em título/descrição. Filtro por área, habilidade e status. Combinam entre si. Mudou o filtro, o cursor recomeça. Zero hits: “Nada para esses filtros” + Limpar filtros. Isso não é o mesmo que campus sem demanda nenhuma.

**RF-08 · Detalhe**  
Problema, resultado esperado, habilidades, status, links, responsável. Contato institucional só depois do aceite (RF-15). O responsável vê a fila de candidaturas. Quem não publicou vê, no máximo, o status da própria candidatura.

---

## 3. Publicação

**RF-09 · Quem publica**  
Qualquer aluno ou professor autenticado. Um grupo queria só coordenação; a V1 abre e usa moderação (RF-22, RF-23) para o resto.

**RF-10 · Campos obrigatórios**  
Título, área/curso, problema, resultado esperado, pelo menos uma habilidade. Falta algum: 400 com erro **por campo**, no cliente e de novo no servidor. Copy: “Corrija os campos destacados.”

**RF-11 · Só texto e URL**  
Drive, GitHub, Lattes, página do projeto. Sem galeria, PDF, vídeo, foto de capa. URL inválida: erro no campo `links`.

**RF-12 · Rascunho se a rede cair**  
O texto não some. Aviso + Tentar novamente. `Idempotency-Key` para o segundo toque não criar duas demandas. Erro 400 (validação) não entra em retry automático. Apagar o rascunho é escolha da pessoa.

---

## 4. Colaboração e contato

**RF-13 · Quero ajudar**  
Não é like. Categoria (programar, desenhar, dados, sensores, escrita, campo, outro) + mensagem curta. Status inicial `pendente`. Mesma pessoa, mesma demanda: 409, “Você já se candidatou a esta demanda.” Demanda que não está `aberta` também recusa.

**RF-14 · Aceitar, recusar, cancelar**  
Responsável aceita ou recusa. Candidato cancela enquanto está pendente. Recusa sem “motivo público” no mural. Aceitar dispara o contato (RF-15) e o sino (RF-25).

**RF-15 · Contato depois do aceite**  
E-mail institucional (e um link extra se o autor tiver posto). Sem chat. Antes do aceite o e-mail não vai no JSON do feed.

**RF-16 · Encerrar vagas**  
Status `em_andamento`. A demanda continua visível. Some o botão de candidatar. Pendências antigas o responsável ainda resolve. Reabrir = voltar para `aberta`.

**RF-17 · Vários projetos**  
Pode candidatar-se a quantas demandas abertas quiser. Sem teto na V1.

---

## 5. Status, conclusão e perfil

**RF-18 · Máquina de estados**  
`aberta` → `em_andamento` → `concluida`. De `aberta` ou `em_andamento` também dá para `arquivada` ou `cancelada`. Qualquer outra seta: 409. Concluída não recebe candidatura.

**RF-19 · Concluir**  
Responsável marca `concluida` e pode mandar `resultadoUrl` (artigo, repo, protótipo). Sai do feed padrão. Continua no perfil. Página “portfólio do campus” agregada fica fora.

**RF-20 · Arquivar na mão**  
Sai do feed, registro permanece. Job de 90 dias parado **não** liga na V1. O campo `lastActivityAt` já existe para o futuro. Arquivar não é ocultar (ocultar é moderação).

**RF-21 · Perfil**  
Nome, curso, semestre, listas: publicou / participa / concluiu. Sem ranking. Só quem está autenticado vê perfil.

---

## 6. Moderação e denúncia

**RF-22 · Denunciar**  
Qualquer autenticado, com motivo (spam, ofensivo, fora do tema, outro). Entra na fila. **Não** esconde o post sozinho.

**RF-23 · Ocultar**  
Só `moderador`. Soft delete: some da UI, fica no banco. Aluno/professor: 403. Apagar a linha de vez fica fora. Painel bonito de fila também; a V1 precisa da ação.

---

## 7. Notificações no aplicativo

**RF-24 · Sino**  
Lista dentro do app, lida/não lida, toque abre o alvo. Sem push no celular.

**RF-25 · Quando avisar**  
Só: nova candidatura na minha demanda; minha candidatura aceita ou recusada; mudou o status de algo que eu publico ou em que fui aceito. Sem “sentimos sua falta”.

---

## 8. Estados de produto

Isto também é funcional: o que a pessoa vê quando a vida não é o caminho feliz.

| Estado | Tela | Ação |
| --- | --- | --- |
| Loading | Esqueleto de cards. Não trava o app. | Esperar |
| Vazio real | “Nenhuma demanda ainda. Publique a primeira necessidade do seu curso.” | Publicar |
| Busca sem resultado | “Nada para esses filtros.” | Limpar filtros |
| 5xx / timeout | Mensagem na **seção** que falhou. Sem código HTTP. | Tentar novamente só nela |
| 400 | Erro no campo | Corrigir |
| 401 | Sessão inválida | Entrar de novo (uma renovação) |
| 403 / 404 | Indisponível ou sumiu | Sem loop de retry |
| Offline + cache | Último feed + “Sem conexão. Mostrando o que estava salvo.” | Ler; não fingir que publicou |
| Offline sem cache | Não há dados salvos | Tentar de novo |
| Falha ao publicar | Rascunho intacto | Tentar novamente + Idempotency-Key |

---

## Divergências da oficina (não viraram V1)

- Foto de capa: voto dividido. V1 = links.
- Diário de bordo: metade queria. V1 = só status.
- Publicar só professor: um grupo. V1 = qualquer conta institucional.
- Aceite individual: entra no mínimo (RF-14). Lista de espera e vaga por habilidade não.
