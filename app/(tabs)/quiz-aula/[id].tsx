import Card from "@/components/Card";
import { lecturesService } from "@/services";
import { Question } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Interface local para dados completos do quiz
interface QuizData {
  lectureId: string;
  title?: string;
  description?: string;
  timeLimit?: number; // em minutos
  passingScore?: number;
  questions?: Question[];
  totalQuestions: number;
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

        <View className="flex-col gap-3">
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

export default function LectureQuizScreen() {
  const { id, courseId } = useLocalSearchParams<{
    id: string;
    courseId?: string;
  }>();
  const lectureId = id || "";
  const insets = useSafeAreaInsets();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionIndex: number]: string }>(
    {}
  );
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar questões do quiz via API
        const quizResponse = await lecturesService.getLectureQuestions(lectureId);
        console.log("🔍 [LectureQuiz] Quiz Response:", quizResponse);

        if (quizResponse && quizResponse.data) {
          // Transformar questões da API para o formato usado no frontend
          const transformedQuestions: Question[] =
            quizResponse.data.questions.map((q: any, index: number) => ({
              id: String(index),
              text: q.question || q.title || "",
              options: q.answers.map((answer: any, optIndex: number) => ({
                id: String(optIndex),
                text: answer.answer || "",
                isCorrect: answer.isCorrect || false,
              })),
              points: 1, // Valor padrão
            }));

          const quizData: QuizData = {
            lectureId,
            title: "Quiz da Aula",
            description: "Teste seus conhecimentos sobre esta aula",
            timeLimit: quizResponse.data.timeLimit || 30,
            passingScore: quizResponse.data.passingScore || 70,
            questions: transformedQuestions,
            totalQuestions: quizResponse.data.totalQuestions || transformedQuestions.length,
          };

          setQuiz(quizData);

          if (quizData.timeLimit) {
            setTimeLeft(quizData.timeLimit * 60);
          }
        } else {
          throw new Error("Questões do quiz não encontradas");
        }
      } catch (err) {
        console.error("Erro ao buscar dados do quiz:", err);
        setError("Erro ao carregar o quiz. Verifique sua conexão.");
      } finally {
        setLoading(false);
      }
    };

    if (lectureId) {
      fetchQuiz();
    }
  }, [lectureId]);

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
      console.log(
        `📊 [LectureQuiz] Quiz finalizado com ${results.correctAnswers}/${totalQuestions} acertos (${results.score}%)`
      );

      // Verificar se passou no quiz
      const passed = results.score >= (quiz?.passingScore || 70);

      if (passed && courseId) {
        // Se passou, marcar a aula como completa
        await lecturesService.completeLecture(lectureId, { courseId });

        Alert.alert(
          "Parabéns! 🎉",
          `Você passou no quiz com ${results.score}% de aproveitamento!\n\nAula marcada como concluída.`,
          [
            {
              text: "Continuar",
              onPress: () => {
                router.push(`/curso/${courseId}` as any);
              },
            },
          ]
        );
      } else {
        // Se não passou, mostrar resultado mas não marca como completa
        Alert.alert(
          "Quiz Finalizado",
          `Você obteve ${results.score}% de aproveitamento.\n\nÉ necessário ${quiz?.passingScore || 70}% para passar.\n\nTente novamente!`,
          [
            {
              text: "Tentar Novamente",
              onPress: () => {
                // Resetar quiz
                setCurrentQuestionIndex(0);
                setAnswers({});
                setQuizStarted(false);
                setStartTime(null);
                if (quiz?.timeLimit) {
                  setTimeLeft(quiz.timeLimit * 60);
                }
              },
            },
            {
              text: "Voltar",
              onPress: () => {
                router.back();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Erro ao processar resultado do quiz:", error);
      Alert.alert(
        "Erro",
        "Não foi possível processar o resultado do quiz. Tente novamente.",
        [{ text: "OK" }]
      );
    }
  };

  const calculateResults = () => {
    let correctAnswers = 0;
    quiz?.questions?.forEach((question, index) => {
      const selectedOptionId = answers[index];
      const selectedOption = question.options.find(
        (opt) => opt.id === selectedOptionId
      );
      if (selectedOption?.isCorrect) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    return { correctAnswers, totalQuestions, score };
  };

  const handleStartQuiz = useCallback(() => {
    setQuizStarted(true);
    setStartTime(new Date());
  }, []);

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
        <Text className="text-text-secondary mt-4">Carregando quiz...</Text>
      </View>
    );
  }

  if (error || !quiz) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-text-primary text-xl font-semibold mt-4 mb-2">
          Quiz não encontrado
        </Text>
        <Text className="text-text-secondary text-center mb-6">
          {error ||
            "O quiz que você está procurando não existe ou foi removido."}
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

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex] || null;
  const totalQuestions = quiz?.questions?.length || 0;
  const answeredQuestions = Object.keys(answers).length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const totalTime = (quiz?.timeLimit || 30) * 60;

  // Se o quiz não foi iniciado ainda, mostrar tela de instruções
  if (!quizStarted) {
    return (
      <View className="flex-1 bg-background">
        {/* Header */}
        <View
          className="bg-card border-b border-border px-5 py-2"
          style={{ paddingTop: insets.top + 8 }}
        >
          <View className="flex-row items-center">
            <Pressable onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#3b82f6" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-text-primary text-lg font-bold">
                {quiz.title || "Quiz da Aula"}
              </Text>
              <Text className="text-text-secondary text-sm">
                {quiz.description || "Teste seus conhecimentos"}
              </Text>
            </View>
          </View>
        </View>

        {/* Instruções */}
        <ScrollView className="flex-1 px-4 py-6">
          <Card className="mb-6">
            <View className="p-6">
              <View className="items-center mb-6">
                <View className="bg-primary/10 rounded-full p-4 mb-4">
                  <Ionicons name="help-circle" size={48} color="#3b82f6" />
                </View>
                <Text className="text-text-primary text-2xl font-bold mb-2">
                  Pronto para começar?
                </Text>
                <Text className="text-text-secondary text-center">
                  Leia as instruções abaixo antes de iniciar
                </Text>
              </View>

              <View className="mb-6">
                <View className="flex-row items-start mb-4">
                  <View className="bg-primary rounded-full p-2 mr-3">
                    <Ionicons name="document-text" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary font-semibold mb-1">
                      Total de Questões
                    </Text>
                    <Text className="text-text-secondary">
                      {totalQuestions} questões no total
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start mb-4">
                  <View className="bg-primary rounded-full p-2 mr-3">
                    <Ionicons name="time" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary font-semibold mb-1">
                      Tempo Limite
                    </Text>
                    <Text className="text-text-secondary">
                      {quiz.timeLimit} minutos para completar
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start mb-4">
                  <View className="bg-primary rounded-full p-2 mr-3">
                    <Ionicons name="trophy" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary font-semibold mb-1">
                      Nota Mínima
                    </Text>
                    <Text className="text-text-secondary">
                      {quiz.passingScore}% para aprovação
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start">
                  <View className="bg-primary rounded-full p-2 mr-3">
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary font-semibold mb-1">
                      Conclusão da Aula
                    </Text>
                    <Text className="text-text-secondary">
                      A aula será marcada como concluída após aprovação
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <View className="flex-row items-start">
                  <Ionicons name="warning" size={20} color="#eab308" />
                  <Text className="text-yellow-600 ml-2 flex-1">
                    O cronômetro iniciará assim que você clicar em "Iniciar
                    Quiz". Certifique-se de estar pronto!
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          <Pressable
            onPress={handleStartQuiz}
            className="bg-primary rounded-lg py-4 px-6 flex-row items-center justify-center mb-6"
          >
            <Ionicons name="play-circle" size={24} color="white" />
            <Text className="text-white text-center font-semibold text-lg ml-2">
              Iniciar Quiz
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // Se não há questão atual, mostrar erro
  if (!currentQuestion) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-text-primary text-xl font-semibold mt-4 mb-2">
          Questão não encontrada
        </Text>
        <Text className="text-text-secondary text-center mb-6">
          Não foi possível carregar a questão atual.
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

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="bg-card border-b border-border px-5 py-2"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-text-primary text-lg font-bold">
              Quiz da Aula
            </Text>
            <Text className="text-text-secondary text-sm">
              {answeredQuestions} de {totalQuestions} respondidas
            </Text>
          </View>
          <View className="bg-primary/10 px-3 py-1 rounded-full">
            <Text className="text-primary font-semibold">
              {currentQuestionIndex + 1}/{totalQuestions}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-6">
        <Timer timeLeft={timeLeft} totalTime={totalTime} />

        <QuestionCard
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={(optionId) => {
            setAnswers((prev) => ({
              ...prev,
              [currentQuestionIndex]: optionId,
            }));
          }}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
        />

        {/* Navigation Buttons */}
        <View className="flex-row gap-3 mb-6">
          {currentQuestionIndex > 0 && (
            <Pressable
              onPress={() => setCurrentQuestionIndex((prev) => prev - 1)}
              className="flex-1 bg-card border border-border rounded-lg py-4 px-6 flex-row items-center justify-center"
            >
              <Ionicons name="chevron-back" size={20} color="#3b82f6" />
              <Text className="text-primary font-semibold ml-2">Anterior</Text>
            </Pressable>
          )}

          {!isLastQuestion ? (
            <Pressable
              onPress={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="flex-1 bg-primary rounded-lg py-4 px-6 flex-row items-center justify-center"
            >
              <Text className="text-white font-semibold mr-2">Próxima</Text>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSubmitQuiz}
              className="flex-1 bg-secondary rounded-lg py-4 px-6 flex-row items-center justify-center"
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Finalizar</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}


