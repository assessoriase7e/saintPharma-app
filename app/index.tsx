import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { coursesService, statsService, userService } from "../services";
import { UserCourse, UserInfoResponse } from "../types/api";
import "../utils/suppressWarnings";
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
  const { isSignedIn, signOut, userId } = useAuth();
  const { user } = useUser();
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [allCourses, setAllCourses] = useState<UserCourse[]>([]);
  const [statistics, setStatistics] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const isFirstMount = useRef(true);

  // Função para buscar dados (reutilizável)
  const fetchData = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar todos os cursos disponíveis usando o service
        console.log("📚 Buscando todos os cursos disponíveis...");
        const allCoursesData = await coursesService.getAllCourses();
        setAllCourses(allCoursesData);

        if (isSignedIn && userId) {
          // Buscar informações do usuário (incluindo vidas)
          console.log("👤 Buscando informações do usuário...");
          const userResponse = await userService.getUser(userId);
          setUserInfo({
            id: userResponse.user.id,
            clerkId: userResponse.user.clerkId,
            email: userResponse.user.email,
            firstName: userResponse.user.firstName,
            lastName: userResponse.user.lastName,
            profileImage: userResponse.user.profileImage,
            lives: userResponse.user.lives || 0,
            points: userResponse.user.points || 0,
            createdAt: userResponse.user.createdAt || new Date().toISOString(),
            updatedAt: userResponse.user.updatedAt || new Date().toISOString(),
          });

          // Buscar cursos do usuário usando o service
          // A resposta já inclui informações de progresso, então não é necessário buscar separadamente
          console.log("📚 Buscando cursos do usuário...");
          const userCoursesData = await coursesService.getUserCourses();
          setUserCourses(userCoursesData);
          
          // Buscar estatísticas do usuário (dados vêm diretamente da API)
          console.log("📊 Buscando estatísticas do usuário...");
          const userStats = await statsService.getUserStats();
          setStatistics(userStats);
        } else {
          setUserInfo(null);
          setUserCourses([]);
          // Usuário não logado: usar estatísticas padrão
          setStatistics(statsService.getDefaultStats());
        }
      } catch (err) {
        console.error("❌ Erro ao buscar dados:", err);
        console.error("❌ Tipo do erro:", typeof err);
        console.error(
          "❌ Mensagem do erro:",
          err instanceof Error ? err.message : String(err)
        );

        if (err instanceof Error) {
          // As mensagens de erro já vêm traduzidas do ApiClient
          setError(err.message);
        } else {
          setError("Erro inesperado ao carregar os cursos. Tente novamente.");
        }

        // Garantir que os arrays de cursos sejam sempre válidos
        setUserCourses([]);
        setAllCourses([]);
      } finally {
        setLoading(false);
      }
  }, [isSignedIn, userId]);

  // Buscar dados quando o componente montar ou isSignedIn mudar
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Recarregar dados quando a tela entrar em foco (ex: voltando de uma aula ou curso)
  useFocusEffect(
    useCallback(() => {
      // Não recarregar no primeiro mount (já é feito pelo useEffect)
      if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
      }
      
      console.log("🔄 [Home] Tela em foco, recarregando dados...");
      fetchData();
    }, [fetchData])
  );

  // Função para obter cursos para a seção "Explore Mais Cursos"
  const getExploreCourses = () => {
    return coursesService.getExploreCourses(allCourses, userCourses);
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

    if (userInfo && userInfo.lives && userInfo.lives > 0) {
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
              {isSignedIn && userInfo && (
                <View className="bg-card border border-border rounded-lg px-4 py-2 items-center ml-3">
                  <Ionicons
                    name="heart"
                    size={20}
                    color={(userInfo.lives || 0) > 0 ? "#ef4444" : "#9ca3af"}
                  />
                  <Text
                    className={`mt-1 font-semibold text-text-primary ${
                      (userInfo.lives || 0) > 0
                        ? "text-red-500"
                        : "text-text-secondary"
                    }`}
                  >
                    {userInfo.lives || 0}
                  </Text>
                  <Text className="text-text-secondary text-xs text-center">
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
                      {course.progress && (
                        <View className="mt-2">
                          <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-text-secondary text-xs">
                              Progresso
                            </Text>
                            <Text className="text-text-secondary text-xs">
                              {course.progress.percentage?.toFixed(0) ?? 0}%
                            </Text>
                          </View>
                          <View className="bg-border h-2 rounded-full">
                            <View
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${course.progress.percentage ?? 0}%` }}
                            />
                          </View>
                          <Text className="text-text-secondary text-xs mt-1">
                            {course.progress.completedLectures ?? 0} de{" "}
                            {course.progress.totalLectures ?? 0} aulas
                          </Text>
                        </View>
                      )}
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
                  return exploreCourses && exploreCourses.length > 0 ? (
                    exploreCourses.map((course) => (
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
                          {course.progress && (
                            <View className="mt-2">
                              <View className="flex-row items-center justify-between mb-1">
                                <Text className="text-text-secondary text-xs">
                                  Progresso
                                </Text>
                                <Text className="text-text-secondary text-xs">
                                  {course.progress.percentage?.toFixed(0) ?? 0}%
                                </Text>
                              </View>
                              <View className="bg-border h-2 rounded-full">
                                <View
                                  className="bg-primary h-2 rounded-full"
                                  style={{
                                    width: `${course.progress.percentage ?? 0}%`,
                                  }}
                                />
                              </View>
                              <Text className="text-text-secondary text-xs mt-1">
                                {course.progress.completedLectures ?? 0} de{" "}
                                {course.progress.totalLectures ?? 0} aulas
                              </Text>
                            </View>
                          )}
                        </View>
                      </Pressable>
                    ))
                  ) : (
                    <View className="flex-1 justify-center items-center py-8">
                      <Text className="text-text-secondary text-center">
                        {error
                          ? "Erro ao carregar cursos"
                          : "Nenhum curso disponível"}
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
