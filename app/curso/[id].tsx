import React from 'react';
import { Text, View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCourseById } from '../../data/mockData';
import Card from '../../components/Card';
import { Lesson } from '../types/course';

interface LessonCardProps {
  lesson: Lesson;
  courseId: number;
}

function LessonCard({ lesson, courseId }: LessonCardProps) {
  const handleLessonPress = () => {
    router.push(`/aula/${lesson.id}` as any);
  };

  const handleQuizPress = () => {
    if (lesson.quiz) {
      router.push(`/prova/${lesson.quiz.id}` as any);
    }
  };

  return (
    <Card className="mb-4">
      <Pressable onPress={handleLessonPress} className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="text-text-primary text-lg font-semibold mb-1">
              {lesson.ordem}. {lesson.titulo}
            </Text>
            <Text className="text-text-secondary text-sm mb-2">
              {lesson.descricao}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text className="text-text-secondary text-sm ml-1">
                {lesson.duracao}
              </Text>
            </View>
          </View>
          <View className="ml-4">
            {lesson.completed ? (
              <View className="w-8 h-8 bg-secondary rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={20} color="white" />
              </View>
            ) : (
              <View className="w-8 h-8 bg-border rounded-full items-center justify-center">
                <Text className="text-text-secondary text-xs">{lesson.ordem}</Text>
              </View>
            )}
          </View>
        </View>
        
        {lesson.quiz && (
          <View className="mt-3 pt-3 border-t border-border">
            <Pressable 
              onPress={handleQuizPress}
              className="flex-row items-center justify-between p-3 bg-primary/10 rounded-lg"
            >
              <View className="flex-row items-center">
                <Ionicons name="help-circle-outline" size={20} color="#3b82f6" />
                <Text className="text-primary font-medium ml-2">
                  Quiz Disponível
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
            </Pressable>
          </View>
        )}
      </Pressable>
    </Card>
  );
}

export default function CourseLessons() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = parseInt(id || '0');
  const course = getCourseById(courseId);

  if (!course) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-text-primary text-xl font-semibold mt-4 mb-2">
          Curso não encontrado
        </Text>
        <Text className="text-text-secondary text-center mb-6">
          O curso que você está procurando não existe ou foi removido.
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

  const completedLessons = course.lessons.filter(lesson => lesson.completed).length;
  const totalLessons = course.lessons.length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-card border-b border-border px-6 pt-12 pb-6">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </Pressable>
          <Text className="text-text-primary text-xl font-bold flex-1">
            {course.titulo}
          </Text>
        </View>
        
        <Text className="text-text-secondary mb-4">
          {course.descricao}
        </Text>
        
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="bg-primary/20 px-3 py-1 rounded-full mr-3">
              <Text className="text-primary text-sm font-medium">
                {course.nivel}
              </Text>
            </View>
            <View className="bg-secondary/20 px-3 py-1 rounded-full">
              <Text className="text-secondary text-sm font-medium">
                {course.categoria}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text className="text-text-secondary text-sm ml-1">
              {course.duracao}
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
              {completedLessons}/{totalLessons} aulas
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
          Aulas do Curso ({totalLessons})
        </Text>
        
        {course.lessons.map((lesson) => (
          <LessonCard 
            key={lesson.id} 
            lesson={lesson} 
            courseId={courseId}
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
                {totalLessons}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
                <Text className="text-text-secondary ml-2">Aulas Concluídas</Text>
              </View>
              <Text className="text-text-primary font-semibold">
                {completedLessons}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="help-circle-outline" size={20} color="#f59e0b" />
                <Text className="text-text-secondary ml-2">Quizzes Disponíveis</Text>
              </View>
              <Text className="text-text-primary font-semibold">
                {course.lessons.filter(l => l.quiz).length}
              </Text>
            </View>
          </View>
        </Card>
        
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}