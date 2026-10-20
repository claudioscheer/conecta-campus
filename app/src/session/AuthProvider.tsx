import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { getApiBaseUrl, getGoogleIosClientId, getGoogleWebClientId } from "@/config";
import { authLog, describeToken } from "@/lib/logger";
import {
  AuthApiError,
  UsuarioSchema,
  getMe,
  postAuth,
  type Usuario,
} from "@/repositories/authRepository";

export type Session = {
  token: string;
  usuario: Usuario;
};

export type MeStatus = "idle" | "validating" | "valid" | "invalid" | "offline";

type AuthContextValue = {
  session: Session | null;
  isReady: boolean;
  isSignedIn: boolean;
  isSigningIn: boolean;
  meStatus: MeStatus;
  isOffline: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  retryMe: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "conecta.session.token";
const USUARIO_KEY = "conecta.session.usuario";

let googleConfigured = false;

function ensureGoogleConfigured(): void {
  if (googleConfigured) {
    return;
  }
  const webClientId = getGoogleWebClientId();
  if (webClientId.length === 0) {
    authLog("google", "configure skipped, missing webClientId");
    throw new AuthApiError({
      status: 0,
      code: "NOT_CONFIGURED",
      userMessage: "Login Google não configurado. Fale com o suporte.",
    });
  }
  GoogleSignin.configure({
    webClientId,
    iosClientId: getGoogleIosClientId(),
    offlineAccess: false,
  });
  googleConfigured = true;
  authLog("google", "configure done");
}

function isOfflineError(error: unknown): boolean {
  return error instanceof AuthApiError && error.code === "OFFLINE";
}

async function clearStoredSession(): Promise<void> {
  if (Platform.OS !== "web") {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      // Melhor esforço.
    }
    try {
      await SecureStore.deleteItemAsync(USUARIO_KEY);
    } catch {
      // Melhor esforço.
    }
  }
  try {
    await GoogleSignin.signOut();
  } catch {
    // Melhor esforço.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [meStatus, setMeStatus] = useState<MeStatus>("idle");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function restore(): Promise<void> {
      authLog("boot", "restore start", { platform: Platform.OS });
      try {
        if (Platform.OS === "web") {
          authLog("boot", "restore skipped on web, no SecureStore");
          return;
        }
        const available = await SecureStore.isAvailableAsync();
        authLog("boot", "SecureStore checked", { available });
        if (!available) {
          return;
        }
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const rawUsuario = await SecureStore.getItemAsync(USUARIO_KEY);
        authLog("boot", "SecureStore read", {
          hasToken: token !== null,
          hasUsuario: rawUsuario !== null,
        });
        if (cancelled || token === null || rawUsuario === null) {
          return;
        }
        let parsedUsuario: unknown = null;
        try {
          parsedUsuario = JSON.parse(rawUsuario) as unknown;
        } catch {
          parsedUsuario = null;
        }
        const usuario = UsuarioSchema.safeParse(parsedUsuario);
        authLog("boot", "cached usuario validated", {
          valid: usuario.success,
        });
        if (usuario.success) {
          setSession({ token, usuario: usuario.data });
          authLog("boot", "session restored", {
            token: describeToken(token),
            email: usuario.data.email,
          });
        } else {
          authLog("boot", "cached usuario corrupt, clearing");
          await clearStoredSession();
        }
      } catch {
        authLog("boot", "restore failed with exception");
        // Boot nunca quebra por falha de leitura local.
      } finally {
        if (!cancelled) {
          setIsReady(true);
          authLog("boot", "ready");
        }
      }
    }
    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const validateMe = useCallback(async (token: string): Promise<void> => {
    setMeStatus("validating");
    authLog("session", "validateMe start", { token: describeToken(token) });
    const attempt = (): Promise<Usuario> =>
      getMe({ baseUrl: getApiBaseUrl(), token });
    const first = await attempt().then(
      (usuario) => ({ ok: true as const, usuario }),
      (error: unknown) => ({ ok: false as const, error }),
    );
    if (first.ok) {
      setSession({ token, usuario: first.usuario });
      setMeStatus("valid");
      authLog("session", "validateMe valid on attempt 1", {
        email: first.usuario.email,
        papel: first.usuario.papel,
      });
      if (Platform.OS !== "web") {
        try {
          await SecureStore.setItemAsync(
            USUARIO_KEY,
            JSON.stringify(first.usuario),
          );
        } catch {
          // Cache local é melhor esforço.
        }
      }
      return;
    }
    if (isOfflineError(first.error)) {
      authLog("session", "validateMe offline on attempt 1, keeping session");
      setMeStatus("offline");
      return;
    }
    // SPEC §3: 401 pede uma renovação automática antes de derrubar a sessão.
    if (first.error instanceof AuthApiError && first.error.status === 401) {
      authLog("session", "validateMe 401 on attempt 1, retrying once");
      const second = await attempt().then(
        (usuario) => ({ ok: true as const, usuario }),
        (error: unknown) => ({ ok: false as const, error }),
      );
      if (second.ok) {
        setSession({ token, usuario: second.usuario });
        setMeStatus("valid");
        authLog("session", "validateMe valid on attempt 2", {
          email: second.usuario.email,
          papel: second.usuario.papel,
        });
        if (Platform.OS !== "web") {
          try {
            await SecureStore.setItemAsync(
              USUARIO_KEY,
              JSON.stringify(second.usuario),
            );
          } catch {
            // Cache local é melhor esforço.
          }
        }
        return;
      }
      if (isOfflineError(second.error)) {
        authLog("session", "validateMe offline on attempt 2, keeping session");
        setMeStatus("offline");
        return;
      }
    } else {
      authLog("session", "validateMe failed without retry", {
        status: first.error instanceof AuthApiError ? first.error.status : -1,
        code: first.error instanceof AuthApiError ? first.error.code : "unknown",
      });
    }
    authLog("session", "validateMe invalid, clearing session");
    setMeStatus("invalid");
    await clearStoredSession();
    setSession(null);
  }, []);

  useEffect(() => {
    if (session === null) {
      setMeStatus("idle");
      return;
    }
    // Otimista: a home já renderizou. Validar /me em segundo plano.
    void validateMe(session.token);
  }, [session?.token, validateMe]);

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    setIsSigningIn(true);
    setAuthError(null);
    authLog("session", "signIn start");
    try {
      ensureGoogleConfigured();
      if (Platform.OS === "android") {
        authLog("google", "checking Play Services");
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
        authLog("google", "Play Services ok");
      }
      authLog("google", "signIn prompt opened");
      const response = await GoogleSignin.signIn();
      if (isCancelledResponse(response)) {
        authLog("google", "signIn cancelled by user");
        return;
      }
      if (!isSuccessResponse(response) || response.data.idToken === null) {
        authLog("google", "signIn success but idToken missing");
        throw new AuthApiError({
          status: 0,
          code: "SERVER_ERROR",
          userMessage: "Não foi possível validar sua conta Google. Tente de novo.",
        });
      }
      authLog("google", "signIn success", {
        idTokenLen: response.data.idToken.length,
        email: response.data.user.email,
      });
      const result = await postAuth({
        baseUrl: getApiBaseUrl(),
        idToken: response.data.idToken,
      });
      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync(TOKEN_KEY, result.token);
        await SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(result.usuario));
        authLog("store", "session persisted", {
          email: result.usuario.email,
        });
      } else {
        authLog("store", "persist skipped on web");
      }
      setSession(result);
      setMeStatus("valid");
      authLog("session", "signIn done", {
        email: result.usuario.email,
        papel: result.usuario.papel,
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: unknown }).code === statusCodes.SIGN_IN_CANCELLED
      ) {
        authLog("google", "signIn threw SIGN_IN_CANCELLED");
        return;
      }
      if (error instanceof AuthApiError) {
        authLog("session", "signIn failed", {
          status: error.status,
          code: error.code,
        });
        // Servidor recusou (401/403/inválido): solta a conta Google em cache
        // para o próximo toque mostrar o seletor de contas de novo.
        if (error.code !== "OFFLINE" && error.code !== "NOT_CONFIGURED") {
          try {
            await GoogleSignin.signOut();
          } catch {
            // Melhor esforço.
          }
        }
        setAuthError(error.userMessage);
        return;
      }
      if (isErrorWithCode(error)) {
        authLog("google", "signIn threw native error", {
          code: String(error.code),
          message: error.message,
        });
        if (error.code === statusCodes.IN_PROGRESS) {
          setAuthError("Login já em andamento. Aguarde.");
          return;
        }
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          setAuthError("Google Play Services não disponível neste aparelho.");
          return;
        }
        // Qualquer outro código nativo (ex.: DEVELOPER_ERROR / ApiException 10
        // = SHA-1 ou clientId não conferem no Google Cloud): expõe o código.
        setAuthError(`Google não liberou o login (${error.code}). Tente de novo.`);
        return;
      }
      if (error instanceof Error) {
        authLog("google", "signIn threw error", {
          name: error.name,
          message: error.message,
        });
        setAuthError(`Google não liberou o login (${error.name}). Tente de novo.`);
        return;
      }
      authLog("google", "signIn threw unknown value", {
        kind: typeof error,
      });
      setAuthError("Algo deu errado. Tente de novo.");
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    authLog("session", "signOut start");
    setAuthError(null);
    if (Platform.OS !== "web") {
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } catch {
        // Melhor esforço.
      }
      try {
        await SecureStore.deleteItemAsync(USUARIO_KEY);
      } catch {
        // Melhor esforço.
      }
    }
    try {
      await GoogleSignin.signOut();
    } catch {
      // Melhor esforço.
    }
    setSession(null);
    setMeStatus("idle");
    authLog("session", "signOut done");
  }, []);

  const retryMe = useCallback(async (): Promise<void> => {
    if (session === null) {
      authLog("session", "retryMe skipped, no session");
      return;
    }
    authLog("session", "retryMe pressed");
    await validateMe(session.token);
  }, [session, validateMe]);

  const clearError = useCallback((): void => {
    setAuthError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isReady,
      isSignedIn: session !== null,
      isSigningIn,
      meStatus,
      isOffline: meStatus === "offline",
      authError,
      signInWithGoogle,
      signOut,
      retryMe,
      clearError,
    }),
    [
      session,
      isReady,
      isSigningIn,
      meStatus,
      authError,
      signInWithGoogle,
      signOut,
      retryMe,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (value === null) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return value;
}
