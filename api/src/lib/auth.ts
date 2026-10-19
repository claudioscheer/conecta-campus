import { eq } from "drizzle-orm";
import { db } from "../../db";
import { usuarios, type UsuarioRecord } from "../../db/schema";
import { errorResponse } from "./errors";
import { verifyAppToken } from "./jwt";

export async function requireUser(
  req: Request,
): Promise<{ user: UsuarioRecord } | { error: Response }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: errorResponse(401, "UNAUTHORIZED", "Token de autenticação ausente ou inválido."),
    };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return {
      error: errorResponse(401, "UNAUTHORIZED", "Token de autenticação ausente ou inválido."),
    };
  }

  let sub: string;
  try {
    const payload = await verifyAppToken(token);
    sub = payload.sub;
  } catch {
    return { error: errorResponse(401, "UNAUTHORIZED", "Token expirado ou inválido.") };
  }

  const [user] = await db.select().from(usuarios).where(eq(usuarios.id, sub)).limit(1);
  if (!user) {
    return { error: errorResponse(401, "UNAUTHORIZED", "Usuário não encontrado.") };
  }

  return { user };
}
