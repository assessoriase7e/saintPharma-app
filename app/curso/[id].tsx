import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Card from "../../components/Card";
import { useApiClient } from "../../services/api";
import { Lecture } from "../../types/api";

interface LectureCardProps {
  lecture: Lecture;
  courseId: string;
  index: number;
}

function LectureCard({ lecture, courseId, index }: LectureCardProps) {
  const handleLecturePress = () => {
    router.push(`/aula/${lecture._id}?courseId=${courseId}` as any);
  };

  const handleQuizPress = () => {
    // Implementar navegação para quiz quando disponível
    console.log("Quiz não implementado ainda");
  };

  return (
    <Card className="mb-4">
      <Pressable onPress={handleLecturePress} className="p-4">
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
    </Card>
  );
}

export default function CourseLessons() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = id || "";
  const [course, setCourse] = useState<any>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar detalhes do curso e aulas
        const [courseResponse, lecturesResponse] = await Promise.all([
          apiClient.getCourseById(courseId),
          apiClient.getLectures(courseId),
        ]);

        setCourse(courseResponse.course);
        setLectures(lecturesResponse.lectures);
      } catch (err) {
        console.error("Erro ao buscar dados do curso:", err);
        setError("Erro ao carregar o curso. Verifique sua conexão.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

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

  const completedLectures = lectures.filter(
    (lecture) => lecture.completed
  ).length;
  const totalLectures = lectures.length;
  const progressPercentage =
    totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;

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

        {/* Botão Iniciar Curso */}
        <View className="mt-6">
          <Pressable
            className="bg-primary rounded-lg py-4 px-6"
            onPress={() => {
              // Encontrar a primeira aula não concluída ou a primeira aula
              const firstIncompleteLecture =
                lectures.find((lecture) => !lecture.completed) || lectures[0];
              if (firstIncompleteLecture) {
                router.push(`/aula/${firstIncompleteLecture._id}` as any);
              }
            }}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Iniciar Curso
            </Text>
          </Pressable>
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
