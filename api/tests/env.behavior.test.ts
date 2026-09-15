import { describe, expect, it } from "bun:test";
import { envSchema } from "../src/env";

const VALID_JWT_SECRET = "ebb5f5ed10c5f9ada031341c2e37b40392459371fabb4569c8a369933cdebb98";

describe("Validação de Variáveis de Ambiente com Zod", () => {
  it("deve validar com sucesso variáveis completas e aplicar defaults", () => {
    const validConfig = {
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
      GOOGLE_CLIENT_ID: "client-id-123.apps.googleusercontent.com",
      JWT_SECRET: VALID_JWT_SECRET,
    };

    const result = envSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(3000);
      expect(result.data.GOOGLE_ALLOWED_HOSTED_DOMAINS).toBe("setrem.com.br");
      expect(result.data.DATABASE_URL).toBe(validConfig.DATABASE_URL);
      expect(result.data.GOOGLE_CLIENT_ID).toBe(validConfig.GOOGLE_CLIENT_ID);
      expect(result.data.JWT_SECRET).toBe(VALID_JWT_SECRET);
    }
  });

  it("deve falhar se DATABASE_URL estiver ausente ou vazia", () => {
    const result = envSchema.safeParse({
      DATABASE_URL: "",
      GOOGLE_CLIENT_ID: "client-id-123.apps.googleusercontent.com",
      JWT_SECRET: VALID_JWT_SECRET,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path[0] === "DATABASE_URL");
      expect(err).toBeDefined();
    }
  });

  it("deve falhar se JWT_SECRET estiver ausente", () => {
    const result = envSchema.safeParse({
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
      GOOGLE_CLIENT_ID: "client-id-123.apps.googleusercontent.com",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path[0] === "JWT_SECRET");
      expect(err).toBeDefined();
    }
  });

  it("deve falhar se JWT_SECRET tiver menos de 64 caracteres hex (256 bits)", () => {
    const result = envSchema.safeParse({
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
      GOOGLE_CLIENT_ID: "client-id-123.apps.googleusercontent.com",
      JWT_SECRET: "abc123", // muito curto
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path[0] === "JWT_SECRET");
      expect(err).toBeDefined();
      expect(err?.message).toContain("256 bits");
    }
  });

  it("deve falhar se JWT_SECRET não for uma string hexadecimal válida", () => {
    const result = envSchema.safeParse({
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
      GOOGLE_CLIENT_ID: "client-id-123.apps.googleusercontent.com",
      JWT_SECRET: "gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg", // 64 chars mas não hex
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path[0] === "JWT_SECRET");
      expect(err).toBeDefined();
    }
  });

  it("deve falhar se GOOGLE_CLIENT_ID estiver ausente ou vazio", () => {
    const result = envSchema.safeParse({
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
      JWT_SECRET: VALID_JWT_SECRET,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path[0] === "GOOGLE_CLIENT_ID");
      expect(err).toBeDefined();
    }
  });
});
