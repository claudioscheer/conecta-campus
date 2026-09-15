import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { usuarios } from "../../db/schema";
import { env } from "../env";
import { errorResponse } from "../lib/errors";
import { verifyGoogleIdToken } from "../lib/google-auth";
import { signAppToken } from "../lib/jwt";

const authBodySchema = z.object({
  idToken: z.string({ required_error: "obrigatório" }).min(1, "obrigatório"),
});

export async function handleAuth(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, "VALIDATION_ERROR", "Corrija os campos destacados.");
  }

  const parseResult = authBodySchema.safeParse(body);
  if (!parseResult.success) {
    const fields: Record<string, string> = {};
    for (const issue of parseResult.error.issues) {
      const path = issue.path.join(".") || "body";
      fields[path] = issue.message;
    }
    return errorResponse(400, "VALIDATION_ERROR", "Corrija os campos destacados.", fields);
  }

  const { idToken } = parseResult.data;

  let googlePayload;
  try {
    googlePayload = await verifyGoogleIdToken(idToken);
  } catch {
    return errorResponse(401, "UNAUTHORIZED", "Token do Google inválido ou expirado.");
  }

  const allowedDomains = env.GOOGLE_ALLOWED_HOSTED_DOMAINS
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  const emailDomain = googlePayload.email.split("@")[1]?.toLowerCase();
  const hd = googlePayload.hd?.toLowerCase();

  const isDomainAllowed =
    (emailDomain && allowedDomains.includes(emailDomain)) ||
    (hd && allowedDomains.includes(hd));

  if (!isDomainAllowed) {
    return errorResponse(403, "FORBIDDEN", "Use a conta Google da SETREM.");
  }

  const [existingUser] = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.googleSub, googlePayload.sub))
    .limit(1);

  let userRecord;
  if (existingUser) {
    const [updatedUser] = await db
      .update(usuarios)
      .set({
        nome: googlePayload.name || existingUser.nome,
        email: googlePayload.email,
        updatedAt: new Date(),
      })
      .where(eq(usuarios.id, existingUser.id))
      .returning();
    userRecord = updatedUser;
  } else {
    const [newUser] = await db
      .insert(usuarios)
      .values({
        id: crypto.randomUUID(),
        googleSub: googlePayload.sub,
        nome: googlePayload.name || googlePayload.email.split("@")[0],
        email: googlePayload.email,
        papel: "aluno",
      })
      .returning();
    userRecord = newUser;
  }

  const token = await signAppToken({
    id: userRecord.id,
    email: userRecord.email,
    papel: userRecord.papel,
    nome: userRecord.nome,
  });

  return Response.json({
    token,
    usuario: {
      id: userRecord.id,
      nome: userRecord.nome,
      email: userRecord.email,
      papel: userRecord.papel,
      ...(userRecord.curso ? { curso: userRecord.curso } : {}),
      ...(userRecord.semestre ? { semestre: userRecord.semestre } : {}),
    },
  });
}
