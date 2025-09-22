import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

// Completa qualquer sessão de autenticação pendente
WebBrowser.maybeCompleteAuthSession();

export default function SSOCallbackScreen() {
  const { handleRedirectCallback, isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log("🔄 [SSOCallback] Processando callback do SSO...");

        // Processar o callback do Clerk
        await handleRedirectCallback();

        console.log("✅ [SSOCallback] Callback processado com sucesso");

        // Aguardar um momento para garantir que a sessão foi estabelecida
        setTimeout(() => {
          if (isSignedIn) {
            console.log(
              "🚀 [SSOCallback] Usuário autenticado, redirecionando para onboarding"
            );
            // Redirecionar para onboarding para verificar se precisa completar perfil
            router.replace("/onboarding");
          } else {
            console.log(
              "⚠️ [SSOCallback] Usuário não autenticado, redirecionando para login"
            );
            router.replace("/(auth)/sign-in");
          }
        }, 1000);
      } catch (err: any) {
        console.error("❌ [SSOCallback] Erro ao processar callback:", err);
        setError(err.message || "Erro ao processar autenticação");

        // Redirecionar para login em caso de erro
        setTimeout(() => {
          router.replace("/(auth)/sign-in");
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    if (isLoaded) {
      processCallback();
    }
  }, [isLoaded, handleRedirectCallback, isSignedIn, router]);

  // Mostrar loading enquanto processa
  if (isProcessing || !isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-4 text-center">
          Processando autenticação...
        </Text>
      </View>
    );
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-4">
        <Text className="text-text-primary text-xl font-bold mb-2 text-center">
          Erro na Autenticação
        </Text>
        <Text className="text-text-secondary text-center mb-4">{error}</Text>
        <Text className="text-text-secondary text-center text-sm">
          Redirecionando para login...
        </Text>
      </View>
    );
  }

  // Fallback (não deveria chegar aqui)
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <Text className="text-text-secondary text-center">Redirecionando...</Text>
    </View>
  );
}
