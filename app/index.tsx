import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLives } from "../contexts/LivesContext";
import { useApiClient } from "../services/api";
import { Course } from "../types/api";
import "./global.css";
import { LivesBlockedModal } from "./vidas-bloqueadas";

const estatisticas = [
  {
    titulo: "Concluídos",
    valor: "12",
    icone: "checkmark-circle" as const,
    cor: "#10b981",
  },
  {
    titulo: "Em Progresso",
    valor: "3",
    icone: "play-circle" as const,
    cor: "#3b82f6",
  },
  {
    titulo: "Horas Estudadas",
    valor: "127h",
    icone: "time" as const,
    cor: "#f59e0b",
  },
];

// Dados mockados como fallback
const cursosMockados = [
  {
    id: 1,
    titulo: "Farmacologia Básica",
    descricao: "Fundamentos da farmacologia moderna",
    duracao: "8 horas",
    nivel: "Iniciante",
    categoria: "Farmácia",
    progresso: 0,
  },
  {
    id: 2,
    titulo: "Análises Clínicas",
    descricao: "Interpretação de exames laboratoriais",
    duracao: "12 horas",
    nivel: "Intermediário",
    categoria: "Laboratório",
    progresso: 0,
  },
  {
    id: 3,
    titulo: "Atenção Farmacêutica",
    descricao: "Cuidado farmacêutico ao paciente",
    duracao: "6 horas",
    nivel: "Avançado",
    categoria: "Clínica",
    progresso: 0,
  },
  {
    id: 4,
    titulo: "Cosmetologia",
    descricao: "Formulação e desenvolvimento de cosméticos",
    duracao: "10 horas",
    nivel: "Intermediário",
    categoria: "Cosmética",
    progresso: 0,
  },
  {
    id: 5,
    titulo: "Fitoterapia",
    descricao: "Plantas medicinais e seus usos terapêuticos",
    duracao: "14 horas",
    nivel: "Avançado",
    categoria: "Natural",
    progresso: 0,
  },
  {
    id: 6,
    titulo: "Farmácia Hospitalar",
    descricao: "Gestão farmacêutica em ambiente hospitalar",
    duracao: "16 horas",
    nivel: "Avançado",
    categoria: "Hospitalar",
    progresso: 0,
  },
];

