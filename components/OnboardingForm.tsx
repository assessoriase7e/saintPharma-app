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

  // Dados do usuário
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(
    user?.emailAddresses?.[0]?.emailAddress || ""
  );

  // Dados do endereço
  const [addressName, setAddressName] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("Brasil");

  // CPF (opcional)
  const [cpf, setCpf] = useState("");

  const handleSubmit = async () => {
    if (!userId || !user) {
      Alert.alert("Erro", "Usuário não autenticado");
      return;
    }

    // Validações básicas
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios");
      return;
    }

    if (
      !addressName.trim() ||
      !street.trim() ||
      !number.trim() ||
      !neighborhood.trim() ||
      !city.trim() ||
      !state.trim() ||
      !zipCode.trim()
    ) {
      Alert.alert("Erro", "Preencha todos os campos de endereço");
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
        storeCustomer: cpf.trim() ? { cpf: cpf.trim() } : undefined,
        address: {
          name: addressName.trim(),
          street: street.trim(),
          number: number.trim(),
          complement: complement.trim() || undefined,
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          country: country.trim(),
        },
      };

      console.log("🔄 [OnboardingForm] Enviando dados de onboarding...");

      const result = await onboardingService.completeOnboarding(onboardingData);

      if (result.success) {
        console.log("✅ [OnboardingForm] Onboarding concluído com sucesso");
        Alert.alert(
          "Sucesso!",
          "Seu perfil foi criado com sucesso. Bem-vindo!",
          [
            {
              text: "Continuar",
              onPress: () => router.replace("/"),
            },
          ]
        );
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
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1"
        >
          <View className="flex-1 px-6 py-4">
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

                  <View>
                    <Text className="text-text-primary font-medium mb-2">
                      CPF (opcional)
                    </Text>
                    <TextInput
                      className="bg-card border border-border rounded-lg px-4 py-3 text-text-primary"
                      placeholder="Digite seu CPF"
                      placeholderTextColor="#9ca3af"
                      value={cpf}
                      onChangeText={setCpf}
                      keyboardType="numeric"
                      maxLength={11}
                    />
                  </View>
                </View>
              </View>

              {/* Endereço */}
              <View>
                <Text className="text-lg font-semibold text-text-primary mb-4">
                  Endereço
                </Text>

                <View className="space-y-4">
                  <View>
                    <Text className="text-text-primary font-medium mb-2">
                      Nome do endereço *
                    </Text>
                    <TextInput
                      className="bg-card border border-border rounded-lg px-4 py-3 text-text-primary"
                      placeholder="Ex: Casa, Trabalho, etc."
                      placeholderTextColor="#9ca3af"
                      value={addressName}
                      onChangeText={setAddressName}
                    />
                  </View>

                  <View className="flex-row space-x-3">
                    <View className="flex-1">
                      <Text className="text-text-primary font-medium mb-2">
                        Rua *
                      </Text>
                      <TextInput
                        className="bg-card border border-border rounded-lg px-4 py-3 text-text-primary"
                        placeholder="Nome da rua"
                        placeholderTextColor="#9ca3af"
                        value={street}
                        onChangeText={setStreet}
                      />
                    </View>
                    <View className="w-20">
                      <Text className="text-text-primary font-medium mb-2">
                        Nº *
                      </Text>
                      <TextInput
                        className="bg-card border border-border rounded-lg px-4 py-3 text-text-primary"
                        placeholder="123"
                        placeholderTextColor="#9ca3af"
                        value={number}
                        onChangeText={setNumber}
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-text-primary font-medium mb-2">
                      Complemento
                    </Text>
                    <TextInput
                      className="bg-card border border-border rounded-lg px-4 py-3 text-text-primary"
                      placeholder="Apartamento, bloco, etc."
                      placeholderTextColor="#9ca3af"
                      value={complement}
                      onChangeText={setComplement}
                    />
                  </View>

                  <View>
                    <Text className="text-text-primary font-medium mb-2">
                      Bairro *
                    </Text>
                    <TextInput
                      className="bg-card border border-border rounded-lg px-4 py-3 text-text-primary"
                      placeholder="Nome do bairro"
                      placeholderTextColor="#9ca3af"
                      value={neighborhood}
                      onChangeText={setNeighborhood}
                    />
                  </View>

                  <View className="flex-row space-x-3">
                    <View className="flex-1">
                      <Text className="text-text-primary font-medium mb-2">
                        Cidade *
                      </Text>
                      <TextInput
                        className="bg-card border border-border rounded-lg px-4 py-3 text-text-primary"
                        placeholder="Nome da cidade"
                        placeholderTextColor="#9ca3af"
                        value={city}
                        onChangeText={setCity}
                      />
                    </View>
                    <View className="w-20">
                      <Text className="text-text-primary font-medium mb-2">
                        UF *
                      </Text>
                      <TextInput
                        className="bg-card border border-border rounded-lg px-4 py-3 text-text-primary"
                        placeholder="SP"
                        placeholderTextColor="#9ca3af"
                        value={state}
                        onChangeText={setState}
                        maxLength={2}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-text-primary font-medium mb-2">
                      CEP *
                    </Text>
                    <TextInput
                      className="bg-card border border-border rounded-lg px-4 py-3 text-text-primary"
                      placeholder="00000-000"
                      placeholderTextColor="#9ca3af"
                      value={zipCode}
                      onChangeText={setZipCode}
                      keyboardType="numeric"
                      maxLength={9}
                    />
                  </View>

                  <View>
                    <Text className="text-text-primary font-medium mb-2">
                      País *
                    </Text>
                    <TextInput
                      className="bg-card border border-border rounded-lg px-4 py-3 text-text-primary"
                      placeholder="Brasil"
                      placeholderTextColor="#9ca3af"
                      value={country}
                      onChangeText={setCountry}
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
