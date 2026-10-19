import { z } from "zod";
import { authLog, describeToken } from "@/lib/logger";

export const PapelSchema = z.enum(["aluno", "professor", "moderador"]);
export type Papel = z.infer<typeof PapelSchema>;

export const UsuarioSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(1),
  email: z.string().email(),
  papel: PapelSchema,
  curso: z.string().optional(),
  semestre: z.string().optional(),
});
export type Usuario = z.infer<typeof UsuarioSchema>;

export const AuthResponseSchema = z.object({
  token: z.string().min(1),
  usuario: UsuarioSchema,
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

const ErrorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "SERVER_ERROR",
]);

const ErrorEnvelopeSchema = z.object({
  error: z.object({
    code: ErrorCodeSchema,
    message: z.string(),
    fields: z.record(z.string(), z.string()).optional(),
  }),
});

export class AuthApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly userMessage: string;

  constructor(args: { status: number; code: string; userMessage: string }) {
    super(args.userMessage);
    this.name = "AuthApiError";
    this.status = args.status;
    this.code = args.code;
    this.userMessage = args.userMessage;
  }
}

function readErrorCode(body: unknown): string | undefined {
  const parsed = ErrorEnvelopeSchema.safeParse(body);
  if (parsed.success) {
    return parsed.data.error.code;
  }
  return undefined;
}

export function authFailureMessage(status: number, code: string | undefined): string {
  if (status === 403 || code === "FORBIDDEN") {
    return "Use a conta Google da SETREM.";
  }
  if (status === 401 || code === "UNAUTHORIZED") {
    return "Não foi possível validar sua conta Google. Tente de novo.";
  }
  return "Algo deu errado. Tente de novo.";
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return undefined;
  }
}

type PostAuthArgs = {
  baseUrl: string;
  idToken: string;
  fetchFn?: typeof fetch;
};

export async function postAuth({
  baseUrl,
  idToken,
  fetchFn = fetch,
}: PostAuthArgs): Promise<AuthResponse> {
  authLog("api", "POST /auth start", {
    baseUrl,
    idTokenLen: idToken.length,
  });
  let response: Response;
  try {
    response = await fetchFn(`${baseUrl}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  } catch {
    authLog("api", "POST /auth network failed", { baseUrl });
    throw new AuthApiError({
      status: 0,
      code: "OFFLINE",
      userMessage: "Sem conexão. Verifique sua internet e tente de novo.",
    });
  }

  const body = await parseJsonSafe(response);
  authLog("api", "POST /auth response", {
    status: response.status,
    code: readErrorCode(body) ?? "none",
  });
  if (!response.ok) {
    throw new AuthApiError({
      status: response.status,
      code: readErrorCode(body) ?? "SERVER_ERROR",
      userMessage: authFailureMessage(response.status, readErrorCode(body)),
    });
  }

  const parsed = AuthResponseSchema.safeParse(body);
  if (!parsed.success) {
    authLog("api", "POST /auth invalid body", {
      issues: parsed.error.issues.length,
    });
    throw new AuthApiError({
      status: response.status,
      code: "SERVER_ERROR",
      userMessage: "Resposta inválida do servidor. Tente de novo.",
    });
  }
  authLog("api", "POST /auth success", {
    token: describeToken(parsed.data.token),
    email: parsed.data.usuario.email,
    papel: parsed.data.usuario.papel,
  });
  return parsed.data;
}

type GetMeArgs = {
  baseUrl: string;
  token: string;
  fetchFn?: typeof fetch;
};

export async function getMe({
  baseUrl,
  token,
  fetchFn = fetch,
}: GetMeArgs): Promise<Usuario> {
  authLog("api", "GET /me start", {
    baseUrl,
    token: describeToken(token),
  });
  let response: Response;
  try {
    response = await fetchFn(`${baseUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    authLog("api", "GET /me network failed", { baseUrl });
    throw new AuthApiError({
      status: 0,
      code: "OFFLINE",
      userMessage: "Sem conexão. Mostrando o que estava salvo.",
    });
  }

  const body = await parseJsonSafe(response);
  authLog("api", "GET /me response", {
    status: response.status,
    code: readErrorCode(body) ?? "none",
  });
  if (!response.ok) {
    throw new AuthApiError({
      status: response.status,
      code: readErrorCode(body) ?? "SERVER_ERROR",
      userMessage:
        response.status === 401
          ? "Sessão inválida. Entre de novo."
          : authFailureMessage(response.status, readErrorCode(body)),
    });
  }

  // RF-02: token sem papel válido equivale a 401 — pede login de novo.
  const parsed = UsuarioSchema.safeParse(body);
  if (!parsed.success) {
    authLog("api", "GET /me invalid body, treating as 401", {
      issues: parsed.error.issues.length,
    });
    throw new AuthApiError({
      status: 401,
      code: "UNAUTHORIZED",
      userMessage: "Sessão inválida. Entre de novo.",
    });
  }
  authLog("api", "GET /me success", {
    email: parsed.data.email,
    papel: parsed.data.papel,
  });
  return parsed.data;
}
