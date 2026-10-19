import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "@/session/AuthProvider";
import { authLog } from "@/lib/logger";

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isReady, isSignedIn } = useAuth();

  useEffect(() => {
    if (isReady) {
      authLog("boot", "hiding splash, routing", { signedIn: isSignedIn });
      void SplashScreen.hideAsync();
    }
  }, [isReady, isSignedIn]);

  if (!isReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Screen name="login" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
