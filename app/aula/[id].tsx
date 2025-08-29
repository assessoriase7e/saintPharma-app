import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import Card from "../../components/Card";
import { useApiClient } from "../../services/api";
import { Lecture } from "../../types/api";

const { width: screenWidth } = Dimensions.get("window");

function LectureContentRenderer({ lecture }: { lecture: Lecture }) {
  const [videoError, setVideoError] = useState(false);

  if (lecture.videoUrl) {
    if (videoError) {
      return (
        <View
          className="bg-border rounded-lg p-6 mb-4 items-center justify-center"
          style={{ height: 200 }}
        >
          <Ionicons name="play-circle-outline" size={48} color="#6b7280" />
          <Text className="text-text-secondary mt-2 text-center">
            Erro ao carregar vídeo
          </Text>
        </View>
      );
    }

    return (
      <View className="mb-4">
        <WebView
          source={{ uri: lecture.videoUrl }}
          style={{
            width: screenWidth - 48,
            height: 200,
            borderRadius: 8,
          }}
          onError={() => setVideoError(true)}
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
    );
  }

  // Se não há vídeo, mostrar apenas o conteúdo de texto
  return (
    <Text className="text-text-primary mb-4 leading-6">
      {lecture.description || "Conteúdo da aula não disponível."}
    </Text>
  );
}

export default function LectureView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lectureId = id || "";
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dados mockados temporários até a API fornecer método para buscar aula individual
        const mockLecture: Lecture = {
          _id: lectureId,
          title: `Aula ${lectureId}`,
          description:
            "Esta é uma aula sobre farmacologia básica. Aprenda sobre os princípios fundamentais dos medicamentos, suas ações no organismo e como são utilizados no tratamento de diversas condições de saúde.",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          completed: false,
        };

        setLecture(mockLecture);
      } catch (err) {
        console.error("Erro ao buscar dados da aula:", err);
        setError("Erro ao carregar a aula. Verifique sua conexão.");
      } finally {
        setLoading(false);
      }
    };

    if (lectureId) {
      fetchLecture();
    }
  }, [lectureId]);

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-4">Carregando aula...</Text>
      </View>
    );
  }

  if (error || !lecture) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-text-primary text-xl font-semibold mt-4 mb-2">
          Aula não encontrada
        </Text>
        <Text className="text-text-secondary text-center mb-6">
          {error ||
            "A aula que você está procurando não existe ou foi removida."}
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

  const handleMarkComplete = async () => {
    try {
      // Precisa do courseId para completar a aula
      // Por enquanto, apenas atualiza o estado local
      setLecture({ ...lecture, completed: true });
    } catch (err) {
      console.error("Erro ao marcar aula como concluída:", err);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-card border-b border-border px-6 pt-12 pb-4">
        <View className="flex-row items-center mb-3">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-text-primary text-lg font-bold">
              {lecture.title}
            </Text>
            <Text className="text-text-secondary text-sm">Aula</Text>
          </View>
          {lecture.completed && (
            <View className="bg-secondary rounded-full p-2">
              <Ionicons name="checkmark" size={20} color="white" />
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-6">
        <Text className="text-text-secondary mb-4">{lecture.description}</Text>

        <Card>
          <View className="p-6">
            <LectureContentRenderer lecture={lecture} />
          </View>
        </Card>

        {/* Action Buttons */}
        <View className="mt-6 space-y-3">
          {!lecture.completed && (
            <Pressable
              onPress={handleMarkComplete}
              className="bg-secondary px-6 py-4 rounded-lg flex-row items-center justify-center"
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="white"
              />
              <Text className="text-white font-semibold ml-2">
                Marcar como Concluída
              </Text>
            </Pressable>
          )}
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
