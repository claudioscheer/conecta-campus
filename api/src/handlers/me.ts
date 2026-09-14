import { eq } from "drizzle-orm";
import { db } from "../../db";
import { usuarios } from "../../db/schema";
import { errorResponse } from "../lib/errors";
import { verifyAppToken } from "../lib/jwt";

export async function handleMe(req: Request): Promise<Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(401, "UNAUTHORIZED", "Token de autenticação ausente ou inválido.");
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return errorResponse(401, "UNAUTHORIZED", "Token de autenticação ausente ou inválido.");
  }

  let payload;
  try {
    payload = await verifyAppToken(token);
  } catch {
    return errorResponse(401, "UNAUTHORIZED", "Token expirado ou inválido.");
  }

  const [user] = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.id, payload.sub))
    .limit(1);

  if (!user) {
    return errorResponse(401, "UNAUTHORIZED", "Usuário não encontrado.");
  }

  return Response.json({
    id: user.id,
    nome: user.nome,
    email: user.email,
    papel: user.papel,
    ...(user.curso ? { curso: user.curso } : {}),
    ...(user.semestre ? { semestre: user.semestre } : {}),
  });
}
