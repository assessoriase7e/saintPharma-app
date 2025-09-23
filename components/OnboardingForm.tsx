import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import { onboardingService } from "../services/onboarding";
import { OnboardingData } from "../types/onboarding";

export function OnboardingForm() {
  const { userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async () => {
    console.log("🔄 [OnboardingForm] handleSubmit chamado", {
      userId,
      user: user ? { id: user.id, name: user.fullName } : null,
      firstName,
      lastName,
      email,
    });

    if (!userId || !user) {
      console.log("❌ [OnboardingForm] Usuário não autenticado");
      Alert.alert("Erro", "Usuário não autenticado");
      return;
    }

    // Validações básicas
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      console.log("❌ [OnboardingForm] Campos obrigatórios não preenchidos", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });
      Alert.alert("Erro", "Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

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

      console.log("🔄 [OnboardingForm] Enviando dados de onboarding...");

      const result = await onboardingService.completeOnboarding(onboardingData);

      if (result.success) {
        console.log("✅ [OnboardingForm] Onboarding concluído com sucesso");

        // Redirecionar diretamente para a página inicial
        console.log(
          "🔄 [OnboardingForm] Redirecionando para página inicial..."
        );

        // Usar setTimeout para garantir que o estado seja atualizado antes do redirecionamento
        setTimeout(() => {
          router.replace("/");
        }, 100);
      } else {
        console.error("❌ [OnboardingForm] Erro no onboarding:", result.error);
        Alert.alert(
          "Erro",
          result.error || "Erro ao criar perfil. Tente novamente."
        );
      }
    } catch (error: any) {
      console.error("❌ [OnboardingForm] Erro inesperado:", error);
      Alert.alert("Erro", "Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
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
            {/* Header */}
            <View className="mb-6">
              <Text className="text-3xl font-bold text-text-primary text-center mb-2">
                Complete seu perfil
              </Text>
              <Text className="text-text-secondary text-center text-base">
                Preencha os dados abaixo para começar a usar o app
              </Text>
            </View>

            {/* Formulário */}
            <View className="space-y-6">
              {/* Dados Pessoais */}
              <View>
                <Text className="text-lg font-semibold text-text-primary mb-4">
                  Dados Pessoais
                </Text>

                <View className="space-y-4">
                  <View>
                    <Text className="text-text-primary font-medium mb-2">
                      Nome *
                    </Text>
                    <TextInput
                      className="bg-card border border-border rounded-lg px-4 py-3 text-text-primary"
                      placeholder="Digite seu nome"
                      placeholderTextColor="#9ca3af"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                    />
                  </View>

                  <View>
                    <Text className="text-text-primary font-medium mb-2">
                      Sobrenome *
                    </Text>
                    <TextInput
                      className="bg-card border border-border rounded-lg px-4 py-3 text-text-primary"
                      placeholder="Digite seu sobrenome"
                      placeholderTextColor="#9ca3af"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                    />
                  </View>

                  <View>
                    <Text className="text-text-primary font-medium mb-2">
                      Email *
                    </Text>
                    <TextInput
                      className="bg-card border border-border rounded-lg px-4 py-3 text-text-primary"
                      placeholder="Digite seu email"
                      placeholderTextColor="#9ca3af"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
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
                onPress={handleSubmit}
                disabled={loading}
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
