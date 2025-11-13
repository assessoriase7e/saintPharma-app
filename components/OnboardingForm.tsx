import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { onboardingService } from "@/services/onboarding";
import { OnboardingData } from "@/types/onboarding";
import { Logo } from "@/components/Logo";
import { getApiBaseUrl, getApiToken } from "@/utils/env";

export function OnboardingForm() {
  const { userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  }>({});

  // Refs para focar nos campos
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  console.log("🔄 [OnboardingForm] Renderizando formulário de onboarding", {
    userId,
    user: user ? { id: user.id, name: user.fullName } : null,
  });

  // Dados do usuário
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(
    user?.emailAddresses?.[0]?.emailAddress || ""
  );

  // Endereço e CPF removidos - não são mais necessários

  const showError = (message: string) => {
    setError(message);
    // Tentar mostrar Alert também (pode não funcionar na web)
    setTimeout(() => {
      try {
        Alert.alert("Erro", message);
      } catch (e) {
        // Alert pode não funcionar em alguns ambientes
        console.log("Alert não disponível, usando mensagem visual");
      }
    }, 100);
  };

  const clearErrors = () => {
    setError(null);
    setFieldErrors({});
  };

  const handleSubmit = async () => {
    console.log("🔄 [OnboardingForm] handleSubmit chamado", {
      userId,
      user: user ? { id: user.id, name: user.fullName } : null,
      firstName,
      lastName,
      email,
      loading,
    });

    // Limpar erros anteriores
    clearErrors();

    // Verificar se já está carregando (evitar múltiplos cliques)
    if (loading) {
      console.log("⚠️ [OnboardingForm] Já está processando, ignorando clique");
      return;
    }

    if (!userId || !user) {
      console.log("❌ [OnboardingForm] Usuário não autenticado");
      showError("Usuário não autenticado. Faça login novamente.");
      return;
    }

    // Validações básicas
    let hasError = false;
    const errors: typeof fieldErrors = {};

    if (!firstName.trim()) {
      console.log("❌ [OnboardingForm] Nome não preenchido");
      errors.firstName = "Preencha o campo Nome";
      hasError = true;
    }
    
    if (!lastName.trim()) {
      console.log("❌ [OnboardingForm] Sobrenome não preenchido");
      errors.lastName = "Preencha o campo Sobrenome";
      hasError = true;
    }
    
    if (!email.trim()) {
      console.log("❌ [OnboardingForm] Email não preenchido");
      errors.email = "Preencha o campo Email";
      hasError = true;
    } else {
      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        console.log("❌ [OnboardingForm] Email inválido");
        errors.email = "Digite um email válido";
        hasError = true;
      }
    }

    if (hasError) {
      setFieldErrors(errors);
      // Focar no primeiro campo com erro
      if (errors.firstName) {
        // Não há ref para firstName, então focar no próximo
      } else if (errors.lastName) {
        lastNameRef.current?.focus();
      } else if (errors.email) {
        emailRef.current?.focus();
      }
      
      const errorMessage = Object.values(errors)[0] || "Preencha todos os campos obrigatórios";
      showError(errorMessage);
      return;
    }

    // Verificar variáveis de ambiente antes de começar
    const apiUrl = getApiBaseUrl();
    const apiToken = getApiToken();
    
    if (!apiUrl || !apiToken) {
      console.error("❌ [OnboardingForm] Variáveis de ambiente não configuradas", {
        hasApiUrl: !!apiUrl,
        hasApiToken: !!apiToken,
      });
      const configError = "As configurações da API não foram encontradas. Verifique o arquivo .env com API_BASE_URL e API_TOKEN ou configure via EAS Secrets";
      showError(configError);
      return;
    }

    setLoading(true);
    console.log("🔄 [OnboardingForm] Iniciando processo de criação de perfil...");

    try {
      const onboardingData: OnboardingData = {
        user: {
          id: userId, // Usar o ID do Clerk como ID na nossa API
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          imgUrl: user.imageUrl || undefined,
        },
        // CPF e endereço removidos - não são mais necessários
      };

      console.log("🔄 [OnboardingForm] Enviando dados de onboarding...", {
        userId: onboardingData.user.id,
        firstName: onboardingData.user.firstName,
        lastName: onboardingData.user.lastName,
        email: onboardingData.user.email,
      });

      const result = await onboardingService.completeOnboarding(onboardingData);

      console.log("📥 [OnboardingForm] Resultado recebido:", result);

      if (result.success) {
        console.log("✅ [OnboardingForm] Onboarding concluído com sucesso");

        // Aguardar um pouco para garantir que a API processou
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verificar novamente o status antes de redirecionar
        console.log("🔍 [OnboardingForm] Verificando status do onboarding após criação...");
        try {
          const status = await onboardingService.checkOnboardingStatus(userId);
          console.log("📊 [OnboardingForm] Status verificado após criação:", {
            needsOnboarding: status.needsOnboarding,
            firstName: status.user?.firstName,
            lastName: status.user?.lastName,
          });

          if (!status.needsOnboarding) {
            console.log("✅ [OnboardingForm] Onboarding confirmado completo, redirecionando...");
            // Redirecionar para index.tsx que vai verificar e redirecionar corretamente
            router.replace("/");
          } else {
            console.warn("⚠️ [OnboardingForm] Onboarding ainda não completo segundo a verificação");
            // Mesmo assim, tentar redirecionar (pode ser cache da API)
            // O index.tsx vai verificar novamente e redirecionar para onboarding se necessário
            await new Promise(resolve => setTimeout(resolve, 500));
            router.replace("/");
          }
        } catch (verifyError: any) {
          console.error("❌ [OnboardingForm] Erro ao verificar status após criação:", verifyError);
          // Em caso de erro na verificação, redirecionar mesmo assim
          // O index.tsx vai verificar e redirecionar corretamente
          router.replace("/");
        }
      } else {
        console.error("❌ [OnboardingForm] Erro no onboarding:", result.error);
        const errorMessage = result.error || "Erro ao criar perfil. Tente novamente.";
        showError(errorMessage);
      }
    } catch (error: any) {
      console.error("❌ [OnboardingForm] Erro inesperado:", error);
      console.error("❌ [OnboardingForm] Stack trace:", error.stack);
      
      let errorMessage = "Erro inesperado. Tente novamente.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
      console.log("🔄 [OnboardingForm] handleSubmit finalizado, loading = false");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          <View className="px-6 py-4">
            {/* Logo */}
            <View className="mb-6 items-center">
              <Logo size={100} />
            </View>

            {/* Header */}
            <View className="mb-6">
              <Text className="text-3xl font-bold text-text-primary text-center mb-2">
                Complete seu perfil
              </Text>
              <Text className="text-text-secondary text-center text-base">
                Preencha os dados abaixo para começar a usar o app
              </Text>
            </View>

            {/* Mensagem de erro geral */}
            {error && (
              <View className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <Text className="text-red-600 dark:text-red-400 font-medium text-center">
                  {error}
                </Text>
              </View>
            )}

            {/* Formulário */}
            <View className="flex-col gap-6">
              {/* Dados Pessoais */}
              <View>
                <Text className="text-lg font-semibold text-text-primary mb-4">
                  Dados Pessoais
                </Text>

                <View className="flex-col gap-4">
                  <View>
                    <Text className="text-text-primary font-medium mb-2">
                      Nome *
                    </Text>
                    <TextInput
                      className={`bg-card border rounded-lg px-4 py-3 text-text-primary ${
                        fieldErrors.firstName
                          ? "border-red-500 dark:border-red-400"
                          : "border-border"
                      }`}
                      placeholder="Digite seu nome"
                      placeholderTextColor="#9ca3af"
                      value={firstName}
                      onChangeText={(text) => {
                        setFirstName(text);
                        if (fieldErrors.firstName) {
                          setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                          if (error && !fieldErrors.lastName && !fieldErrors.email) {
                            setError(null);
                          }
                        }
                      }}
                      autoCapitalize="words"
                    />
                    {fieldErrors.firstName && (
                      <Text className="text-red-500 dark:text-red-400 text-sm mt-1">
                        {fieldErrors.firstName}
                      </Text>
                    )}
                  </View>

                  <View>
                    <Text className="text-text-primary font-medium mb-2">
                      Sobrenome *
                    </Text>
                    <TextInput
                      ref={lastNameRef}
                      className={`bg-card border rounded-lg px-4 py-3 text-text-primary ${
                        fieldErrors.lastName
                          ? "border-red-500 dark:border-red-400"
                          : "border-border"
                      }`}
                      placeholder="Digite seu sobrenome"
                      placeholderTextColor="#9ca3af"
                      value={lastName}
                      onChangeText={(text) => {
                        setLastName(text);
                        if (fieldErrors.lastName) {
                          setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                          if (error && !fieldErrors.firstName && !fieldErrors.email) {
                            setError(null);
                          }
                        }
                      }}
                      autoCapitalize="words"
                    />
                    {fieldErrors.lastName && (
                      <Text className="text-red-500 dark:text-red-400 text-sm mt-1">
                        {fieldErrors.lastName}
                      </Text>
                    )}
                  </View>

                  <View>
                    <Text className="text-text-primary font-medium mb-2">
                      Email *
                    </Text>
                    <TextInput
                      ref={emailRef}
                      className={`bg-card border rounded-lg px-4 py-3 text-text-primary ${
                        fieldErrors.email
                          ? "border-red-500 dark:border-red-400"
                          : "border-border"
                      }`}
                      placeholder="Digite seu email"
                      placeholderTextColor="#9ca3af"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => ({ ...prev, email: undefined }));
                          if (error && !fieldErrors.firstName && !fieldErrors.lastName) {
                            setError(null);
                          }
                        }
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                    {fieldErrors.email && (
                      <Text className="text-red-500 dark:text-red-400 text-sm mt-1">
                        {fieldErrors.email}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Botão de Submit */}
            <View className="mt-8 mb-4">
              <TouchableOpacity
                className={`bg-primary rounded-lg py-4 ${
                  loading ? "opacity-50" : ""
                }`}
                onPress={() => {
                  console.log("🖱️ [OnboardingForm] Botão clicado!");
                  handleSubmit();
                }}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text className="text-white text-center font-semibold text-base">
                  {loading ? "Criando perfil..." : "Criar perfil"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
