import Constants from "expo-constants";

type AppExtra = {
  apiBaseUrl?: string;
  googleWebClientId?: string;
  googleIosClientId?: string;
  googleAndroidClientId?: string;
};

function readExtra(): AppExtra {
  const expoConfig = Constants.expoConfig;
  const extra = expoConfig?.extra;
  if (extra === null || extra === undefined || typeof extra !== "object") {
    return {};
  }
  const record = extra as Record<string, unknown>;
  const pick = (key: string): string | undefined => {
    const value = record[key];
    return typeof value === "string" && value.length > 0 ? value : undefined;
  };
  return {
    apiBaseUrl: pick("apiBaseUrl"),
    googleWebClientId: pick("googleWebClientId"),
    googleIosClientId: pick("googleIosClientId"),
    googleAndroidClientId: pick("googleAndroidClientId"),
  };
}

export function getApiBaseUrl(): string {
  return readExtra().apiBaseUrl ?? "http://localhost:3000/v1";
}

export function getGoogleWebClientId(): string {
  return readExtra().googleWebClientId ?? "";
}

export function getGoogleIosClientId(): string | undefined {
  return readExtra().googleIosClientId;
}

export function getGoogleAndroidClientId(): string | undefined {
  return readExtra().googleAndroidClientId;
}
