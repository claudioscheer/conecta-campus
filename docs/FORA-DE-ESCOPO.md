# Conecta Campus · Fora de escopo (V1)

Fonte: oficina da Aula 3. Cortar não significa “nunca”. Significa: a primeira versão no campus **funciona sem** estes itens.

O agente não “completa” esta lista. Se entregar chat na V1, a entrega está errada.

Resumo do que a V1 **é**: aluno ou professor publica demanda (problema, área, habilidades); outro encontra no feed, se candidata; o autor aceita; os dois saem com um contato; o status vai até concluída com um link; Wi-Fi ruim não vira tela branca.

---

## Comunicação

**Chat interno** (privado, grupo, mídia, presença).  
Por quê cortar: é um segundo produto (histórico, moderação de mensagem, tempo real). Quase toda a turma tirou da V1.  
O que a V1 faz: e-mail institucional / link depois do aceite (RF-15).

**Push nativo (FCM/APNs).**  
Por quê: permissão do SO, token por aparelho, expiração.  
O que a V1 faz: sino **dentro** do app (RF-24).

**Silenciar projeto** e preferências finas por tipo de evento.  
Modelar o dado pode. A tela completa não.

**E-mail automático como único “apoiar”.**  
O fluxo tem de existir no app (candidatura persistida). SMTP pode ser extra depois. Sem SMTP a V1 ainda vale.

---

## Mídia

**Galeria, várias fotos, PDF, vídeo.**  
4G e disco no LARK.

**Imagem de capa.**  
Voto dividido na oficina. V1 = `links[]`. Se voltar: comprimir no celular, object store, no banco só URL. Postgres não guarda bytes.

**Integração Lattes** além de um campo de URL. Um link colado basta.

---

## Colaboração avançada

**Lista de espera e vagas por habilidade.**  
A V1 fecha vagas no geral (RF-16) e aceita/recusa um a um (RF-14).

**Níveis “ajuda pontual” vs “entro no projeto” como enum obrigatório.**  
A mensagem livre cobre. Enum fica para depois.

**Formulário de entrevista por e-mail.**  
O responsável resolve fora do app.

**Comentários públicos na demanda.**  
Um grupo pediu. Não é consenso. Dúvida técnica vai para o contato após o aceite.

---

## Linha do tempo e arquivo

**Diário de bordo** (posts de progresso, marcos, aba comunidade).  
Metade da turma queria. A V1 muda **status**, não entrega timeline.

**Arquivamento automático** (60/90/180 dias).  
Precisa de job confiável e regra com o LARK. V1: o responsável arquiva na mão. `lastActivityAt` já é gravado.

**Portfólio do campus / vitrine de feira / catálogo por curso.**  
V1: status concluída + link no detalhe e no perfil.

---

## Reconhecimento institucional

**PDF de horas / ACG / assinatura digital do professor.**  
Sem regra da coordenação, o PDF é mentira institucional.  
A V1 **guarda** quem foi aceito e o que concluiu, para emitir depois.

**Validar pesquisa e “desafio de laboratório com destaque”.**  
Professor na V1 = mesmo loop do aluno + selo de papel.

**Gamificação, ranking, badge por volume.**  
Premia quantidade, não projeto concluído entre cursos.

---

## Moderação e visibilidade

**Painel completo, bloquear conta com fluxo polido, hard delete.**  
V1: denunciar (não oculta sozinho) + ocultar (soft delete).

**Detalhe da pesquisa só para aceitos** (resumo público vs metodologia privada).  
Valioso, não é V1. O autor controla o que escreve. Orientação: não colar dado sensível.

**Alerta de título duplicado** na hora de publicar.  
Fora. O responsável e a moderação resolvem na mão.

---

## Descoberta “inteligente”

**Urgente no topo, compatibilidade de habilidades, recomendação.**  
Urgente todo mundo marca. Ranking exige regra que a oficina não fechou. V1: cronologia + busca + filtro.

**Bolsa, remunerado, prazo, nível iniciante/avançado.**  
Surgiram como opcionais. Não são o núcleo.

**Vincular a um laboratório físico.**  
Fora.

---

## Infra e adjacências

**Dashboard para coordenação.**  
Eventos no banco (RNF-14). Tela não.

**Exportar portfólio em PDF** para LinkedIn. Fora.

**SSO completo do Workspace.**  
Se o LARK ainda não entregar: e-mail institucional + código. O domínio continua SETREM.

**Fila de todas as escritas offline.**  
V1: cache de leitura + rascunho de publicação. Fila genérica (apoiar, denunciar, etc.) fica para depois.

**Pré-moderação de “projetos grandes”.** Fora.

---

## Ideias da turma (estacionadas)

Não são V1. Podem voltar sem reabrir o loop.

- Vitrine na Feira de Inovação.
- Cold start: 15-20 demandas reais **antes** de abrir o app vazio (operação de lançamento, não feature de código).
- Semestre alvo no form e feed no semestre corrente (barato se o campo existir; não bloqueia o resto).
- Campo “o que o colaborador ganha” (coautoria, horas, bolsa, orientação).
- Versionamento da API e acessibilidade mínima: isso **entra** como NFR, não como corte.

---

## Lembrete para o agente

Se a tarefa for “implementar a V1” e o diff tiver chat, push, upload, ranking ou job de arquivo automático, o diff está fora do combinado. Volte para o loop: publicar, candidatar, contato, status, concluir, estados de tela.
