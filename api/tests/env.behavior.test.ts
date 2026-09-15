import { describe, expect, it } from "bun:test";
import { envSchema } from "../src/env";

describe("Validação de Variáveis de Ambiente com Zod", () => {
  it("deve validar com sucesso variáveis completas e aplicar defaults", () => {
    const validConfig = {
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
      GOOGLE_CLIENT_ID: "client-id-123.apps.googleusercontent.com",
      JWT_SECRET: "secret-key-123",
    };

    const result = envSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(3000);
      expect(result.data.GOOGLE_ALLOWED_HOSTED_DOMAINS).toBe("setrem.com.br");
      expect(result.data.DATABASE_URL).toBe(validConfig.DATABASE_URL);
      expect(result.data.GOOGLE_CLIENT_ID).toBe(validConfig.GOOGLE_CLIENT_ID);
      expect(result.data.JWT_SECRET).toBe(validConfig.JWT_SECRET);
    }
  });

  it("deve falhar se DATABASE_URL estiver ausente ou vazia", () => {
    const invalidConfig = {
      DATABASE_URL: "",
      GOOGLE_CLIENT_ID: "client-id-123.apps.googleusercontent.com",
      JWT_SECRET: "secret-key-123",
    };

    const result = envSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
    if (!result.success) {
      const dbError = result.error.issues.find((issue) => issue.path[0] === "DATABASE_URL");
      expect(dbError).toBeDefined();
    }
  });

  it("deve falhar se JWT_SECRET estiver ausente ou vazio", () => {
    const invalidConfig = {
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
      GOOGLE_CLIENT_ID: "client-id-123.apps.googleusercontent.com",
    };

    const result = envSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
    if (!result.success) {
      const jwtError = result.error.issues.find((issue) => issue.path[0] === "JWT_SECRET");
      expect(jwtError).toBeDefined();
    }
  });

  it("deve falhar se GOOGLE_CLIENT_ID estiver ausente ou vazio", () => {
    const invalidConfig = {
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
      JWT_SECRET: "secret-key-123",
    };

    const result = envSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
    if (!result.success) {
      const googleError = result.error.issues.find((issue) => issue.path[0] === "GOOGLE_CLIENT_ID");
      expect(googleError).toBeDefined();
    }
  });
});
