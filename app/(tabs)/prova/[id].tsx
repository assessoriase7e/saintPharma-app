import Card from "@/components/Card";
import { examsService } from "@/services";
import { useLives } from "@/stores";
import { Question } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LivesBlockedModal } from "../vidas-bloqueadas";

// Interface local para dados completos do exame
interface ExamData {
  id: string;
  lectureCMSid: string;
  complete: boolean;
  reproved: boolean;
  userId: string;
  createdAt: string;
  // Campos adicionais para a interface do quiz
  title?: string;
  description?: string;
  timeLimit?: number; // em minutos
  passingScore?: number;
  questions?: Question[];
}

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | null;
  onAnswerSelect: (optionId: string) => void;
  questionNumber: number;
  totalQuestions: number;
}

function QuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  return (
    <Card className="mb-6">
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-primary font-semibold">
            Questão {questionNumber} de {totalQuestions}
          </Text>
          <View className="bg-primary/10 px-3 py-1 rounded-full">
            <Text className="text-primary text-sm font-medium">
              {question.points || 1} pts
            </Text>
          </View>
        </View>

        <Text className="text-text-primary text-lg font-medium mb-6 leading-6">
          {question.text}
        </Text>

        <View className="space-y-3">
          {question.options?.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => onAnswerSelect(option.id)}
              className={`p-4 rounded-lg border-2 ${
                selectedAnswer === option.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              }`}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                    selectedAnswer === option.id
                      ? "border-primary bg-primary"
                      : "border-border"
                  }`}
                >
                  {selectedAnswer === option.id && (
                    <View className="w-2 h-2 bg-white rounded-full" />
                  )}
                </View>
                <Text
                  className={`flex-1 ${
                    selectedAnswer === option.id
                      ? "text-primary font-medium"
                      : "text-text-primary"
                  }`}
                >
                  {option.text}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </Card>
  );
}

interface TimerProps {
  timeLeft: number;
  totalTime: number;
}

function Timer({ timeLeft, totalTime }: TimerProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / totalTime) * 100;

  const getTimerColor = () => {
    if (percentage > 50) return "#10b981"; // green
    if (percentage > 25) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  return (
    <View className="bg-card border border-border rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-text-secondary font-medium">Tempo Restante</Text>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={16} color={getTimerColor()} />
          <Text className="ml-1 font-bold" style={{ color: getTimerColor() }}>
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </Text>
        </View>
      </View>
      <View className="h-2 bg-border rounded-full overflow-hidden">
        <View
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${percentage}%`,
            backgroundColor: getTimerColor(),
          }}
        />
      </View>
    </View>
  );
}