export default function Home() {
  const { userLives } = useLives();
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  // Buscar cursos da API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getCourses();
        setCourses(response.courses);
      } catch (err) {
        console.error("Erro ao buscar cursos:", err);
        setError("Erro ao carregar cursos. Usando dados locais.");
        // Usar dados mockados como fallback
        const mockCoursesFormatted = cursosMockados.map((curso) => ({
          _id: curso.id.toString(),
          name: curso.titulo,
          description: curso.descricao,
          workload: parseInt(curso.duracao.replace(/\D/g, "")),
          points: 100, // Valor padrão
          premiumPoints: null,
          slug: null,
          banner: undefined,
        }));
        setCourses(mockCoursesFormatted);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleSignIn = () => {
    router.replace("/(auth)/sign-in" as any);
  };

  const handleCoursePress = (courseId: string | number) => {
    if (!isSignedIn) {
      handleSignIn();
      return;
    }

    router.push(`/curso/${courseId}` as any);
  };

  const handleStartCourse = (courseId: string | number) => {
    if (!isSignedIn) {
      handleSignIn();
      return;
    }

    if (userLives.currentLives > 0) {
      // Iniciar a primeira aula do curso
      router.push(`/aula/1` as any); // Assumindo que a primeira aula tem ID 1
    } else {
      setShowBlockedModal(true);
    }
  };

  return (
    <>
      <ScrollView className="flex-1 bg-background">
        <View className="pt-12 px-4 pb-4">
          {/* Header */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-3xl font-bold text-text-primary mb-2">
                  Cursos
                </Text>
                <Text className="text-text-secondary">
                  {isSignedIn
                    ? `Olá, ${user?.fullName || "Usuário"}!`
                    : "Explore nossos cursos e desenvolva suas habilidades"}
                </Text>
              </View>

              {/* Indicador de Vidas - apenas para usuários logados */}
              {isSignedIn && (
                <View className="bg-card border border-border rounded-lg px-3 py-2">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="heart"
                      size={20}
                      color={userLives.currentLives > 0 ? "#ef4444" : "#9ca3af"}
                    />
                    <Text
                      className={`ml-1 font-semibold ${
                        userLives.currentLives > 0
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    >
                      {userLives.currentLives}
                    </Text>
                  </View>
                  <Text className="text-text-secondary text-xs text-center mt-1">
                    Vidas
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Estatísticas - apenas para usuários autenticados */}
          {isSignedIn && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-text-primary mb-4">
                Resumo dos Estudos
              </Text>
              <View className="flex-row justify-between">
                {estatisticas.map((stat, index) => (
                  <View
                    key={index}
                    className="bg-card border border-border rounded-lg p-4 flex-1 mx-1 items-center"
                  >
                    <Ionicons name={stat.icone} size={24} color={stat.cor} />
                    <Text className="text-lg font-bold text-text-primary mt-2">
                      {stat.valor}
                    </Text>
                    <Text className="text-text-secondary text-xs text-center">
                      {stat.titulo}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Cursos em Progresso - apenas para usuários autenticados */}
          {isSignedIn && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-text-primary mb-4">
                Continue Estudando
              </Text>

              <View className="bg-card border border-border rounded-lg p-4 mb-3">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-text-primary mb-1">
                      Farmacologia Avançada
                    </Text>
                    <Text className="text-sm text-text-secondary">
                      Módulo 3: Farmacocinética
                    </Text>
                  </View>
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-xs font-medium text-blue-800">
                      65% concluído
                    </Text>
                  </View>
                </View>
                <View className="bg-border rounded-full h-2 mb-3">
                  <View
                    className="bg-primary h-2 rounded-full"
                    style={{ width: "65%" }}
                  />
                </View>
                <Pressable className="bg-blue-600 rounded-lg py-2 px-4">
                  <Text className="text-white text-center font-medium">
                    Continuar Curso
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Cursos Disponíveis */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-text-primary mb-4">
              Cursos Disponíveis
            </Text>

            {/* Indicador de erro */}
            {error && (
              <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <Text className="text-yellow-800 text-sm">{error}</Text>
              </View>
            )}

            {/* Indicador de carregamento */}
            {loading ? (
              <View className="flex-1 justify-center items-center py-8">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-text-secondary mt-2">
                  Carregando cursos...
                </Text>
              </View>
            ) : (
              <View className="space-y-3">
                {courses.map((curso) => (
                  <View
                    key={curso._id}
                    className="bg-card border border-border rounded-lg p-4"
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-text-primary mb-1">
                          {curso.name}
                        </Text>
                        <Text className="text-sm text-text-secondary mb-2">
                          {curso.description}
                        </Text>
                      </View>
                      <View className="bg-blue-100 px-3 py-1 rounded-full">
                        <Text className="text-xs font-medium text-blue-800">
                          {curso.points} pts
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row justify-between items-center mb-3">
                      <View className="flex-row items-center">
                        <Ionicons
                          name="time"
                          size={16}
                          color="#6b7280"
                          style={{ marginRight: 4 }}
                        />
                        <Text className="text-sm text-text-secondary">
                          {curso.workload}h
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons
                          name="star"
                          size={16}
                          color="#6b7280"
                          style={{ marginRight: 4 }}
                        />
                        <Text className="text-sm text-text-secondary">
                          {curso.points} pontos
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      className={`rounded-lg py-2 px-4 ${
                        userLives.currentLives > 0
                          ? "bg-primary"
                          : "bg-gray-400"
                      }`}
                      onPress={() => handleCoursePress(curso._id)}
                      activeOpacity={0.7}
                    >
                      <Text className="text-white text-center font-medium">
                        {isSignedIn
                          ? userLives.currentLives > 0
                            ? "Ver grade"
                            : "Sem Vidas"
                          : "Ver grade"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <LivesBlockedModal
        visible={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
      />
    </>
  );
}
