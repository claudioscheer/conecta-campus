import * as jose from "jose";

async function getSecretKey(): Promise<Uint8Array> {
  const secret = process.env.JWT_SECRET || "conecta-campus-default-secret-key-safe";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return new Uint8Array(digest);
}

export interface AppJwtPayload {
  sub: string;
  email: string;
  papel: "aluno" | "professor" | "moderador";
  nome: string;
}

export async function signAppToken(usuario: {
  id: string;
  email: string;
  papel: "aluno" | "professor" | "moderador";
  nome: string;
}): Promise<string> {
  const key = await getSecretKey();
  return await new jose.SignJWT({
    email: usuario.email,
    papel: usuario.papel,
    nome: usuario.nome,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(usuario.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyAppToken(token: string): Promise<AppJwtPayload> {
  const key = await getSecretKey();
  const { payload } = await jose.jwtVerify(token, key);
  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("Token sem subject válido.");
  }
  return {
    sub: payload.sub,
    email: typeof payload.email === "string" ? payload.email : "",
    papel: (payload.papel as "aluno" | "professor" | "moderador") || "aluno",
    nome: typeof payload.nome === "string" ? payload.nome : "",
  };
}
