# Conecta Campus

Aplicativo da SETREM para publicar demandas de pesquisa, TCC e extensão e encontrar quem tem a habilidade que falta.

Repositório: [github.com/claudioscheer/conecta-campus](https://github.com/claudioscheer/conecta-campus)

## Por onde começar

| Arquivo | Para quê |
| --- | --- |
| [docs/SPEC.md](./docs/SPEC.md) | O que a V1 faz (Given / When / Then) |
| [contract/openapi.yaml](./contract/openapi.yaml) | Paths, JSON, erros |
| [AGENTS.md](./AGENTS.md) | Como um agente deve trabalhar aqui |
| [api/](./api/) | API (Next.js + TypeScript) |
| [app/](./app/) | Aplicativo mobile (Expo + TypeScript) |

A V1 ainda não tem código de servidor nem de app. Os documentos acima são o que o agente precisa para começar sem inventar produto.

## Loop da V1

autenticar → feed → publicar demanda → candidatar-se → contato → status → concluir com link
