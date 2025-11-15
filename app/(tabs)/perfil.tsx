import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { 
  ActivityIndicator, 
  Alert, 
  Linking, 
  ScrollView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { userService } from "@/services";
import { UserInfoResponse } from "@/types/api";
import { getApiBaseUrl } from "@/utils/env";

export default function Perfil() {
  const { isSignedIn, isLoaded, userId } = useAuth();

  // Aguardar Clerk carregar
  if (!isLoaded) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-4">Carregando...</Text>
      </View>
    );
  }

  // Se não estiver logado, redirecionar para login
  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para edição
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});
  
  const lastNameInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!userId) {
          throw new Error("Usuário não autenticado");
        }

        const response = await userService.getUser(userId);
        console.log(response);
        setUserInfo({
          ...response.user,
          lives: response.user.lives || 0,
          points: response.user.points || 0,
          createdAt: response.user.createdAt || new Date().toISOString(),
          updatedAt: response.user.updatedAt || new Date().toISOString(),
        });
      } catch (err) {
        console.error("Erro ao carregar perfil do usuário:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erro inesperado ao carregar dados do perfil. Tente novamente.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleStartEdit = () => {
    setEditFirstName(userInfo?.firstName || "");
    setEditLastName(userInfo?.lastName || "");
    setFieldErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFirstName("");
    setEditLastName("");
    setFieldErrors({});
  };

  const handleSaveEdit = async () => {
    // Validações
    const errors: typeof fieldErrors = {};
    let hasError = false;

    if (!editFirstName.trim()) {
      errors.firstName = "Nome é obrigatório";
      hasError = true;
    }

    if (!editLastName.trim()) {
      errors.lastName = "Sobrenome é obrigatório";
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSaveLoading(true);
      
      const response = await userService.updateUser({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
      });

      // Atualizar dados locais
      setUserInfo(prev => prev ? {
        ...prev,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
      } : null);

      setIsEditing(false);
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      Alert.alert(
        "Erro",
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o perfil. Tente novamente."
      );
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-4">Carregando perfil...</Text>
      </View>
    );
  }

  if (error && !userInfo) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-4">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className="text-text-primary text-xl font-bold mt-4 text-center">
          Erro ao carregar perfil
        </Text>
        <Text className="text-text-secondary mt-2 text-center">{error}</Text>
        <Text className="text-text-secondary mt-2 text-center">
          Verifique sua conexão e tente novamente.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-4 pb-4 pt-4">
            {/* Título da Página */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-3xl font-bold text-text-primary">
                Perfil
              </Text>
              {!isEditing && (
                <TouchableOpacity
                  onPress={handleStartEdit}
                  className="bg-primary rounded-lg px-4 py-2 flex-row items-center active:opacity-70"
                >
                  <Ionicons name="pencil" size={16} color="white" style={{ marginRight: 6 }} />
                  <Text className="text-white font-semibold">Editar</Text>
                </TouchableOpacity>
              )}
            </View>

            {error && (
              <View className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                <Text className="text-yellow-800 dark:text-yellow-400 text-sm">{error}</Text>
              </View>
            )}

            {/* Header do Perfil */}
            <View className="items-center mb-8">
              <View className="w-28 h-28 bg-primary rounded-full items-center justify-center mb-4 shadow-lg">
                <Ionicons name="person" size={56} color="white" />
              </View>
              
              {!isEditing ? (
                <>
                  <Text className="text-2xl font-bold text-text-primary text-center">
                    {userInfo?.firstName && userInfo?.lastName
                      ? `${userInfo.firstName} ${userInfo.lastName}`
                      : userInfo?.firstName || userInfo?.lastName || userInfo?.name || "Usuário"}
                  </Text>
                  <Text className="text-text-secondary mt-1">{userInfo?.email}</Text>
                </>
              ) : (
                <View className="w-full mt-2">
                  {/* Formulário de edição */}
                  <View className="bg-card border border-border rounded-lg p-4 mb-4">
                    <Text className="text-lg font-semibold text-text-primary mb-4">
                      Editar Informações
                    </Text>
                    
                    <View className="mb-4">
                      <Text className="text-text-primary font-medium mb-2">
                        Nome *
                      </Text>
                      <TextInput
                        className={`bg-background border rounded-lg px-4 py-3 text-text-primary ${
                          fieldErrors.firstName
                            ? "border-red-500"
                            : "border-border"
                        }`}
                        placeholder="Digite seu nome"
                        placeholderTextColor="#9ca3af"
                        value={editFirstName}
                        onChangeText={(text) => {
                          setEditFirstName(text);
                          if (fieldErrors.firstName) {
                            setFieldErrors(prev => ({ ...prev, firstName: undefined }));
                          }
                        }}
                        autoCapitalize="words"
                        returnKeyType="next"
                        onSubmitEditing={() => lastNameInputRef.current?.focus()}
                      />
                      {fieldErrors.firstName && (
                        <Text className="text-red-500 text-sm mt-1">
                          {fieldErrors.firstName}
                        </Text>
                      )}
                    </View>

                    <View className="mb-4">
                      <Text className="text-text-primary font-medium mb-2">
                        Sobrenome *
                      </Text>
                      <TextInput
                        ref={lastNameInputRef}
                        className={`bg-background border rounded-lg px-4 py-3 text-text-primary ${
                          fieldErrors.lastName
                            ? "border-red-500"
                            : "border-border"
                        }`}
                        placeholder="Digite seu sobrenome"
                        placeholderTextColor="#9ca3af"
                        value={editLastName}
                        onChangeText={(text) => {
                          setEditLastName(text);
                          if (fieldErrors.lastName) {
                            setFieldErrors(prev => ({ ...prev, lastName: undefined }));
                          }
                        }}
                        autoCapitalize="words"
                        returnKeyType="done"
                        onSubmitEditing={handleSaveEdit}
                      />
                      {fieldErrors.lastName && (
                        <Text className="text-red-500 text-sm mt-1">
                          {fieldErrors.lastName}
                        </Text>
                      )}
                    </View>

                    {/* Botões de ação */}
                    <View className="flex-row gap-3 mt-2">
                      <TouchableOpacity
                        onPress={handleCancelEdit}
                        disabled={saveLoading}
                        className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg py-3 active:opacity-70"
                      >
                        <Text className="text-gray-700 dark:text-gray-200 text-center font-semibold">
                          Cancelar
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        onPress={handleSaveEdit}
                        disabled={saveLoading}
                        className={`flex-1 bg-primary rounded-lg py-3 active:opacity-70 ${
                          saveLoading ? "opacity-50" : ""
                        }`}
                      >
                        <Text className="text-white text-center font-semibold">
                          {saveLoading ? "Salvando..." : "Salvar"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {/* Estatísticas - Pontos e Vidas */}
              <View className="flex-row mt-6 gap-4">
                <View className="bg-card border border-border rounded-xl px-6 py-4 items-center shadow-sm min-w-[100px]">
                  <View className="bg-yellow-50 dark:bg-yellow-900/20 rounded-full p-2 mb-2">
                    <Ionicons name="star" size={24} color="#fbbf24" />
                  </View>
                  <Text className="text-text-primary font-bold text-xl">
                    {userInfo?.points || 0}
                  </Text>
                  <Text className="text-text-secondary text-xs mt-1">Pontos</Text>
                </View>
                
                <View className="bg-card border border-border rounded-xl px-6 py-4 items-center shadow-sm min-w-[100px]">
                  <View className="bg-red-50 dark:bg-red-900/20 rounded-full p-2 mb-2">
                    <Ionicons name="heart" size={24} color="#ef4444" />
                  </View>
                  <Text className="text-text-primary font-bold text-xl">
                    {userInfo?.lives || 0}
                  </Text>
                  <Text className="text-text-secondary text-xs mt-1">Vidas</Text>
                </View>
              </View>
            </View>

            {/* Informações do Perfil */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-text-primary mb-4">
                Informações Pessoais
              </Text>

              <View className="bg-card border border-border rounded-lg overflow-hidden">
                <View className="flex-row items-center p-4 border-b border-border">
                  <View className="bg-blue-50 dark:bg-blue-900/20 rounded-full p-2 mr-3">
                    <Ionicons name="mail" size={20} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-secondary text-xs mb-1">Email</Text>
                    <Text className="text-text-primary font-medium">{userInfo?.email}</Text>
                  </View>
                </View>

                <View className="flex-row items-center p-4">
                  <View className="bg-purple-50 dark:bg-purple-900/20 rounded-full p-2 mr-3">
                    <Ionicons name="person" size={20} color="#8b5cf6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-secondary text-xs mb-1">Nome Completo</Text>
                    <Text className="text-text-primary font-medium">
                      {userInfo?.firstName && userInfo?.lastName
                        ? `${userInfo.firstName} ${userInfo.lastName}`
                        : userInfo?.firstName || userInfo?.lastName || "Não informado"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Configurações */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-text-primary mb-4">
                Configurações
              </Text>

              <TouchableOpacity
                onPress={async () => {
                  try {
                    const baseURL = getApiBaseUrl();
                    
                    if (!baseURL) {
                      Alert.alert("Erro", "URL base da API não configurada. Verifique as variáveis de ambiente no arquivo .env ou EAS Secrets");
                      return;
                    }

                    // Remover /api do final da URL se existir
                    const serverUrl = baseURL.replace(/\/api\/?$/, "");
                    const privacyUrl = `${serverUrl}/privacy-policy`;

                    console.log("🔗 [Perfil] Abrindo política de privacidade:", privacyUrl);

                    const canOpen = await Linking.canOpenURL(privacyUrl);
                    if (!canOpen) {
                      Alert.alert("Erro", "Não foi possível abrir a política de privacidade");
                      return;
                    }

                    await Linking.openURL(privacyUrl);
                  } catch (err) {
                    console.error("❌ [Perfil] Erro ao abrir URL:", err);
                    Alert.alert(
                      "Erro",
                      err instanceof Error
                        ? err.message
                        : "Não foi possível abrir a política de privacidade. Tente novamente."
                    );
                  }
                }}
                className="bg-card border border-border rounded-lg p-4 flex-row items-center justify-between active:opacity-70"
              >
                <View className="flex-row items-center">
                  <View className="bg-green-50 dark:bg-green-900/20 rounded-full p-2 mr-3">
                    <Ionicons name="shield-checkmark" size={20} color="#10b981" />
                  </View>
                  <Text className="text-text-primary font-medium">Privacidade</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
