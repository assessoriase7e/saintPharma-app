import { useAuth } from "@clerk/clerk-expo";
import { httpClient } from "../services/httpClient";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Card from "../../components/Card";
import {
  certificatesService,
  coursesService,
  examsService,
  lecturesService,
} from "../../services";
import { CourseProgressResponse, Lecture } from "../../types/api";

interface LectureCardProps {
  lecture: Lecture;
  courseId: string;
  index: number;
  isCourseCompleted: boolean;
}

function LectureCard({ lecture, courseId, index, isCourseCompleted }: LectureCardProps) {
  const [creatingExam, setCreatingExam] = useState(false);

  const handleLecturePress = () => {
    router.push(`/aula/${lecture._id}?courseId=${courseId}` as any);
  };

  const handleQuizPress = async () => {
    if (!lecture.completed) {
      alert("Você precisa concluir a aula antes de fazer a prova!");
      return;
    }

    try {
      setCreatingExam(true);

      // Verificar elegibilidade antes de criar o exame
      const eligibilityResponse = await examsService.checkExamEligibility();

      if (!eligibilityResponse.data.canTakeExam) {
        alert(
          eligibilityResponse.data.message ||
            "Você não possui vidas suficientes para iniciar o exame."
        );
        return;
      }

      const examResponse = await examsService.createExam({
        lectureCMSid: lecture._id,
      });

      router.push(
        `/prova/${examResponse.data.exam.id}?lectureId=${lecture._id}&courseId=${courseId}` as any
      );
    } catch (error) {
      console.error("Erro ao criar exame:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro inesperado ao criar exame. Tente novamente.";
      alert(errorMessage);
    } finally {
      setCreatingExam(false);
    }
  };

  return (
    <Card className="mb-4">
      <View className="p-4">
        <Pressable onPress={handleLecturePress}>
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <Text className="text-text-primary text-lg font-semibold mb-1">
                Aula {index + 1}: {lecture.title}
              </Text>
              <Text className="text-text-secondary text-sm mb-2">
                {lecture.description}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text className="text-text-secondary text-sm ml-1">15 min</Text>
              </View>
            </View>
            <View className="ml-4">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  lecture.completed ? "bg-secondary" : "bg-border"
                }`}
              >
                <Ionicons
                  name={lecture.completed ? "checkmark" : "play"}
                  size={16}
                  color={lecture.completed ? "white" : "#6b7280"}
                />
              </View>
            </View>
          </View>
        </Pressable>

        {/* Botão de Prova - só aparece se a aula estiver concluída E o curso não estiver 100% completo */}
        {lecture.completed && !isCourseCompleted && (
          <View className="mt-3 pt-3 border-t border-border">
            <Pressable
              onPress={handleQuizPress}
              disabled={creatingExam}
              className={`flex-row items-center justify-center py-2 px-4 rounded-lg ${
                creatingExam
                  ? "bg-border"
                  : "bg-primary/10 border border-primary"
              }`}
            >
              {creatingExam ? (
                <>
                  <ActivityIndicator size="small" color="#6b7280" />
                  <Text className="text-text-secondary ml-2 font-medium">
                    Criando prova...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="help-circle-outline"
                    size={18}
                    color="#3b82f6"
                  />
                  <Text className="text-primary ml-2 font-medium">
                    Fazer Prova
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </Card>
  );
}

export default function CourseLessons() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const courseId = id || "";
  const [course, setCourse] = useState<any>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<CourseProgressResponse | null>(null);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📊 [Course] ==========================================");
      console.log(`📊 [Course] Iniciando busca de dados do curso ${courseId}`);
      
      // Buscar detalhes do curso, aulas e progresso atualizado
      console.log("📊 [Course] Buscando dados em paralelo...");
      const [courseResponse, lecturesResponse, progressResponse] = await Promise.all([
        coursesService.getCourseById(courseId),
        lecturesService.getLectures(courseId),
        coursesService.getCourseProgress(courseId, { includeLectures: true }).catch((error) => {
          console.warn("⚠️ [Course] Erro ao buscar progresso (continuando com dados padrão):", error);
          return null;
        }),
      ]);

      console.log("✅ [Course] Dados recebidos:");
      console.log("  - Curso:", courseResponse?.title || courseResponse?.name);
      console.log("  - Aulas:", lecturesResponse.lectures?.length ?? 0);
      console.log("  - Progresso:", progressResponse ? "Sim" : "Não");

      if (progressResponse) {
        console.log("📊 [Course] Detalhes do progresso:");
        console.log(`  - Porcentagem: ${progressResponse.progress.percentage}%`);
        console.log(`  - Aulas concluídas: ${progressResponse.progress.completedLectures}/${progressResponse.progress.totalLectures}`);
        console.log(`  - Status: ${progressResponse.progress.status}`);
        console.log(`  - Pronto para certificado: ${progressResponse.progress.isReadyForCertificate}`);
        console.log(`  - Concluído: ${progressResponse.progress.isCompleted}`);
        console.log(`  - Certificado: ${progressResponse.certificate ? 'Sim' : 'Não'}`);
        console.log(`  - Lectures no progresso: ${progressResponse.lectures?.length ?? 0}`);
      }

      setCourse(courseResponse);
      setProgressData(progressResponse);
      
      // Se tiver progresso com lectures, usar essas lectures (elas têm o status completed)
      if (progressResponse?.lectures && progressResponse.lectures.length > 0) {
        console.log("📊 [Course] Mesclando lectures com progresso...");
        // Mesclar lectures do progresso com as lectures retornadas
        const lecturesWithProgress = (lecturesResponse.lectures || []).map((lecture) => {
          const progressLecture = progressResponse.lectures?.find(
            (pl) => pl.id === lecture._id
          );
          const isCompleted = progressLecture?.completed || lecture.completed || false;
          if (isCompleted) {
            console.log(`  ✅ Aula "${lecture.title}" está concluída`);
          }
          return {
            ...lecture,
            completed: isCompleted,
            completedAt: progressLecture?.completedAt || lecture.completedAt,
          };
        });
        console.log(`✅ [Course] ${lecturesWithProgress.filter(l => l.completed).length} aulas marcadas como concluídas`);
        setLectures(lecturesWithProgress);
      } else {
        console.log("⚠️ [Course] Sem progresso ou lectures, usando dados padrão");
        setLectures(lecturesResponse.lectures || []);
      }
      
      console.log("✅ [Course] Dados do curso carregados com sucesso");
      console.log("📊 [Course] ==========================================");
    } catch (err) {
      console.error("❌ [Course] ==========================================");
      console.error("❌ [Course] Erro ao buscar dados do curso:", err);
      if (err instanceof Error) {
        console.error(`❌ [Course] Mensagem: ${err.message}`);
        console.error(`❌ [Course] Stack: ${err.stack}`);
      }
      console.error("❌ [Course] ==========================================");
      setError("Erro ao carregar o curso. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, fetchCourseData]);

  // Atualizar dados quando a tela receber foco (ex: voltando da aula)
  useFocusEffect(
    useCallback(() => {
      if (courseId) {
        fetchCourseData();
      }
    }, [courseId, fetchCourseData])
  );

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-4">Carregando curso...</Text>
      </View>
    );
  }

  if (error || !course) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-text-primary text-xl font-semibold mt-4 mb-2">
          Curso não encontrado
        </Text>
        <Text className="text-text-secondary text-center mb-6">
          {error ||
            "O curso que você está procurando não existe ou foi removido."}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Voltar</Text>
        </Pressable>
      </View>
    );
  }

  // Calcular progresso baseado nas lectures (com fallback para cálculo client-side)
  const completedLectures = lectures.filter(
    (lecture) => lecture.completed
  ).length;
  const totalLectures = lectures.length;
  const progressPercentage =
    totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;

  // Verificar se o curso está 100% concluído
  const isCourseCompleted = progressPercentage >= 100 || 
    (progressData?.progress?.isCompleted ?? false) ||
    (progressData?.progress?.isReadyForCertificate ?? false) ||
    (completedLectures === totalLectures && totalLectures > 0);

  // Verificar se já existe certificado
  const hasCertificate = !!progressData?.certificate;
  const certificateId = progressData?.certificate?.id;

  // Função para gerar certificado
  const handleGenerateCertificate = async () => {
    if (!course) {
      Alert.alert("Erro", "Informações do curso não disponíveis.");
      return;
    }

    if (!userId) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    try {
      setGeneratingCertificate(true);
      
      // Configurar X-User-Id header conforme documentação
      // A rota /api/certificate/for-user requer X-User-Id no header
      httpClient.setUserId(userId);
      
      // Usar a rota /api/certificate/for-user que verifica se já existe certificado
      // Se existir, retorna o existente. Se não, cria um novo.
      const response = await certificatesService.getOrCreateCertificate({
        course: {
          _id: courseId, // Também aceita "id"
          name: course.title || course.name, // Também aceita "title" ou "courseTitle"
          description: course.description,
          points: course.points || 0,
          workload: course.workload || 0,
          premiumPoints: course.premiumPoints,
          banner: course.banner,
          slug: course.slug,
        },
      });

      // A resposta tem a estrutura: { success: true, data: { certificate: {...} }, timestamp: "..." }
      const certificate = response.data?.certificate;
      
      if (certificate) {
        // Redirecionar automaticamente para a página do certificado
        router.push(`/certificado/${certificate.id}` as any);
      }
    } catch (error) {
      console.error("Erro ao gerar certificado:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao gerar certificado. Tente novamente.";
      Alert.alert("Erro", errorMessage);
    } finally {
      setGeneratingCertificate(false);
    }
  };

  // Função para ver certificado
  const handleViewCertificate = () => {
    if (certificateId) {
      router.push(`/certificado/${certificateId}` as any);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-card border-b border-border px-6 pt-12 pb-6">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </Pressable>
          <Text className="text-text-primary text-xl font-bold flex-1">
            {course.title}
          </Text>
        </View>

        <Text className="text-text-secondary mb-4">{course.description}</Text>

        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="bg-primary/20 px-3 py-1 rounded-full mr-3">
              <Text className="text-primary text-sm font-medium">
                {course.workload || 0}h
              </Text>
            </View>
            <View className="bg-secondary/20 px-3 py-1 rounded-full">
              <Text className="text-secondary text-sm font-medium">
                {course.points || 0} pts
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text className="text-text-secondary text-sm ml-1">
              {totalLectures} aulas
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="mb-2">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-text-secondary text-sm">
              Progresso do Curso
            </Text>
            <Text className="text-text-secondary text-sm">
              {completedLectures}/{totalLectures} aulas
            </Text>
          </View>
          <View className="h-2 bg-border rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
          <Text className="text-text-secondary text-xs mt-1">
            {Math.round(progressPercentage)}% concluído
          </Text>
        </View>
      </View>

      {/* Lessons List */}
      <ScrollView className="flex-1 px-6 py-6">
        <Text className="text-text-primary text-lg font-semibold mb-4">
          Aulas do Curso ({totalLectures})
        </Text>

        {lectures.map((lecture, index) => (
          <LectureCard
            key={lecture._id}
            lecture={lecture}
            courseId={courseId}
            index={index}
            isCourseCompleted={isCourseCompleted}
          />
        ))}

        {/* Course Stats */}
        <Card className="mt-6">
          <View className="p-4">
            <Text className="text-text-primary text-lg font-semibold mb-4">
              Estatísticas do Curso
            </Text>

            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Ionicons name="book-outline" size={20} color="#3b82f6" />
                <Text className="text-text-secondary ml-2">Total de Aulas</Text>
              </View>
              <Text className="text-text-primary font-semibold">
                {totalLectures}
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#10b981"
                />
                <Text className="text-text-secondary ml-2">
                  Aulas Concluídas
                </Text>
              </View>
              <Text className="text-text-primary font-semibold">
                {completedLectures}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="star" size={20} color="#f59e0b" />
                <Text className="text-text-secondary ml-2">
                  Pontos do Curso
                </Text>
              </View>
              <Text className="text-text-primary font-semibold">
                {course.points || 0}
              </Text>
            </View>
          </View>
        </Card>

        {/* Botões de Ação */}
        <View className="mt-6 space-y-3">
          {isCourseCompleted && hasCertificate ? (
            // Botão Ver Certificado (curso concluído e certificado existe)
            <Pressable
              className="bg-secondary rounded-lg py-4 px-6 flex-row items-center justify-center"
              onPress={handleViewCertificate}
            >
              <Ionicons name="trophy" size={24} color="white" />
              <Text className="text-white text-center font-semibold text-lg ml-2">
                Ver Certificado
              </Text>
            </Pressable>
          ) : isCourseCompleted ? (
            // Botão Gerar Certificado (curso concluído mas certificado não existe)
            <Pressable
              className={`rounded-lg py-4 px-6 flex-row items-center justify-center ${
                generatingCertificate ? "bg-secondary/50" : "bg-secondary"
              }`}
              onPress={handleGenerateCertificate}
              disabled={generatingCertificate}
            >
              {generatingCertificate ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white text-center font-semibold text-lg ml-2">
                    Gerando Certificado...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="trophy-outline" size={24} color="white" />
                  <Text className="text-white text-center font-semibold text-lg ml-2">
                    Gerar Certificado
                  </Text>
                </>
              )}
            </Pressable>
          ) : (
            // Botão Iniciar Curso (curso não concluído)
            <Pressable
              className="bg-primary rounded-lg py-4 px-6"
              onPress={() => {
                // Encontrar a primeira aula não concluída ou a primeira aula
                const firstIncompleteLecture =
                  lectures.find((lecture) => !lecture.completed) || lectures[0];
                if (firstIncompleteLecture) {
                  router.push(
                    `/aula/${firstIncompleteLecture._id}?courseId=${courseId}` as any
                  );
                }
              }}
            >
              <Text className="text-white text-center font-semibold text-lg">
                Iniciar Curso
              </Text>
            </Pressable>
          )}
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
