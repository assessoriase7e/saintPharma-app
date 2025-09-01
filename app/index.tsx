import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useLives } from "../contexts/LivesContext";
import { useApiClient } from "../services/api";
import { UserCourse } from "../types/api";
import "./global.css";
import { LivesBlockedModal } from "./vidas-bloqueadas";

// Estatísticas padrão quando não há dados da API
const defaultStats = [
  {
    titulo: "Concluídos",
    valor: "0",
    icone: "checkmark-circle" as const,
    cor: "#10b981",
  },
  {
    titulo: "Em Progresso",
    valor: "0",
    icone: "play-circle" as const,
    cor: "#3b82f6",
  },
  {
    titulo: "Horas Estudadas",
    valor: "0h",
    icone: "time" as const,
    cor: "#f59e0b",
  },
];

export default function Home() {
  const { userLives, isLoaded: livesLoaded } = useLives();
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [allCourses, setAllCourses] = useState<UserCourse[]>([]);
  const [statistics, setStatistics] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  // Buscar cursos e estatísticas da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Debug temporário para web
    if (typeof window !== 'undefined') {
      const debugInfo = {
        apiUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
        apiToken: process.env.EXPO_PUBLIC_API_TOKEN ? 'Configurado' : 'Não configurado',
        hasApiClient: !!apiClient,
        isSignedIn: isSignedIn,
        allEnvVars: Object.keys(process.env).filter(key => key.startsWith('EXPO_PUBLIC'))
      };
      console.log('🔍 Debug Info:', debugInfo);
      // Removendo alert para não interromper o fluxo
    }
        console.log('👤 Usuário logado:', isSignedIn);

        // Sempre buscar todos os cursos disponíveis
        console.log('📚 Buscando todos os cursos disponíveis...');
        const allCoursesResponse = await apiClient.getCourses();
        console.log('✅ Todos os cursos carregados:', allCoursesResponse);
        
        // Converter Course[] para UserCourse[] para compatibilidade
        const allCoursesFormatted = allCoursesResponse.courses.map(course => ({
          id: course._id,
          courseId: course._id,
          course: course,
          enrolledAt: new Date().toISOString(),
          progress: {
            completedLectures: 0,
            totalLectures: 0,
            percentage: 0
          }
        }));
        setAllCourses(allCoursesFormatted);

        if (isSignedIn) {
          // Usuário logado: também buscar cursos do usuário para mostrar progresso
          console.log('📚 Buscando cursos do usuário...');
          try {
            const userCoursesResponse = await apiClient.getUserCourses();
            console.log('✅ Cursos do usuário carregados:', userCoursesResponse);
            setUserCourses(userCoursesResponse.courses);
          } catch (userCoursesError) {
            console.warn('Erro ao buscar cursos do usuário:', userCoursesError);
            setUserCourses([]);
          }
        } else {
          setUserCourses([]);
        }

        // Buscar estatísticas do usuário (apenas se logado)
        if (isSignedIn) {
          try {
            const summaryResponse = await apiClient.getUserSummary();
            const newStats = [
              {
                titulo: "Concluídos",
                valor: summaryResponse.completedCourses.toString(),
                icone: "checkmark-circle" as const,
                cor: "#10b981",
              },
              {
                titulo: "Em Progresso",
                valor: (
                  (userCourses?.length || 0) -
                  summaryResponse.completedCourses
                ).toString(),
                icone: "play-circle" as const,
                cor: "#3b82f6",
              },
              {
                titulo: "Horas Estudadas",
                valor: `${Math.floor(summaryResponse.totalTimeSpent / 60)}h`,
                icone: "time" as const,
                cor: "#f59e0b",
              },
            ];
            setStatistics(newStats);
          } catch (statsError) {
            console.warn("Erro ao buscar estatísticas:", statsError);
            // Manter estatísticas padrão se houver erro
          }
        } else {
          // Usuário não logado: manter estatísticas padrão
          setStatistics(defaultStats);
        }
      } catch (err) {
        console.error("❌ Erro ao buscar dados:", err);
        console.error("❌ Tipo do erro:", typeof err);
        console.error("❌ Mensagem do erro:", err instanceof Error ? err.message : String(err));
        
        if (err instanceof Error) {
          if (err.message.includes('Network request failed') || err.message.includes('fetch')) {
            setError("Erro de conexão: Verifique se o servidor da API está rodando em http://localhost:3000");
          } else if (err.message.includes('404')) {
            setError("Endpoint não encontrado: Verifique se a API está configurada corretamente");
          } else {
            setError(`Erro na API: ${err.message}`);
          }
        } else {
          setError("Erro desconhecido ao carregar os cursos");
        }
        
        // Garantir que os arrays de cursos sejam sempre válidos
        setUserCourses([]);
        setAllCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isSignedIn]);

  // Função para obter cursos para a seção "Explore Mais Cursos"
  const getExploreCourses = () => {
    if (!isSignedIn || !allCourses) {
      return allCourses || [];
    }

    // Para usuários logados, mostrar apenas cursos que não estão matriculados
    const userCourseIds = userCourses?.map(uc => uc.courseId) || [];
    return allCourses.filter(course => !userCourseIds.includes(course.courseId));
  };

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

    if (userLives && userLives.currentLives > 0) {
      // Iniciar a primeira aula do curso
      router.push(`/aula/1` as any); // Assumindo que a primeira aula tem ID 1
    } else {
      setShowBlockedModal(true);
    }
  };

  // Aguardar carregamento do contexto de vidas
  if (!livesLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-2">Carregando...</Text>
      </View>
    );
  }

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
              {isSignedIn && userLives && (
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
                          : "text-text-secondary"
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
                {statistics.map((stat, index) => (
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



          {/* Cursos do Usuário - apenas para usuários logados com cursos */}
          {isSignedIn && userCourses?.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-text-primary mb-4">
                Seus Cursos
              </Text>
              <View className="space-y-3">
                {userCourses.map((course) => (
                  <Pressable
                    key={course.course._id}
                    onPress={() =>
                      router.push(`/curso/${course.course._id}` as any)
                    }
                    className="mb-4"
                  >
                    <View className="bg-card p-4 rounded-lg border border-border">
                      <Text className="text-text-primary text-lg font-semibold mb-2">
                        {course.course.name}
                      </Text>
                      <Text className="text-text-secondary text-sm mb-3">
                        {course.course.description}
                      </Text>
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                          <Ionicons
                            name="time-outline"
                            size={16}
                            color="#6b7280"
                          />
                          <Text className="text-text-secondary text-sm ml-1">
                            {course.course.workload}h
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons name="star" size={16} color="#f59e0b" />
                          <Text className="text-text-secondary text-sm ml-1">
                            {course.course.points} pts
                          </Text>
                        </View>
                      </View>
                      {/* Barra de progresso */}
                      <View className="mt-2">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="text-text-secondary text-xs">
                            Progresso
                          </Text>
                          <Text className="text-text-secondary text-xs">
                            {course.progress.percentage.toFixed(0)}%
                          </Text>
                        </View>
                        <View className="bg-border h-2 rounded-full">
                          <View
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${course.progress.percentage}%` }}
                          />
                        </View>
                        <Text className="text-text-secondary text-xs mt-1">
                          {course.progress.completedLectures} de{" "}
                          {course.progress.totalLectures} aulas
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Todos os Cursos */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-text-primary mb-4">
              {isSignedIn ? "Explore Mais Cursos" : "Cursos Disponíveis"}
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
                {(() => {
                  const exploreCourses = getExploreCourses();
                  return exploreCourses && exploreCourses.length > 0 ? exploreCourses.map((course) => (
                  <Pressable
                    key={course.course._id}
                    onPress={() =>
                      router.push(`/curso/${course.course._id}` as any)
                    }
                    className="mb-4"
                  >
                    <View className="bg-card p-4 rounded-lg border border-border">
                      <Text className="text-text-primary text-lg font-semibold mb-2">
                        {course.course.name}
                      </Text>
                      <Text className="text-text-secondary text-sm mb-3">
                        {course.course.description}
                      </Text>
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                          <Ionicons
                            name="time-outline"
                            size={16}
                            color="#6b7280"
                          />
                          <Text className="text-text-secondary text-sm ml-1">
                            {course.course.workload}h
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons name="star" size={16} color="#f59e0b" />
                          <Text className="text-text-secondary text-sm ml-1">
                            {course.course.points} pts
                          </Text>
                        </View>
                      </View>
                      {/* Barra de progresso */}
                      <View className="mt-2">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="text-text-secondary text-xs">
                            Progresso
                          </Text>
                          <Text className="text-text-secondary text-xs">
                            {course.progress.percentage.toFixed(0)}%
                          </Text>
                        </View>
                        <View className="bg-border h-2 rounded-full">
                          <View
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${course.progress.percentage}%` }}
                          />
                        </View>
                        <Text className="text-text-secondary text-xs mt-1">
                          {course.progress.completedLectures} de{" "}
                          {course.progress.totalLectures} aulas
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                  )) : (
                    <View className="flex-1 justify-center items-center py-8">
                      <Text className="text-text-secondary text-center">
                        {error ? "Erro ao carregar cursos" : "Nenhum curso disponível"}
                      </Text>
                    </View>
                  );
                })()}
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
