import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Card from "../../components/Card";
import { useLives } from "../../contexts/LivesContext";
import { useApiClient } from "../../services/api";

// Interface local para dados completos do exame
interface ExamData {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number; // em minutos
  passingScore?: number;
  questions: {
    id: string;
    question: string;
    points: number;
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
    }[];
  }[];
}

interface QuestionCardProps {
  question: any;
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
          {question.question}
        </Text>

        <View className="space-y-3">
          {question.options?.map((option: any, index: number) => (
            <Pressable
              key={index}
              onPress={() => onAnswerSelect(index.toString())}
              className={`p-4 rounded-lg border-2 ${
                selectedAnswer === index.toString()
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              }`}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                    selectedAnswer === index.toString()
                      ? "border-primary bg-primary"
                      : "border-border"
                  }`}
                >
                  {selectedAnswer === index.toString() && (
                    <View className="w-2 h-2 bg-white rounded-full" />
                  )}
                </View>
                <Text
                  className={`flex-1 ${
                    selectedAnswer === index.toString()
                      ? "text-primary font-medium"
                      : "text-text-primary"
                  }`}
                >
                  {option}
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const examId = id || "";
  const [exam, setExam] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { loseLives } = useLives();
  const apiClient = useApiClient();

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

        // Dados mockados temporários até a API fornecer dados completos
        const mockExamData: ExamData = {
          id: examId,
          title: `Exame da Aula ${examId}`,
          description: "Teste seus conhecimentos sobre o conteúdo da aula",
          timeLimit: 30, // 30 minutos
          passingScore: 70,
          questions: [
            {
              id: "q1",
              question:
                "Qual é a principal função dos medicamentos anti-inflamatórios?",
              points: 10,
              options: [
                {
                  id: "a",
                  text: "Reduzir a inflamação e a dor",
                  isCorrect: true,
                },
                {
                  id: "b",
                  text: "Aumentar a pressão arterial",
                  isCorrect: false,
                },
                {
                  id: "c",
                  text: "Estimular o sistema nervoso",
                  isCorrect: false,
                },
                {
                  id: "d",
                  text: "Reduzir a frequência cardíaca",
                  isCorrect: false,
                },
              ],
            },
            {
              id: "q2",
              question:
                "Qual é a dose recomendada de paracetamol para adultos?",
              points: 10,
              options: [
                { id: "a", text: "500mg a cada 4 horas", isCorrect: false },
                { id: "b", text: "1000mg a cada 6 horas", isCorrect: true },
                { id: "c", text: "250mg a cada 2 horas", isCorrect: false },
                { id: "d", text: "2000mg uma vez ao dia", isCorrect: false },
              ],
            },
            {
              id: "q3",
              question:
                "Quais são os principais efeitos colaterais dos antibióticos?",
              points: 10,
              options: [
                { id: "a", text: "Sonolência e tontura", isCorrect: false },
                { id: "b", text: "Náusea e diarreia", isCorrect: true },
                { id: "c", text: "Aumento do apetite", isCorrect: false },
                { id: "d", text: "Melhora da visão", isCorrect: false },
              ],
            },
          ],
        };

        setExam(mockExamData);
        setTimeLeft(mockExamData.timeLimit! * 60); // Convert minutes to seconds
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
  }, [examId]);

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
  }, [quizStarted, timeLeft]);

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-4">Carregando exame...</Text>
      </View>
    );
  }

  if (error || !exam) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-text-primary text-xl font-semibold mt-4 mb-2">
          Exame não encontrado
        </Text>
        <Text className="text-text-secondary text-center mb-6">
          {error ||
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

  const currentQuestion = exam.questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex] || null;
  const totalQuestions = exam.questions.length;
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

    exam.questions.forEach((question, index) => {
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

    const maxPoints = exam.questions.reduce(
      (sum, q) => sum + (q.points || 1),
      0
    );
    const percentage = (totalPoints / maxPoints) * 100;
    const passed = percentage >= (exam.passingScore || 70);

    return {
      totalPoints,
      maxPoints,
      correctAnswers,
      percentage,
      passed,
      userAnswers,
    };
  };

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

  const submitQuiz = () => {
    const results = calculateResults();
    const endTime = new Date();
    const timeSpent = startTime
      ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
      : 0;

    // Calcular quantas vidas perder baseado nos erros
    const wrongAnswers = totalQuestions - results.correctAnswers;
    if (wrongAnswers > 0) {
      loseLives(
        wrongAnswers,
        `Erros no exame: ${exam.title}`,
        parseInt(exam.id) || undefined
      );
    }

    // Navigate to results screen with results data
    router.push(
      `/resultado/${exam.id}?results=${encodeURIComponent(
        JSON.stringify({
          ...results,
          timeSpent,
          totalQuestions,
          livesLost: wrongAnswers,
        })
      )}` as any
    );
  };

  // Quiz start screen
  if (!quizStarted) {
    return (
      <View className="flex-1 bg-background">
        <View className="bg-card border-b border-border px-6 pt-12 pb-6">
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
      <View className="bg-card border-b border-border px-6 pt-12 pb-4">
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
