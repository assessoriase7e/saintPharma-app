import { Redirect, useRootNavigationState } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

/**
 * Rota raiz que redireciona para a listagem de cursos.
 * A listagem de cursos é pública e permite que usuários não logados vejam os cursos disponíveis.
 */
export default function Index() {
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

  // Redirecionar para a listagem de cursos (página pública com tabs)
  return <Redirect href="/(tabs)" />;
}

