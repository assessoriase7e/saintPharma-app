import { LivesProvider, ThemeProvider } from "@/stores";
import "@/utils/suppressWarnings";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot, useRootNavigationState } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

function RootLayoutContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigationState = useRootNavigationState();

  // Aguardar o sistema de navegação estar pronto
  if (!navigationState?.key) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-2">
          Carregando aplicação...
        </Text>
      </View>
    );
  }

  // Aguardar Clerk carregar
  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-2">
          Verificando autenticação...
        </Text>
      </View>
    );
  }

  // Se não estiver logado e estiver tentando acessar rota raiz, redirecionar para login
  // Caso contrário, renderizar o Slot normalmente
  return <Slot />;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ClerkProvider tokenCache={tokenCache}>
        <LivesProvider>
          <RootLayoutContent />
        </LivesProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}