export default function ExamScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
    lectureId?: string;
    courseId?: string;
  }>();
  const examId = id || "";
  const insets = useSafeAreaInsets();
  const [exam, setExam] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { loseLives, userLives } = useLives();
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionIndex: number]: string }>(
    {}
  );
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        setError(null);
        setEligibilityError(null);

        // ✅ VERIFICAR ELEGIBILIDADE PRIMEIRO (se usuário tem vidas)
        console.log(
          "🔍 [ExamScreen] Verificando elegibilidade para iniciar prova..."
        );
        try {
          const eligibilityResponse = await examsService.checkExamEligibility();
          const canTake = eligibilityResponse.data?.canTakeExam || false;
          const remainingLives = eligibilityResponse.data?.remainingLives || 0;

          console.log(
            `📊 [ExamScreen] Elegibilidade: ${canTake}, Vidas restantes: ${remainingLives}`
          );

          if (!canTake) {
            setEligibilityError(
              `Você não pode iniciar esta prova. Vidas restantes: ${remainingLives}`
            );
            setShowBlockedModal(true);
            setLoading(false);
            return;
          }
        } catch (eligibilityErr) {
          console.warn(
            "⚠️ [ExamScreen] Erro ao verificar elegibilidade (prosseguindo):",
            eligibilityErr
          );
          // Prosseguir mesmo assim, usar estado local
          if (userLives.currentLives === 0) {
            setEligibilityError(
              "Você não possui vidas disponíveis para iniciar esta prova."
            );
            setShowBlockedModal(true);
            setLoading(false);
            return;
          }
        }

        // Buscar dados do exame e questões via API
        const examResponse = await examsService.getExam(examId);
        const examData = examResponse.data.exam;

        // Buscar questões do exame via API
        const questionsResponse = await examsService.getExamQuestions(examId);
        const examWithQuestions = questionsResponse.data.exam;

        if (examData && examWithQuestions) {
          // Transformar questões da API para o formato usado no frontend
          const transformedQuestions: Question[] =
            examWithQuestions.questions.map((q: any, index: number) => ({
              id: q.id || String(index),
              text: q.question || q.title || "",
              options: q.answers.map((answer: any, optIndex: number) => ({
                id: answer.id || String(optIndex),
                text: answer.answer || "",
                isCorrect: answer.isCorrect || false,
              })),
              points: 1, // Valor padrão, pode ser ajustado
            }));

          // Criar objeto compatível com ExamData
          const fullExamData: ExamData = {
            ...examData,
            title: "Exame da Aula",
            description: "Teste seus conhecimentos sobre esta aula",
            timeLimit: examWithQuestions.timeLimit || examData.timeLimit || 30,
            passingScore:
              examWithQuestions.passingScore || examData.passingScore || 70,
            questions: transformedQuestions,
          };

          setExam(fullExamData);

          if (fullExamData.timeLimit) {
            setTimeLeft(fullExamData.timeLimit * 60);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar dados do exame:", err);
        setError("Erro ao carregar o exame. Verifique sua conexão.");
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExam();
    }
  }, [examId, userLives.currentLives]);

  const handleSubmitQuiz = () => {
    if (answeredQuestions < totalQuestions) {
      Alert.alert(
        "Quiz Incompleto",
        `Você respondeu ${answeredQuestions} de ${totalQuestions} questões. Deseja continuar mesmo assim?`,
        [
          { text: "Continuar Respondendo", style: "cancel" },
          { text: "Finalizar Mesmo Assim", onPress: submitQuiz },
        ]
      );
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    const results = calculateResults();
    const endTime = new Date();
    const timeSpent = startTime
      ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
      : 0;

    try {
      // Preparar respostas no formato esperado pela API
      const submitAnswers =
        exam?.questions?.map((question, index) => {
          const selectedOptionId = answers[index];
          return {
            questionId: question.id,
            selectedAnswer: selectedOptionId || "",
          };
        }) || [];

      // Submeter resultados via API
      const submitResponse = await examsService.submitExam(examId, {
        answers: submitAnswers,
        timeSpent: timeSpent,
      });

      // ✅ Calcular vidas a perder com limite máximo de 3
      const wrongAnswers = totalQuestions - results.correctAnswers;
      const MAX_LIVES_PER_EXAM = 3;
      const livesToLose = Math.min(wrongAnswers, MAX_LIVES_PER_EXAM);

      let livesLostInAttempt = 0;

      if (livesToLose > 0) {
        try {
          console.log(
            `📊 [ExamScreen] Erros: ${wrongAnswers}, Vidas a perder: ${livesToLose} (máx: ${MAX_LIVES_PER_EXAM})`
          );
          await loseLives(
            livesToLose,
            `Erros no exame: ${exam?.title || "Exame"} (${wrongAnswers} erros)`,
            parseInt(exam?.id || "") || undefined
          );
          livesLostInAttempt = livesToLose;
          console.log("✅ Vidas removidas com sucesso");
        } catch (lossError) {
          console.error("❌ Erro ao remover vidas:", lossError);
          Alert.alert(
            "Aviso",
            "Não foi possível registrar a perda de vidas. Tente novamente.",
            [
              { text: "Tentar Novamente", onPress: submitQuiz },
              { text: "Cancelar" },
            ]
          );
          return;
        }
      }

      // Navigate to results screen with results data
      router.push(
        `/resultado/${exam?.id}?results=${encodeURIComponent(
          JSON.stringify({
            ...results,
            timeSpent,
            totalQuestions,
            livesLost: livesLostInAttempt,
            wrongAnswers: wrongAnswers,
            maxLivesLostPerExam: MAX_LIVES_PER_EXAM,
          })
        )}` as any
      );
    } catch (err) {
      console.error("Erro ao submeter exame:", err);
      Alert.alert("Erro", "Erro ao submeter exame. Tente novamente.", [
        { text: "OK" },
      ]);
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (quizStarted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [quizStarted, timeLeft, handleSubmitQuiz]);

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-4">Carregando exame...</Text>
      </View>
    );
  }

  // Mostrar modal se usuário não tem vidas
  if (showBlockedModal) {
    return (
      <>
        <LivesBlockedModal
          visible={showBlockedModal}
          onClose={() => {
            setShowBlockedModal(false);
            router.back();
          }}
        />
      </>
    );
  }

  if (error || !exam) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-text-primary text-xl font-semibold mt-4 mb-2">
          {eligibilityError ? "Acesso Bloqueado" : "Exame não encontrado"}
        </Text>
        <Text className="text-text-secondary text-center mb-6">
          {eligibilityError ||
            error ||
            "O exame que você está procurando não existe ou foi removido."}
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

  const currentQuestion = exam?.questions?.[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex] || null;
  const totalQuestions = exam?.questions?.length || 0;
  const answeredQuestions = Object.keys(answers).length;

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setStartTime(new Date());
  };

  const handleAnswerSelect = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionId,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const calculateResults = () => {
    let totalPoints = 0;
    let correctAnswers = 0;
    const userAnswers: any[] = [];

    exam?.questions?.forEach((question, index) => {
      const selectedOptionId = answers[index];
      const selectedOption = question.options.find(
        (opt) => opt.id === selectedOptionId
      );
      const isCorrect = selectedOption?.isCorrect || false;
      const points = isCorrect ? question.points || 1 : 0;

      totalPoints += points;
      if (isCorrect) correctAnswers++;

      userAnswers.push({
        questionIndex: index,
        selectedOptionId: selectedOptionId || "",
        isCorrect,
        points: points,
      });
    });

    const maxPoints =
      exam?.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0;
    const percentage = (totalPoints / maxPoints) * 100;
    const passed = percentage >= (exam?.passingScore || 70);

    return {
      totalPoints,
      maxPoints,
      correctAnswers,
      percentage,
      passed,
      userAnswers,
    };
  };

  // Quiz start screen
  if (!quizStarted) {
    return (
      <View className="flex-1 bg-background">
        <View
          className="bg-card border-b border-border px-6 pb-6"
          style={{ paddingTop: insets.top + 12 }}
        >
          <View className="flex-row items-center mb-4">
            <Pressable onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#3b82f6" />
            </Pressable>
            <Text className="text-text-primary text-xl font-bold flex-1">
              {exam.title}
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          <Card>
            <View className="p-6">
              <View className="items-center mb-6">
                <View className="bg-primary/10 p-4 rounded-full mb-4">
                  <Ionicons
                    name="help-circle-outline"
                    size={48}
                    color="#3b82f6"
                  />
                </View>
                <Text className="text-text-primary text-2xl font-bold mb-2">
                  Pronto para o Quiz?
                </Text>
                <Text className="text-text-secondary text-center">
                  {exam.description}
                </Text>
              </View>

              <View className="space-y-4 mb-6">
                <View className="flex-row items-center justify-between p-4 bg-background rounded-lg">
                  <View className="flex-row items-center">
                    <Ionicons name="help-outline" size={20} color="#6b7280" />
                    <Text className="text-text-secondary ml-2">Questões</Text>
                  </View>
                  <Text className="text-text-primary font-semibold">
                    {totalQuestions}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between p-4 bg-background rounded-lg">
                  <View className="flex-row items-center">
                    <Ionicons name="trophy-outline" size={20} color="#6b7280" />
                    <Text className="text-text-secondary ml-2">
                      Nota Mínima
                    </Text>
                  </View>
                  <Text className="text-text-primary font-semibold">
                    {exam.passingScore || 70}%
                  </Text>
                </View>

                {exam.timeLimit && (
                  <View className="flex-row items-center justify-between p-4 bg-background rounded-lg">
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={20} color="#6b7280" />
                      <Text className="text-text-secondary ml-2">
                        Tempo Limite
                      </Text>
                    </View>
                    <Text className="text-text-primary font-semibold">
                      {exam.timeLimit} min
                    </Text>
                  </View>
                )}
              </View>

              <Pressable
                onPress={handleStartQuiz}
                className="bg-primary px-6 py-4 rounded-lg flex-row items-center justify-center"
              >
                <Ionicons name="play" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Iniciar Quiz
                </Text>
              </Pressable>
            </View>
          </Card>
        </ScrollView>
      </View>
    );
  }

  // Quiz in progress
  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="bg-card border-b border-border px-6 pb-4"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-text-primary text-lg font-bold">
            {exam.title}
          </Text>
          <Text className="text-text-secondary">
            {answeredQuestions}/{totalQuestions}
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="mb-3">
          <View className="h-2 bg-border rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{
                width: `${(currentQuestionIndex / totalQuestions) * 100}%`,
              }}
            />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {exam.timeLimit && (
          <Timer timeLeft={timeLeft} totalTime={exam.timeLimit * 60} />
        )}

        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={totalQuestions}
          />
        )}

        {/* Navigation Buttons */}
        <View className="flex-row justify-between items-center mt-6">
          <Pressable
            onPress={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-lg flex-row items-center ${
              currentQuestionIndex === 0
                ? "bg-border"
                : "bg-card border border-border"
            }`}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentQuestionIndex === 0 ? "#9ca3af" : "#3b82f6"}
            />
            <Text
              className={`ml-1 ${
                currentQuestionIndex === 0
                  ? "text-text-secondary"
                  : "text-primary font-medium"
              }`}
            >
              Anterior
            </Text>
          </Pressable>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Pressable
              onPress={handleSubmitQuiz}
              className="bg-secondary px-6 py-3 rounded-lg flex-row items-center"
            >
              <Text className="text-white font-semibold mr-1">Finalizar</Text>
              <Ionicons name="checkmark" size={20} color="white" />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleNextQuestion}
              className="bg-primary px-6 py-3 rounded-lg flex-row items-center"
            >
              <Text className="text-white font-medium mr-1">Próxima</Text>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </Pressable>
          )}
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
