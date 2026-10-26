import { describe, expect, it } from "vitest";
import {
  mapNativeSignInErrorCode,
  shouldRetryMe,
  type SignInStatusCodes,
} from "./signInErrors";
import { authFailureMessage } from "@/repositories/authRepository";

const codes: SignInStatusCodes = {
  cancelled: "SIGN_IN_CANCELLED",
  inProgress: "IN_PROGRESS",
  playUnavailable: "PLAY_SERVICES_NOT_AVAILABLE",
};

describe("mapNativeSignInErrorCode", () => {
  it("trata cancelamento como silencioso", () => {
    expect(mapNativeSignInErrorCode(codes.cancelled, codes)).toEqual({
      kind: "cancelled",
    });
  });

  it("pede espera quando já há login em andamento", () => {
    const outcome = mapNativeSignInErrorCode(codes.inProgress, codes);
    expect(outcome.kind).toBe("in-progress");
    if (outcome.kind === "in-progress") {
      expect(outcome.userMessage).toContain("andamento");
    }
  });

  it("avisa quando o Play Services falta", () => {
    const outcome = mapNativeSignInErrorCode(codes.playUnavailable, codes);
    expect(outcome.kind).toBe("no-play-services");
    if (outcome.kind === "no-play-services") {
      expect(outcome.userMessage).toContain("Play Services");
    }
  });

  it("expõe o código em erro nativo desconhecido (ex.: DEVELOPER_ERROR)", () => {
    const outcome = mapNativeSignInErrorCode("DEVELOPER_ERROR", codes);
    expect(outcome.kind).toBe("native-error");
    if (outcome.kind === "native-error") {
      expect(outcome.code).toBe("DEVELOPER_ERROR");
      expect(outcome.userMessage).toContain("DEVELOPER_ERROR");
    }
  });
});

describe("shouldRetryMe", () => {
  it("renova uma vez no primeiro 401 (SPEC §3)", () => {
    expect(shouldRetryMe(401, 1)).toBe(true);
  });

  it("não renova no segundo 401", () => {
    expect(shouldRetryMe(401, 2)).toBe(false);
  });

  it("não renova em 403, offline (0) ou 500", () => {
    expect(shouldRetryMe(403, 1)).toBe(false);
    expect(shouldRetryMe(0, 1)).toBe(false);
    expect(shouldRetryMe(500, 1)).toBe(false);
  });
});

describe("authFailureMessage", () => {
  it("403 pede a conta da SETREM", () => {
    expect(authFailureMessage(403, "FORBIDDEN")).toBe(
      "Use a conta Google da SETREM.",
    );
  });

  it("401 pede nova tentativa", () => {
    expect(authFailureMessage(401, "UNAUTHORIZED")).toContain("Tente de novo");
  });

  it("status desconhecido cai no genérico", () => {
    expect(authFailureMessage(500, undefined)).toBe(
      "Algo deu errado. Tente de novo.",
    );
  });
});
