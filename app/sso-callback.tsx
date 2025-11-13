import { userService } from "@/services/userService";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";

// Completa qualquer sessão de autenticação pendente
// Apenas em plataformas nativas (iOS/Android), não na web
if (Platform.OS !== "web") {
  WebBrowser.maybeCompleteAuthSession();
}

export default function SSOCallbackScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log("🔄 [SSOCallback] Processando callback do SSO...");

        // O callback é processado automaticamente pelo Clerk
        // Aguardar um pouco para garantir que a sessão foi estabelecida
        // e que o objeto user está disponível
        await new Promise((resolve) => setTimeout(resolve, 1500));

        console.log(
          "✅ [SSOCallback] Callback processado, verificando autenticação..."
        );

        if (isSignedIn && user) {
          console.log(
            "🚀 [SSOCallback] Usuário autenticado, garantindo existência no banco de dados"
          );

          try {
            // Garantir que o usuário existe no banco de dados
            await userService.ensureUserExists(
              user.id,
              user.primaryEmailAddress?.emailAddress || "",
              user.firstName || undefined,
              user.lastName || undefined,
              user.imageUrl || undefined
            );
            console.log("✅ [SSOCallback] Usuário garantido no banco de dados");
          } catch (error) {
            console.error(
              "❌ [SSOCallback] Erro ao criar usuário no banco:",
              error
            );
            // Não falha o fluxo se não conseguir criar no banco
          }

          // Redirecionar para onboarding - o index.tsx vai verificar se precisa completar
          // e redirecionar corretamente (onboarding ou home)
          router.replace("/onboarding");
        } else {
          console.log(
            "⚠️ [SSOCallback] Usuário não autenticado, redirecionando para login"
          );
          router.replace("/sign-in" as any);
        }
      } catch (err: any) {
        console.error("❌ [SSOCallback] Erro ao processar callback:", err);
        setError(err.message || "Erro ao processar autenticação");

        // Redirecionar para login em caso de erro após um breve delay
        setTimeout(() => {
          router.replace("/sign-in" as any);
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    if (isLoaded) {
      processCallback();
    }
  }, [isLoaded, isSignedIn, user, router]);

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
