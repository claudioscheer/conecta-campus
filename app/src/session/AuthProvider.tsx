import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  GoogleSignin,
  isCancelledResponse,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { getApiBaseUrl, getGoogleIosClientId, getGoogleWebClientId } from "@/config";
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
      try {
        if (Platform.OS === "web") {
          return;
        }
        const available = await SecureStore.isAvailableAsync();
        if (!available) {
          return;
        }
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const rawUsuario = await SecureStore.getItemAsync(USUARIO_KEY);
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
        if (usuario.success) {
          setSession({ token, usuario: usuario.data });
        } else {
          await clearStoredSession();
        }
      } catch {
        // Boot nunca quebra por falha de leitura local.
      } finally {
        if (!cancelled) {
          setIsReady(true);
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
    const attempt = (): Promise<Usuario> =>
      getMe({ baseUrl: getApiBaseUrl(), token });
    const first = await attempt().then(
      (usuario) => ({ ok: true as const, usuario }),
      (error: unknown) => ({ ok: false as const, error }),
    );
    if (first.ok) {
      setSession({ token, usuario: first.usuario });
      setMeStatus("valid");
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
      setMeStatus("offline");
      return;
    }
    // SPEC §3: 401 pede uma renovação automática antes de derrubar a sessão.
    if (first.error instanceof AuthApiError && first.error.status === 401) {
      const second = await attempt().then(
        (usuario) => ({ ok: true as const, usuario }),
        (error: unknown) => ({ ok: false as const, error }),
      );
      if (second.ok) {
        setSession({ token, usuario: second.usuario });
        setMeStatus("valid");
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
        setMeStatus("offline");
        return;
      }
    }
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
    try {
      ensureGoogleConfigured();
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }
      const response = await GoogleSignin.signIn();
      if (isCancelledResponse(response)) {
        return;
      }
      if (!isSuccessResponse(response) || response.data.idToken === null) {
        throw new AuthApiError({
          status: 0,
          code: "SERVER_ERROR",
          userMessage: "Não foi possível validar sua conta Google. Tente de novo.",
        });
      }
      const result = await postAuth({
        baseUrl: getApiBaseUrl(),
        idToken: response.data.idToken,
      });
      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync(TOKEN_KEY, result.token);
        await SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(result.usuario));
      }
      setSession(result);
      setMeStatus("valid");
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: unknown }).code === statusCodes.SIGN_IN_CANCELLED
      ) {
        return;
      }
      if (error instanceof AuthApiError) {
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
      setAuthError("Algo deu errado. Tente de novo.");
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
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
  }, []);

  const retryMe = useCallback(async (): Promise<void> => {
    if (session === null) {
      return;
    }
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
