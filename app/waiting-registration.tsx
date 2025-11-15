import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { userService } from "@/services/userService";

const VERIFICATION_DELAY = 2000; // 2 segundos antes de começar a verificar
const POLL_INTERVAL = 1000; // Verificar a cada 1 segundo
const MAX_ATTEMPTS = 15; // Máximo de 15 tentativas (15 segundos)

/**
 * Tela de espera de cadastro no banco de dados.
 * 
 * Esta tela aparece após o usuário se registrar no Clerk (via email ou SSO).
 * Aguarda o webhook criar o usuário no banco de dados antes de prosseguir.
 * 
 * Fluxo:
 * 1. Aguarda 2 segundos (dá tempo para o webhook processar)
 * 2. Verifica periodicamente se o usuário existe no banco (1s de intervalo)
 * 3. Se encontrar: redireciona para onboarding (que verifica se precisa completar perfil)
 * 4. Se não encontrar após 15 tentativas: faz logout e volta para sign-in
 */
export default function WaitingRegistrationScreen() {
  const { isLoaded, userId, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Aguardando criação do usuário...");

  useEffect(() => {
    if (!isLoaded || !userId || !user) {
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;
    let currentAttempt = 0;

    const verifyUserExists = async (): Promise<boolean> => {
      try {
        console.log(`🔍 [WaitingRegistration] Verificando usuário (tentativa ${currentAttempt + 1}/${MAX_ATTEMPTS})...`);
        
        // Usar checkUserExists que trata 404 como estado esperado, não como erro
        const exists = await userService.checkUserExists(userId);
        
        if (exists) {
          console.log("✅ [WaitingRegistration] Usuário encontrado no banco!");
          return true;
        } else {
          // 404 é esperado durante verificação - usuário ainda não foi criado pelo webhook
          console.log("⏳ [WaitingRegistration] Usuário ainda não encontrado no banco (aguardando webhook)...");
          return false;
        }
      } catch (error) {
        // Apenas erros inesperados chegam aqui (rede, servidor, etc)
        // Não são 404, então são erros reais que devem ser logados
        console.error("❌ [WaitingRegistration] Erro inesperado ao verificar usuário:", error);
        // Retornar false para continuar tentando (pode ser erro temporário de rede)
        return false;
      }
    };

    const startVerification = async () => {
      console.log("🔄 [WaitingRegistration] Iniciando verificação de cadastro...");
      setStatusMessage("Verificando cadastro no banco de dados...");

      // Aguardar 2 segundos antes de começar a verificar
      // Dá tempo para o webhook processar
      timeoutId = setTimeout(async () => {
        console.log("🔍 [WaitingRegistration] Iniciando verificações periódicas...");

        // Verificar periodicamente se o usuário existe
        intervalId = setInterval(async () => {
          currentAttempt++;
          setAttempts(currentAttempt);

          const exists = await verifyUserExists();

          if (exists) {
            // Usuário encontrado! Limpar interval e redirecionar
            clearInterval(intervalId);
            console.log("✅ [WaitingRegistration] Redirecionando para onboarding...");
            setStatusMessage("Usuário encontrado! Redirecionando...");
            
            // Pequeno delay para mostrar a mensagem
            setTimeout(() => {
              router.replace("/onboarding");
            }, 500);
            return;
          }

          // Se atingiu o máximo de tentativas e ainda não encontrou
          if (currentAttempt >= MAX_ATTEMPTS) {
            clearInterval(intervalId);
            console.error("❌ [WaitingRegistration] Usuário não encontrado após todas as tentativas");
            setStatusMessage("Erro ao criar usuário. Fazendo logout...");

            // Fazer logout e redirecionar para sign-in
            try {
              await signOut();
            } catch (error) {
              console.error("❌ [WaitingRegistration] Erro ao fazer logout:", error);
            }

            setTimeout(() => {
              router.replace("/sign-in");
            }, 1500);
          }
        }, POLL_INTERVAL);
      }, VERIFICATION_DELAY);
    };

    startVerification();

    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoaded, userId, user, router, signOut]);

  // Aguardar Clerk carregar
  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-6">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-text-secondary mt-4 text-center">
            Carregando...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Se não estiver logado, redirecionar para login
  if (!userId) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center px-6">
        {/* Loading Indicator */}
        <View className="mb-6">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-text-primary text-center mb-3">
          Finalizando cadastro
        </Text>

        {/* Status Message */}
        <Text className="text-text-secondary text-center text-base mb-6">
          {statusMessage}
        </Text>

        {/* Attempts Counter */}
        {attempts > 0 && attempts < MAX_ATTEMPTS && (
          <View className="bg-card border border-border rounded-lg px-4 py-3">
            <Text className="text-text-secondary text-sm text-center">
              Verificação {attempts} de {MAX_ATTEMPTS}
            </Text>
          </View>
        )}

        {/* Info Text */}
        {attempts === 0 && (
          <View className="mt-4">
            <Text className="text-text-secondary text-center text-sm">
              Isso pode levar alguns segundos...
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

