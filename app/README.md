# app/

Aplicativo mobile do Conecta Campus. React Native (Expo) + TypeScript.

Consome [../contract/openapi.yaml](../contract/openapi.yaml). Camadas: UI → estado → repositório → cache / cliente HTTP. A tela não chama a rede sozinha.

Comportamento: [../docs/SPEC.md](../docs/SPEC.md). Visual: [../DESIGN.md](../DESIGN.md).

Ainda não há código. O próximo passo é o agente gerar a estrutura de pastas e o feed (RF-05) com estados de tela.
