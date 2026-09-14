import { describe, expect, it, afterEach } from "bun:test";
import { eq } from "drizzle-orm";
import { handleRequest } from "../src/routes";
import { setGoogleTokenVerifier, resetGoogleTokenVerifier } from "../src/lib/google-auth";
import { db } from "../db";
import { usuarios } from "../db/schema";

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

interface AuthResponseBody {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    papel: string;
    curso?: string;
    semestre?: string;
  };
}

describe("RF-01 · Autenticação (POST /v1/auth)", () => {
  afterEach(() => {
    resetGoogleTokenVerifier();
  });

  it("deve retornar 400 VALIDATION_ERROR se o idToken não for informado", async () => {
    const req = new Request("http://localhost:3000/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await handleRequest(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponseBody;
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.fields).toBeDefined();
    expect(body.error.fields?.idToken).toBe("obrigatório");
  });

  it("deve retornar 400 VALIDATION_ERROR se o body não for um JSON válido", async () => {
    const req = new Request("http://localhost:3000/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid-json",
    });
    const res = await handleRequest(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponseBody;
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("deve retornar 401 UNAUTHORIZED se o idToken for inválido ou verificação do Google falhar", async () => {
    setGoogleTokenVerifier(async () => {
      throw new Error("Token signature verification failed");
    });

    const req = new Request("http://localhost:3000/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "token-invalido-google" }),
    });
    const res = await handleRequest(req);
    expect(res.status).toBe(401);
    const body = (await res.json()) as ErrorResponseBody;
    expect(body.error.code).toBe("UNAUTHORIZED");
    expect(body.error.message).toBe("Token do Google inválido ou expirado.");
  });

  it("deve retornar 403 FORBIDDEN se o e-mail não pertencer ao domínio SETREM", async () => {
    setGoogleTokenVerifier(async () => ({
      sub: "google-sub-external",
      email: "aluno.externo@gmail.com",
      name: "Aluno Externo",
    }));

    const req = new Request("http://localhost:3000/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "token-de-fora" }),
    });
    const res = await handleRequest(req);
    expect(res.status).toBe(403);
    const body = (await res.json()) as ErrorResponseBody;
    expect(body.error.code).toBe("FORBIDDEN");
    expect(body.error.message).toBe("Use a conta Google da SETREM.");
  });

  it("deve retornar 200 OK com token e usuario para conta SETREM válida", async () => {
    const testSub = `google-sub-setrem-${Date.now()}`;
    const testEmail = `novo.estudante.${Date.now()}@setrem.com.br`;

    setGoogleTokenVerifier(async () => ({
      sub: testSub,
      email: testEmail,
      name: "Estudante SETREM",
      hd: "setrem.com.br",
    }));

    const req = new Request("http://localhost:3000/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "token-valido-setrem" }),
    });
    const res = await handleRequest(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as AuthResponseBody;

    expect(body.token).toBeDefined();
    expect(typeof body.token).toBe("string");
    expect(body.usuario).toBeDefined();
    expect(body.usuario.id).toBeDefined();
    expect(body.usuario.email).toBe(testEmail);
    expect(body.usuario.nome).toBe("Estudante SETREM");
    expect(body.usuario.papel).toBe("aluno");

    // Limpa banco após teste
    await db.delete(usuarios).where(eq(usuarios.googleSub, testSub));
  });

  it("deve preservar o papel existente do banco no login (upsert por google_sub)", async () => {
    const testSub = `google-sub-prof-${Date.now()}`;
    const testEmail = `professor.${Date.now()}@setrem.com.br`;

    // Cria usuário previamente com papel 'professor'
    const [created] = await db
      .insert(usuarios)
      .values({
        id: crypto.randomUUID(),
        googleSub: testSub,
        nome: "Prof. Doutor",
        email: testEmail,
        papel: "professor",
      })
      .returning();

    setGoogleTokenVerifier(async () => ({
      sub: testSub,
      email: testEmail,
      name: "Prof. Doutor Nome Atualizado",
      hd: "setrem.com.br",
    }));

    const req = new Request("http://localhost:3000/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "token-prof-setrem" }),
    });
    const res = await handleRequest(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as AuthResponseBody;

    expect(body.usuario.id).toBe(created.id);
    expect(body.usuario.papel).toBe("professor");
    expect(body.usuario.nome).toBe("Prof. Doutor Nome Atualizado");

    // Limpa banco
    await db.delete(usuarios).where(eq(usuarios.id, created.id));
  });
});
