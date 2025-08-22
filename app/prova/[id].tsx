import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getQuizById } from '../../data/mockData';
import Card from '../../components/Card';
import { Question, QuestionOption, UserAnswer, QuizAttempt } from '../types/course';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | null;
  onAnswerSelect: (optionId: string) => void;
  questionNumber: number;
  totalQuestions: number;
}

function QuestionCard({ question, selectedAnswer, onAnswerSelect, questionNumber, totalQuestions }: QuestionCardProps) {
  return (
    <Card className="mb-6">
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-primary font-semibold">
            Questão {questionNumber} de {totalQuestions}
          </Text>
          <View className="bg-primary/10 px-3 py-1 rounded-full">
            <Text className="text-primary text-sm font-medium">
              {question.pontos} pts
            </Text>
          </View>
        </View>
        
        <Text className="text-text-primary text-lg font-medium mb-6 leading-6">
          {question.pergunta}
        </Text>
        
        <View className="space-y-3">
          {question.opcoes.map((opcao) => (
            <Pressable
              key={opcao.id}
              onPress={() => onAnswerSelect(opcao.id)}
              className={`p-4 rounded-lg border-2 ${
                selectedAnswer === opcao.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card'
              }`}
            >
              <View className="flex-row items-center">
                <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                  selectedAnswer === opcao.id
                    ? 'border-primary bg-primary'
                    : 'border-border'
                }`}>
                  {selectedAnswer === opcao.id && (
                    <View className="w-2 h-2 bg-white rounded-full" />
                  )}
                </View>
                <Text className={`flex-1 ${
                  selectedAnswer === opcao.id
                    ? 'text-primary font-medium'
                    : 'text-text-primary'
                }`}>
                  {opcao.texto}
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
    if (percentage > 50) return '#10b981'; // green
    if (percentage > 25) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <View className="bg-card border border-border rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-text-secondary font-medium">Tempo Restante</Text>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={16} color={getTimerColor()} />
          <Text className="ml-1 font-bold" style={{ color: getTimerColor() }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
        </View>
      </View>
      <View className="h-2 bg-border rounded-full overflow-hidden">
        <View 
          className="h-full rounded-full transition-all duration-1000"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: getTimerColor()
          }}
        />
      </View>
    </View>
  );
}

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quizId = parseInt(id || '0');
  const quiz = getQuizById(quizId);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (quiz?.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
    }
  }, [quiz]);

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

  if (!quiz) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-text-primary text-xl font-semibold mt-4 mb-2">
          Quiz não encontrado
        </Text>
        <Text className="text-text-secondary text-center mb-6">
          O quiz que você está procurando não existe ou foi removido.
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

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestion?.id] || null;
  const totalQuestions = quiz.questions.length;
  const answeredQuestions = Object.keys(answers).length;

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setStartTime(new Date());
  };

  const handleAnswerSelect = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    let totalPoints = 0;
    let correctAnswers = 0;
    const userAnswers: UserAnswer[] = [];

    quiz.questions.forEach(question => {
      const selectedOptionId = answers[question.id];
      const isCorrect = selectedOptionId === question.respostaCorreta;
      const points = isCorrect ? question.pontos : 0;
      
      totalPoints += points;
      if (isCorrect) correctAnswers++;
      
      userAnswers.push({
        questionId: question.id,
        selectedOptionId: selectedOptionId || '',
        isCorrect,
        pontos: points
      });
    });

    const maxPoints = quiz.questions.reduce((sum, q) => sum + q.pontos, 0);
    const percentage = (totalPoints / maxPoints) * 100;
    const passed = percentage >= quiz.passingScore;
    
    return {
      totalPoints,
      maxPoints,
      correctAnswers,
      percentage,
      passed,
      userAnswers
    };
  };

  const handleSubmitQuiz = () => {
    if (answeredQuestions < totalQuestions) {
      Alert.alert(
        'Quiz Incompleto',
        `Você respondeu ${answeredQuestions} de ${totalQuestions} questões. Deseja continuar mesmo assim?`,
        [
          { text: 'Continuar Respondendo', style: 'cancel' },
          { text: 'Finalizar Mesmo Assim', onPress: submitQuiz }
        ]
      );
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = () => {
    const results = calculateResults();
    const endTime = new Date();
    const timeSpent = startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0;
    
    // Navigate to results screen with results data
    router.push(`/resultado/${quiz.id}?results=${encodeURIComponent(JSON.stringify({
      ...results,
      timeSpent,
      totalQuestions
    }))}` as any);
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
              {quiz.titulo}
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          <Card>
            <View className="p-6">
              <View className="items-center mb-6">
                <View className="bg-primary/10 p-4 rounded-full mb-4">
                  <Ionicons name="help-circle-outline" size={48} color="#3b82f6" />
                </View>
                <Text className="text-text-primary text-2xl font-bold mb-2">
                  Pronto para o Quiz?
                </Text>
                <Text className="text-text-secondary text-center">
                  {quiz.descricao}
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
                    <Text className="text-text-secondary ml-2">Nota Mínima</Text>
                  </View>
                  <Text className="text-text-primary font-semibold">
                    {quiz.passingScore}%
                  </Text>
                </View>
                
                {quiz.timeLimit && (
                  <View className="flex-row items-center justify-between p-4 bg-background rounded-lg">
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={20} color="#6b7280" />
                      <Text className="text-text-secondary ml-2">Tempo Limite</Text>
                    </View>
                    <Text className="text-text-primary font-semibold">
                      {quiz.timeLimit} min
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
            {quiz.titulo}
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
              style={{ width: `${(currentQuestionIndex / totalQuestions) * 100}%` }}
            />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {quiz.timeLimit && (
          <Timer timeLeft={timeLeft} totalTime={quiz.timeLimit * 60} />
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
                ? 'bg-border' 
                : 'bg-card border border-border'
            }`}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={currentQuestionIndex === 0 ? '#9ca3af' : '#3b82f6'} 
            />
            <Text className={`ml-1 ${
              currentQuestionIndex === 0 
                ? 'text-text-secondary' 
                : 'text-primary font-medium'
            }`}>
              Anterior
            </Text>
          </Pressable>
          
          {currentQuestionIndex === totalQuestions - 1 ? (
            <Pressable 
              onPress={handleSubmitQuiz}
              className="bg-secondary px-6 py-3 rounded-lg flex-row items-center"
            >
              <Text className="text-white font-semibold mr-1">
                Finalizar
              </Text>
              <Ionicons name="checkmark" size={20} color="white" />
            </Pressable>
          ) : (
            <Pressable 
              onPress={handleNextQuestion}
              className="bg-primary px-6 py-3 rounded-lg flex-row items-center"
            >
              <Text className="text-white font-medium mr-1">
                Próxima
              </Text>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </Pressable>
          )}
        </View>
        
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}