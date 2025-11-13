import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";
import { useTheme } from "@/stores";

/**
 * Layout para rotas com tabs.
 * 
 * Verifica autenticação e onboarding antes de permitir acesso.
 * Serve como camada de segurança adicional caso alguém acesse diretamente
 * uma rota protegida (ex: deep link).
 */
export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isLoading, needsOnboarding, error } = useOnboardingCheck();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Mostrar loading enquanto Clerk não carregou
  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-2">
          Carregando aplicação...
        </Text>
      </View>
    );
  }

  // Permitir acesso público à listagem de cursos (index)
  // Mas exigir autenticação para outras rotas protegidas
  // A verificação de autenticação para rotas específicas será feita nas próprias rotas
  
  // Se estiver logado, verificar onboarding
  if (isSignedIn) {
    // Mostrar loading enquanto verifica onboarding
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center bg-background">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-text-secondary mt-2">
            Verificando perfil...
          </Text>
        </View>
      );
    }

    // Se precisar de onboarding, redirecionar
    if (needsOnboarding) {
      return <Redirect href="/onboarding" />;
    }

    // Se houver erro, ainda assim permitir acesso (mas logar o erro)
    // Isso permite que o usuário continue usando o app mesmo se houver problema na verificação
    if (error) {
      console.error("⚠️ [TabsLayout] Erro ao verificar onboarding:", error);
      // Continuar renderizando, mas o erro será tratado pela página
    }
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? "#60a5fa" : "#3b82f6",
        tabBarInactiveTintColor: isDark ? "#94a3b8" : "#6b7280",
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
          borderTopColor: isDark ? "#334155" : "#e2e8f0",
          borderTopWidth: 1,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Cursos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: "Ranking",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="certificados"
        options={{
          title: "Certificados",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ribbon" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="opcoes"
        options={{
          title: "Opções",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="aula/[id]"
        options={{
          href: null, // Remove from tab bar
        }}
      />
      <Tabs.Screen
        name="curso/[id]"
        options={{
          href: null, // Remove from tab bar
        }}
      />
      <Tabs.Screen
        name="prova/[id]"
        options={{
          href: null, // Remove from tab bar
        }}
      />
      <Tabs.Screen
        name="resultado/[quizId]"
        options={{
          href: null, // Remove from tab bar
        }}
      />
      <Tabs.Screen
        name="certificado/[id]"
        options={{
          href: null, // Remove from tab bar
        }}
      />
      <Tabs.Screen
        name="vidas-bloqueadas"
        options={{
          href: null, // Remove from tab bar
        }}
      />
    </Tabs>
  );
}
