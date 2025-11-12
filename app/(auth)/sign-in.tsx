import { useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
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
import { useSSOAuth } from "@/hooks/useSSOAuth";

// Função para traduzir mensagens de erro do Clerk
function translateClerkError(error: any): string {
  const errorMessage = error.errors?.[0]?.message || error.message || "";

  if (errorMessage.includes("form_identifier_not_found")) {
    return "Email não encontrado. Verifique o email ou crie uma conta.";
  }
  if (errorMessage.includes("form_password_incorrect")) {
    return "Senha incorreta. Tente novamente.";
  }
  if (errorMessage.includes("too_many_requests")) {
    return "Muitas tentativas de login. Aguarde alguns minutos.";
  }
  if (errorMessage.includes("session_exists")) {
    return "Você já está logado.";
  }

  return errorMessage || "Erro inesperado ao fazer login. Tente novamente.";
}

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { handleGoogleSSO, isLoading: ssoLoading } = useSSOAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        // Redirecionar para index.tsx que vai verificar autenticação e onboarding
        // e redirecionar para o destino correto (home ou onboarding)
        router.replace("/");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Erro", "Não foi possível fazer login. Tente novamente.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Erro", translateClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    await handleGoogleSSO();
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
        >
          <View className="flex-1 justify-center px-6">
            {/* Header */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-text-primary text-center mb-2">
                Bem-vindo de volta
              </Text>
              <Text className="text-text-secondary text-center text-base">
                Entre na sua conta para continuar
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
              <View>
                <Text className="text-text-primary font-medium mb-2">
                  Email
                </Text>
                <TextInput
                  className="bg-card border border-border rounded-lg px-4 py-3 text-text-primary"
                  placeholder="Digite seu email"
                  placeholderTextColor="#9ca3af"
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View>
                <Text className="text-text-primary font-medium mb-2">
                  Senha
                </Text>
                <TextInput
                  className="bg-card border border-border rounded-lg px-4 py-3 text-text-primary"
                  placeholder="Digite sua senha"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>

              <TouchableOpacity
                className={`bg-primary rounded-lg py-4 mt-6 ${
                  loading ? "opacity-50" : ""
                }`}
                onPress={onSignInPress}
                disabled={loading || !emailAddress || !password}
              >
                <Text className="text-white text-center font-semibold text-base">
                  {loading ? "Entrando..." : "Entrar"}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-border" />
                <Text className="px-4 text-text-secondary text-sm">ou</Text>
                <View className="flex-1 h-px bg-border" />
              </View>

              {/* Google Sign In Button */}
              <TouchableOpacity
                className={`bg-card border border-border rounded-lg py-4 flex-row items-center justify-center ${
                  loading || ssoLoading ? "opacity-50" : ""
                }`}
                onPress={onGoogleSignIn}
                disabled={loading || ssoLoading}
              >
                <Ionicons
                  name="logo-google"
                  size={20}
                  color="#4285F4"
                  style={{ marginRight: 12 }}
                />
                <Text className="text-text-primary font-semibold text-base">
                  Continuar com Google
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="mt-8">
              <Text className="text-text-secondary text-center">
                Não tem uma conta?{" "}
                <Link href="./sign-up" asChild>
                  <Text className="text-primary font-medium">Cadastre-se</Text>
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
