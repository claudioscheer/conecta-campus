type LogValue = string | number | boolean;

export function authLog(
  phase: "boot" | "google" | "api" | "store" | "session" | "ui",
  message: string,
  details?: Record<string, LogValue>,
): void {
  const stamp = new Date().toISOString();
  const extra =
    details === undefined
      ? ""
      : ` ${Object.entries(details)
          .map(([key, value]) => `${key}=${value}`)
          .join(" ")}`;
  console.log(`[${stamp}][auth:${phase}] ${message}${extra}`);
}

/** Never log a full token. Prefix + length is enough to correlate. */
export function describeToken(token: string): string {
  return `${token.slice(0, 8)}…(len=${token.length})`;
}
