import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { LivesProvider } from "../contexts/LivesContext";

function TabsLayout() {
  const { theme } = useTheme();
  
  const isDark = theme === "dark";
  
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
          name="vidas-bloqueadas"
          options={{
            href: null, // Remove from tab bar
          }}
        />
      </Tabs>
    );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LivesProvider>
        <TabsLayout />
      </LivesProvider>
    </ThemeProvider>
  );
}
