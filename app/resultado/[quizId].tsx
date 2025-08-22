import React from 'react';
import { Text, View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getQuizById } from '../../data/mockData';
import Card from '../../components/Card';

interface QuizResults {
  totalPoints: number;
  maxPoints: number;
  correctAnswers: number;
  percentage: number;
  passed: boolean;
  userAnswers: any[];
  timeSpent: number;
  totalQuestions: number;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function ResultHeader({ passed, percentage }: { passed: boolean; percentage: number }) {
  return (
    <Card className="mb-6">
      <View className="p-6 items-center">
        <View className={`p-4 rounded-full mb-4 ${
          passed ? 'bg-secondary/20' : 'bg-red-500/20'
        }`}>
          <Ionicons 
            name={passed ? 'checkmark-circle' : 'close-circle'} 
            size={64} 
            color={passed ? '#10b981' : '#ef4444'} 
          />
        </View>
        
        <Text className={`text-2xl font-bold mb-2 ${
          passed ? 'text-secondary' : 'text-red-500'
        }`}>
          {passed ? 'Parabéns!' : 'Não foi dessa vez!'}
        </Text>
        
        <Text className="text-text-secondary text-center mb-4">
          {passed 
            ? 'Você foi aprovado no quiz!' 
            : 'Você não atingiu a nota mínima necessária.'}
        </Text>
        
        <View className={`px-6 py-3 rounded-full ${
          passed ? 'bg-secondary' : 'bg-red-500'
        }`}>
          <Text className="text-white text-xl font-bold">
            {Math.round(percentage)}%
          </Text>
        </View>
      </View>
    </Card>
  );
}

function StatCard({ icon, label, value, color = '#6b7280' }: {
  icon: string;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View className="bg-card border border-border rounded-lg p-4 flex-1">
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon as any} size={20} color={color} />
        <Text className="text-text-secondary text-sm ml-2">{label}</Text>
      </View>
      <Text className="text-text-primary text-lg font-bold">{value}</Text>
    </View>
  );
}

function PerformanceBreakdown({ results, quiz }: { results: QuizResults; quiz: any }) {
  const { correctAnswers, totalQuestions, percentage, passed } = results;
  
  return (
    <Card className="mb-6">
      <View className="p-6">
        <Text className="text-text-primary text-lg font-semibold mb-4">
          Desempenho Detalhado
        </Text>
        
        <View className="space-y-4">
          {/* Score Progress */}
          <View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-text-secondary">Pontuação</Text>
              <Text className="text-text-primary font-semibold">
                {results.totalPoints}/{results.maxPoints} pontos
              </Text>
            </View>
            <View className="h-3 bg-border rounded-full overflow-hidden">
              <View 
                className={`h-full rounded-full ${
                  passed ? 'bg-secondary' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </View>
          </View>
          
          {/* Passing Score Line */}
          <View className="flex-row items-center justify-between p-3 bg-background rounded-lg">
            <Text className="text-text-secondary">Nota Mínima Necessária</Text>
            <Text className="text-text-primary font-semibold">
              {quiz.passingScore}%
            </Text>
          </View>
          
          {/* Performance Message */}
          <View className={`p-4 rounded-lg ${
            passed ? 'bg-secondary/10' : 'bg-red-500/10'
          }`}>
            <Text className={`font-medium ${
              passed ? 'text-secondary' : 'text-red-500'
            }`}>
              {passed 
                ? `Excelente! Você superou a nota mínima por ${Math.round(percentage - quiz.passingScore)} pontos.`
                : `Você ficou ${Math.round(quiz.passingScore - percentage)} pontos abaixo da nota mínima.`
              }
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

function ActionButtons({ passed, quizId }: { passed: boolean; quizId: number }) {
  const handleRetakeQuiz = () => {
    router.push(`/prova/${quizId}` as any);
  };
  
  const handleBackToLesson = () => {
    router.back();
  };
  
  const handleBackToCourse = () => {
    // Navigate back to course - you might need to pass courseId
    router.push('/' as any);
  };
  
  return (
    <View className="space-y-3">
      {!passed && (
        <Pressable 
          onPress={handleRetakeQuiz}
          className="bg-primary px-6 py-4 rounded-lg flex-row items-center justify-center"
        >
          <Ionicons name="refresh" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">
            Tentar Novamente
          </Text>
        </Pressable>
      )}
      
      <Pressable 
        onPress={handleBackToLesson}
        className="bg-card border border-border px-6 py-4 rounded-lg flex-row items-center justify-center"
      >
        <Ionicons name="book-outline" size={20} color="#3b82f6" />
        <Text className="text-primary font-semibold ml-2">
          Voltar à Aula
        </Text>
      </Pressable>
      
      <Pressable 
        onPress={handleBackToCourse}
        className="bg-card border border-border px-6 py-4 rounded-lg flex-row items-center justify-center"
      >
        <Ionicons name="library-outline" size={20} color="#6b7280" />
        <Text className="text-text-secondary font-medium ml-2">
          Voltar ao Curso
        </Text>
      </Pressable>
    </View>
  );
}

export default function QuizResult() {
  const { quizId, results: resultsParam } = useLocalSearchParams<{ 
    quizId: string; 
    results: string; 
  }>();
  
  const quiz = getQuizById(parseInt(quizId || '0'));
  const results: QuizResults = resultsParam ? JSON.parse(resultsParam) : null;
  
  if (!quiz || !results) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-text-primary text-xl font-semibold mt-4 mb-2">
          Resultado não encontrado
        </Text>
        <Text className="text-text-secondary text-center mb-6">
          Não foi possível carregar o resultado do quiz.
        </Text>
        <Pressable 
          onPress={() => router.push('/' as any)}
          className="bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Voltar ao Início</Text>
        </Pressable>
      </View>
    );
  }
  
  const { correctAnswers, totalQuestions, percentage, passed, timeSpent } = results;
  
  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-card border-b border-border px-6 pt-12 pb-6">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </Pressable>
          <Text className="text-text-primary text-xl font-bold flex-1">
            Resultado do Quiz
          </Text>
        </View>
        
        <Text className="text-text-secondary">
          {quiz.titulo}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        <ResultHeader passed={passed} percentage={percentage} />
        
        {/* Statistics */}
        <View className="flex-row space-x-3 mb-6">
          <StatCard 
            icon="checkmark-circle-outline" 
            label="Acertos" 
            value={`${correctAnswers}/${totalQuestions}`}
            color="#10b981"
          />
          <StatCard 
            icon="time-outline" 
            label="Tempo" 
            value={formatTime(timeSpent)}
            color="#f59e0b"
          />
        </View>
        
        <PerformanceBreakdown results={results} quiz={quiz} />
        
        {/* Motivational Message */}
        <Card className="mb-6">
          <View className="p-6">
            <View className="flex-row items-center mb-3">
              <Ionicons 
                name={passed ? "trophy-outline" : "bulb-outline"} 
                size={24} 
                color={passed ? "#10b981" : "#f59e0b"} 
              />
              <Text className="text-text-primary text-lg font-semibold ml-2">
                {passed ? 'Conquista Desbloqueada!' : 'Dicas para Melhorar'}
              </Text>
            </View>
            
            <Text className="text-text-secondary leading-6">
              {passed 
                ? 'Parabéns por completar este quiz com sucesso! Continue estudando para manter seu conhecimento sempre atualizado.'
                : 'Não desanime! Revise o conteúdo da aula e tente novamente. Cada tentativa é uma oportunidade de aprender mais.'
              }
            </Text>
          </View>
        </Card>
        
        <ActionButtons passed={passed} quizId={parseInt(quizId || '0')} />
        
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}