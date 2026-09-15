import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória."),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID é obrigatório."),
  GOOGLE_ALLOWED_HOSTED_DOMAINS: z.string().default("setrem.com.br"),
  JWT_SECRET: z
    .string()
    .regex(
      /^[0-9a-f]{64}$/,
      "JWT_SECRET deve ser uma string hexadecimal de 64 caracteres (256 bits). Gere com: openssl rand -hex 32",
    ),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(rawEnv: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(rawEnv);
  if (!result.success) {
    console.error("ERRO FATAL: Variáveis de ambiente inválidas ou ausentes:");
    for (const issue of result.error.issues) {
      console.error(` - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }
  return result.data;
}

export const env = validateEnv(process.env);
