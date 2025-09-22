import { useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Alert } from "react-native";

// Pré-aquece o navegador para reduzir o tempo de carregamento da autenticação
WebBrowser.warmUpAsync();

export function useSSOAuth() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

        // Redirecionar para onboarding para verificar se precisa completar perfil
        router.replace("/onboarding");
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
    isLoading,
  };
}
