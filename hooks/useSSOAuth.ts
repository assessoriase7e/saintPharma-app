import { userService } from "@/services/userService";
import { useSSO, useUser } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Alert, Platform } from "react-native";

// Pré-aquece o navegador para reduzir o tempo de carregamento da autenticação
// Apenas em plataformas nativas (iOS/Android), não na web
if (Platform.OS !== "web") {
  WebBrowser.warmUpAsync().catch((error) => {
    console.warn("WebBrowser.warmUpAsync falhou:", error);
  });
}

export function useSSOAuth() {
  const { startSSOFlow } = useSSO();
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Cria ou atualiza o usuário no banco de dados após login bem-sucedido
   */
  const ensureUserInDatabase = async () => {
    if (!user) {
      console.warn("⚠️ [useSSOAuth] Nenhum usuário autenticado encontrado");
      return;
    }

    try {
      console.log(
        "👤 [useSSOAuth] Garantindo que usuário existe no banco de dados:",
        user.id
      );

      const userData = await userService.ensureUserExists(
        user.id,
        user.primaryEmailAddress?.emailAddress || "",
        user.firstName || undefined,
        user.lastName || undefined,
        user.imageUrl || undefined
      );

      console.log(
        "✅ [useSSOAuth] Usuário garantido no banco de dados:",
        userData
      );
      return userData;
    } catch (error) {
      console.error(
        "❌ [useSSOAuth] Erro ao garantir usuário no banco:",
        error
      );
      // Não falha o login se não conseguir criar no banco
      // O usuário ainda pode usar o app
    }
  };

  const handleSSOLogin = async (
    strategy: "oauth_google" | "oauth_github" | "enterprise_sso",
    identifier?: string
  ) => {
    setIsLoading(true);

    try {
      console.log(`🔄 [useSSOAuth] Iniciando SSO com estratégia: ${strategy}`);

      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: "saintpharma-app", // Esquema personalizado do app
        path: "sso-callback", // Rota de callback
      });

      console.log("🔗 [useSSOAuth] URL de redirecionamento:", redirectUrl);

      const params: any = {
        strategy,
        redirectUrl,
      };

      // Adicionar identificador se fornecido (para SSO empresarial)
      if (identifier) {
        params.identifier = identifier;
      }

      const { createdSessionId, setActive } = await startSSOFlow(params);

      if (createdSessionId) {
        console.log("✅ [useSSOAuth] SSO bem-sucedido, estabelecendo sessão");
        await setActive!({ session: createdSessionId });

        // O callback em sso-callback.tsx vai processar a criação do usuário no banco
        // Não precisa fazer aqui para evitar duplicação
        console.log(
          "🔄 [useSSOAuth] Sessão estabelecida, aguardando processamento do callback..."
        );
      } else {
        console.log("⚠️ [useSSOAuth] SSO requer ação adicional (ex: MFA)");
        // O usuário pode precisar completar MFA ou outras verificações
        // O Clerk gerenciará isso automaticamente
      }
    } catch (err: any) {
      console.error("❌ [useSSOAuth] Erro no SSO:", err);

      // Traduzir erros comuns
      let errorMessage = "Erro ao fazer login. Tente novamente.";

      if (err.message?.includes("user_cancelled")) {
        errorMessage = "Login cancelado pelo usuário.";
      } else if (err.message?.includes("network")) {
        errorMessage = "Erro de conexão. Verifique sua internet.";
      } else if (err.message?.includes("invalid_request")) {
        errorMessage = "Erro na configuração do login. Tente novamente.";
      }

      Alert.alert("Erro no Login", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSSO = () => {
    return handleSSOLogin("oauth_google");
  };

  const handleGitHubSSO = () => {
    return handleSSOLogin("oauth_github");
  };

  const handleEnterpriseSSO = (email: string) => {
    return handleSSOLogin("enterprise_sso", email);
  };

  return {
    handleSSOLogin,
    handleGoogleSSO,
    handleGitHubSSO,
    handleEnterpriseSSO,
    ensureUserInDatabase,
    isLoading,
  };
}
