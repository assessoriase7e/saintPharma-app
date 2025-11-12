import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack, useRootNavigationState } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

export default function AuthLayout() {
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

  // Se estiver logado, redirecionar para home (index.tsx vai decidir o destino final)
  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
