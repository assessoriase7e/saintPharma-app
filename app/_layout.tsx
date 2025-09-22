import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs, useSegments } from "expo-router";
import { OnboardingGuardWrapper } from "../components/OnboardingGuardWrapper";
import { LivesProvider } from "../contexts/LivesContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

function TabsLayout() {
  const { theme } = useTheme();
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();

  const isDark = theme === "dark";

  // Mostrar loading enquanto carrega
  if (!isLoaded) {
    return null;
  }

  // Permitir acesso público à página inicial e rotas de autenticação
  const currentRoute = segments[0];
  const isPublicRoute = !currentRoute || currentRoute === "(auth)"; // Rota raiz (/) e rotas de auth são públicas

  if (!isSignedIn && !isPublicRoute) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <OnboardingGuardWrapper>
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
          name="vidas-bloqueadas"
          options={{
            href: null, // Remove from tab bar
          }}
        />
        <Tabs.Screen
          name="(auth)"
          options={{
            href: null, // Remove from tab bar
          }}
        />
        <Tabs.Screen
          name="onboarding"
          options={{
            href: null, // Remove from tab bar
          }}
        />
        <Tabs.Screen
          name="sso-callback"
          options={{
            href: null, // Remove from tab bar
          }}
        />
      </Tabs>
    </OnboardingGuardWrapper>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ClerkProvider tokenCache={tokenCache}>
        <LivesProvider>
          <TabsLayout />
        </LivesProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}
