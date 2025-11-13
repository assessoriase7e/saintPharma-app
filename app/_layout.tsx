import { LivesProvider, ThemeProvider } from "@/stores";
import "@/utils/suppressWarnings";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { getClerkPublishableKey } from "@/utils/env";
import { Logo } from "@/components/Logo";

// Manter a splash screen visível até que o app esteja pronto
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigationState = useRootNavigationState();
  const splashHidden = useRef(false);

  // Esconder a splash screen quando tudo estiver pronto
  useEffect(() => {
    if (navigationState?.key && isLoaded && !splashHidden.current) {
      splashHidden.current = true;
      SplashScreen.hideAsync().catch(() => {
        // Ignorar erro se splash screen já foi escondida
      });
    }
  }, [navigationState?.key, isLoaded]);

  // Mostrar splash customizada enquanto carrega
  if (!navigationState?.key || !isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-slate-900">
        <Logo size={150} />
        <View className="mt-8">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </View>
    );
  }

  // Se não estiver logado e estiver tentando acessar rota raiz, redirecionar para login
  // Caso contrário, renderizar o Slot normalmente
  return <Slot />;
}

export default function RootLayout() {
  const publishableKey = getClerkPublishableKey();

  if (!publishableKey) {
    console.error(
      "❌ [RootLayout] CLERK_PUBLISHABLE_KEY não está configurada!\n" +
        "Configure a variável de ambiente CLERK_PUBLISHABLE_KEY no arquivo .env ou via EAS Secrets"
    );
  }

  return (
    <ThemeProvider>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <LivesProvider>
          <RootLayoutContent />
        </LivesProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}
