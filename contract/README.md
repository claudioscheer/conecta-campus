# Contrato OpenAPI (V1)

Arquivo canônico: [`openapi.yaml`](./openapi.yaml).

Comportamento de produto: [`../docs/SPEC.md`](../docs/SPEC.md).

## O que este arquivo é

Lista de paths, corpos JSON, códigos HTTP e exemplos. Não é o lugar de “por que o campus precisa disto” (isso é o SPEC). Não é o lugar de pastas do app.

## Como alterar um path

1. Edite `openapi.yaml` (path, schema, `operationId`).
2. Atualize ou adicione um JSON em `examples/`.
3. Ajuste a linha RF → `operationId` no SPEC se o comportamento mudou.
4. Só então mude API e cliente.

Não crie campo só no handler Next.js. O agente deve recusar PR que chama URL fora deste yaml.

## O que cada operação precisa ter

- `operationId` estável (é o nome que o SPEC e o código usam)
- request (path, query, body, headers como `Idempotency-Key`)
- response de sucesso com schema
- pelo menos um erro (400, 401, 403, 404, 409 ou 5xx)
- lista: `after`, `limit`, item **card** (não o detalhe)

## Exemplos

| Arquivo | Caso |
| --- | --- |
| [`examples/demandas-list-200.json`](./examples/demandas-list-200.json) | Feed ok |
| [`examples/demandas-create-400.json`](./examples/demandas-create-400.json) | Publicar sem título |
