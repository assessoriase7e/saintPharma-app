import { useSignUp, useSSO } from "@clerk/clerk-expo";
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

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Erro", err.errors?.[0]?.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
        Alert.alert("Erro", "Não foi possível verificar o código.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Erro", err.errors?.[0]?.message || "Erro na verificação");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignUp = async () => {
    setLoading(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy: "oauth_google" });
      
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace("/");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Erro", "Erro ao fazer login com Google");
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
        >
          <View className="flex-1 justify-center px-6">
            {!pendingVerification && (
              <>
                {/* Header */}
                <View className="mb-8">
                  <Text className="text-3xl font-bold text-text-primary text-center mb-2">
                    Criar conta
                  </Text>
                  <Text className="text-text-secondary text-center text-base">
                    Preencha os dados para começar
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
                      autoComplete="password-new"
                    />
                  </View>

                  <TouchableOpacity
                    className={`bg-primary rounded-lg py-4 mt-6 ${
                      loading ? "opacity-50" : ""
                    }`}
                    onPress={onSignUpPress}
                    disabled={loading || !emailAddress || !password}
                  >
                    <Text className="text-white text-center font-semibold text-base">
                      {loading ? "Criando conta..." : "Criar conta"}
                    </Text>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View className="flex-row items-center my-6">
                    <View className="flex-1 h-px bg-border" />
                    <Text className="px-4 text-text-secondary text-sm">ou</Text>
                    <View className="flex-1 h-px bg-border" />
                  </View>

                  {/* Google Sign Up Button */}
                  <TouchableOpacity
                    className={`bg-card border border-border rounded-lg py-4 flex-row items-center justify-center ${
                      loading ? "opacity-50" : ""
                    }`}
                    onPress={onGoogleSignUp}
                    disabled={loading}
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
                    Já tem uma conta?{" "}
                    <Link href="./sign-in" asChild>
                      <Text className="text-primary font-medium">
                        Faça login
                      </Text>
                    </Link>
                  </Text>
                </View>
              </>
            )}

            {pendingVerification && (
              <>
                {/* Verification Header */}
                <View className="mb-8">
                  <Text className="text-3xl font-bold text-text-primary text-center mb-2">
                    Verificar email
                  </Text>
                  <Text className="text-text-secondary text-center text-base">
                    Digite o código enviado para {emailAddress}
                  </Text>
                </View>

                {/* Verification Form */}
                <View className="space-y-4">
                  <View>
                    <Text className="text-text-primary font-medium mb-2">
                      Código de verificação
                    </Text>
                    <TextInput
                      className="bg-card border border-border rounded-lg px-4 py-3 text-text-primary text-center text-lg tracking-widest"
                      placeholder="000000"
                      placeholderTextColor="#9ca3af"
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>

                  <TouchableOpacity
                    className={`bg-primary rounded-lg py-4 mt-6 ${
                      loading ? "opacity-50" : ""
                    }`}
                    onPress={onPressVerify}
                    disabled={loading || !code}
                  >
                    <Text className="text-white text-center font-semibold text-base">
                      {loading ? "Verificando..." : "Verificar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
