/**
 * Mapeamento puro dos erros do Sign-In nativo para decisões de UI.
 * Sem imports nativos aqui: os códigos reais entram por parâmetro,
 * então este módulo é testável em Vitest/Node sem o módulo nativo.
 */

export type SignInStatusCodes = {
  cancelled: string;
  inProgress: string;
  playUnavailable: string;
};

export type NativeSignInOutcome =
  | { kind: "cancelled" }
  | { kind: "in-progress"; userMessage: string }
  | { kind: "no-play-services"; userMessage: string }
  | { kind: "native-error"; code: string; userMessage: string };

export function mapNativeSignInErrorCode(
  code: string,
  codes: SignInStatusCodes,
): NativeSignInOutcome {
  if (code === codes.cancelled) {
    return { kind: "cancelled" };
  }
  if (code === codes.inProgress) {
    return { kind: "in-progress", userMessage: "Login já em andamento. Aguarde." };
  }
  if (code === codes.playUnavailable) {
    return {
      kind: "no-play-services",
      userMessage: "Google Play Services não disponível neste aparelho.",
    };
  }
  return {
    kind: "native-error",
    code,
    userMessage: `Google não liberou o login (${code}). Tente de novo.`,
  };
}

/**
 * SPEC §3: 401 pede uma renovação automática antes de derrubar a sessão.
 * `attemptsMade` conta quantas tentativas de /me já falharam.
 */
export function shouldRetryMe(status: number, attemptsMade: number): boolean {
  return status === 401 && attemptsMade === 1;
}
