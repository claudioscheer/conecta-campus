# App — Conecta Campus (Expo SDK 57; a versão acompanha o `expo` do package.json)

- Docs da versão instalada: https://docs.expo.dev/versions/v57.0.0/. Se o `expo` subir de major, atualize este link junto.
- Google Sign-In: biblioteca nativa `@react-native-google-signin/google-signin`. Nunca `expo-auth-session` (o provider Google dela está depreciado).
- Erros nativos do login: mapear em `src/lib/signInErrors.ts` (puro, com teste em `signInErrors.test.ts`), nunca inline no provider.
- Antes de rodar no aparelho físico: `docs/RODAR_NO_APARELHO.md` (IP da API, SHA-1, clients OAuth).
