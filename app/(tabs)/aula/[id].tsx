import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { lecturesService } from "@/services";
import { Lecture } from "@/types/api";

function LectureContentRenderer({ lecture }: { lecture: Lecture }) {
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [imageRatios, setImageRatios] = useState<{ [key: string]: number }>(
    {}
  );
  const [downloading, setDownloading] = useState<{ [key: string]: boolean }>(
    {}
  );

  const handleImageError = (key: string) => {
    setImageErrors((prev) => ({ ...prev, [key]: true }));
  };

  const handleImageLoad = (key: string, width?: number, height?: number) => {
    if (!width || !height) return;
    setImageRatios((prev) => ({ ...prev, [key]: width / height }));
  };

  const downloadImage = async (imageUrl: string, blockKey: string) => {
    try {
      setDownloading((prev) => ({ ...prev, [blockKey]: true }));

      if (Platform.OS === "web") {
        // Para web: criar um link de download direto
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `image_${Date.now()}.jpg`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Alert.alert(
          "Download iniciado",
          "O download da imagem foi iniciado. Verifique sua pasta de downloads.",
          [{ text: "OK" }]
        );
      } else {
        // Para mobile: usar a funcionalidade nativa
        // Solicitar permissão para acessar a galeria
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permissão necessária",
            "É necessário permitir o acesso à galeria para baixar a imagem."
          );
          return;
        }

        // Fazer o download da imagem
        const filename = `image_${Date.now()}.jpg`;
        const documentDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || "";
        if (!documentDir) {
          throw new Error("Diretório de documentos não disponível");
        }
        const downloadResult = await FileSystem.downloadAsync(
          imageUrl,
          documentDir + filename
        );

        // Salvar na galeria
        await MediaLibrary.saveToLibraryAsync(downloadResult.uri);

        Alert.alert("Sucesso", "Imagem salva na galeria com sucesso!", [
          { text: "OK" },
        ]);
      }
    } catch (error) {
      console.error("Erro ao baixar imagem:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Não foi possível baixar a imagem. Tente novamente.";
      Alert.alert("Erro", errorMessage, [{ text: "OK" }]);
    } finally {
      setDownloading((prev) => ({ ...prev, [blockKey]: false }));
    }
  };

  // Função para abrir URL do YouTube
  const openYouTubeVideo = async (url: string) => {
    try {
      const cleanUrl = url.trim().replace(/`/g, "");
      const supported = await Linking.canOpenURL(cleanUrl);
      if (supported) {
        await Linking.openURL(cleanUrl);
      } else {
        console.error("Não é possível abrir a URL:", cleanUrl);
      }
    } catch (error) {
      console.error("Erro ao abrir URL:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Não foi possível abrir o link. Tente novamente.";
      Alert.alert("Erro", errorMessage, [{ text: "OK" }]);
    }
  };

  // Se há conteúdo estruturado, renderizar os blocos
  console.log("🔍 [LectureContentRenderer] Checking content:", {
    hasContent: !!lecture.content,
    contentLength: lecture.content?.length,
    content: lecture.content,
  });

  if (lecture.content && lecture.content.length > 0) {
    return (
      <View>
        {lecture.content.map((block, index) => {
          const blockKey = block._key || `block-${index}`;

          switch (block._type) {
            case "block":
              // Renderizar texto com diferentes estilos
              const text =
                block.children?.map((child) => child.text).join("") || "";
              if (!text.trim()) return null;

              const style = block.style || "normal";

              switch (style) {
                case "h1":
                  return (
                    <Text
                      key={blockKey}
                      className="text-text-primary text-3xl font-bold mb-6 leading-tight"
                    >
                      {text.trim()}
                    </Text>
                  );
                case "h2":
                  return (
                    <Text
                      key={blockKey}
                      className="text-text-primary text-2xl font-bold mb-5 leading-tight"
                    >
                      {text.trim()}
                    </Text>
                  );
                case "h3":
                  return (
                    <Text
                      key={blockKey}
                      className="text-text-primary text-xl font-semibold mb-4 leading-tight"
                    >
                      {text.trim()}
                    </Text>
                  );
                case "h4":
                  return (
                    <Text
                      key={blockKey}
                      className="text-text-primary text-lg font-semibold mb-4 leading-tight"
                    >
                      {text.trim()}
                    </Text>
                  );
                case "h5":
                  return (
                    <Text
                      key={blockKey}
                      className="text-text-primary text-base font-semibold mb-3 leading-tight"
                    >
                      {text.trim()}
                    </Text>
                  );
                case "h6":
                  return (
                    <Text
                      key={blockKey}
                      className="text-text-primary text-sm font-semibold mb-3 leading-tight uppercase tracking-wide"
                    >
                      {text.trim()}
                    </Text>
                  );
                case "blockquote":
                  return (
                    <View key={blockKey} className="mb-4">
                      <View className="bg-card border-l-4 border-primary pl-4 py-3 rounded-r-lg">
                        <Text className="text-text-secondary italic text-base leading-6">
                          {text.trim()}
                        </Text>
                      </View>
                    </View>
                  );
                default:
                  return (
                    <Text
                      key={blockKey}
                      className="text-text-primary mb-4 leading-6"
                    >
                      {text.trim()}
                    </Text>
                  );
              }

            case "youtubeUrl":
              // Renderizar botão para abrir vídeo do YouTube
              if (!block.url) return null;

              const cleanUrl = block.url.trim().replace(/`/g, "");

              return (
                <Pressable
                  key={blockKey}
                  onPress={() => openYouTubeVideo(cleanUrl)}
                  className="bg-card border border-border rounded-lg p-6 mb-4 items-center justify-center"
                  style={{ height: 200 }}
                >
                  <View className="bg-red-600 rounded-full p-4 mb-3">
                    <Ionicons name="logo-youtube" size={32} color="white" />
                  </View>
                  <Text className="text-text-primary font-semibold text-center mb-2">
                    Assistir no YouTube
                  </Text>
                  <Text className="text-text-secondary text-sm text-center">
                    Toque para abrir o vídeo
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="open-outline" size={16} color="#6b7280" />
                    <Text className="text-text-secondary text-xs ml-1">
                      Abre em app externo
                    </Text>
                  </View>
                </Pressable>
              );

            case "image":
              // Renderizar imagem
              if (!block.imageUrl) return null;

              const cleanImageUrl = block.imageUrl.trim().replace(/`/g, "");

              if (imageErrors[blockKey]) {
                return (
                  <View
                    key={blockKey}
                    className="bg-border rounded-lg p-6 mb-4 items-center justify-center"
                    style={{ height: 200 }}
                  >
                    <Ionicons name="image-outline" size={48} color="#6b7280" />
                    <Text className="text-text-secondary mt-2 text-center">
                      Erro ao carregar imagem
                    </Text>
                  </View>
                );
              }

              return (
                <View key={blockKey} className="mb-4 -mx-4">
                  <Pressable
                    onPress={() => downloadImage(cleanImageUrl, blockKey)}
                    disabled={downloading[blockKey]}
                    className="relative w-full"
                    style={{
                      alignSelf: "stretch",
                    }}
                  >
                    <Image
                      source={{ uri: cleanImageUrl }}
                      className="w-full"
                      style={{ aspectRatio: imageRatios[blockKey] || 16 / 9 }}
                      resizeMode="contain"
                      onError={() => handleImageError(blockKey)}
                      onLoad={(event: any) =>
                        handleImageLoad(
                          blockKey,
                          event.nativeEvent.source?.width,
                          event.nativeEvent.source?.height
                        )
                      }
                    />
                    {downloading[blockKey] && (
                      <View className="absolute inset-0 bg-black/50 items-center justify-center">
                        <ActivityIndicator size="large" color="white" />
                        <Text className="text-white mt-2 font-medium">
                          Baixando...
                        </Text>
                      </View>
                    )}
                    {!downloading[blockKey] && (
                      <View className="absolute top-2 right-2 bg-black/50 rounded-full p-2">
                        <Ionicons
                          name="download-outline"
                          size={20}
                          color="white"
                        />
                      </View>
                    )}
                  </Pressable>
                  {block.caption && (
                    <Text className="text-text-secondary text-sm mt-2 text-center px-4">
                      {block.caption}
                    </Text>
                  )}
                </View>
              );

            default:
              return null;
          }
        })}
      </View>
    );
  }

  // Fallback para o formato antigo
  if (lecture.videoUrl) {
    return (
      <Pressable
        onPress={() => openYouTubeVideo(lecture.videoUrl!)}
        className="bg-card border border-border rounded-lg p-6 mb-4 items-center justify-center"
        style={{ height: 200 }}
      >
        <View className="bg-red-600 rounded-full p-4 mb-3">
          <Ionicons name="logo-youtube" size={32} color="white" />
        </View>
        <Text className="text-text-primary font-semibold text-center mb-2">
          Assistir no YouTube
        </Text>
        <Text className="text-text-secondary text-sm text-center">
          Toque para abrir o vídeo
        </Text>
      </Pressable>
    );
  }

  // Se não há conteúdo, mostrar mensagem
  return (
    <View
      className="bg-border rounded-lg p-6 items-center justify-center"
      style={{ height: 200 }}
    >
      <Ionicons name="document-text-outline" size={48} color="#6b7280" />
      <Text className="text-text-secondary mt-2 text-center">
        Conteúdo da aula não disponível
      </Text>
    </View>
  );
}

export default function LectureView() {
  const { id, courseId } = useLocalSearchParams<{
    id: string;
    courseId?: string;
  }>();
  const lectureId = id || "";
  const insets = useSafeAreaInsets();
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [hasQuiz, setHasQuiz] = useState<boolean>(false);
  const [checkingQuiz, setCheckingQuiz] = useState(true);

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setLoading(true);
        setError(null);

        const lectureData = await lecturesService.getLecture(lectureId);
        console.log("🔍 [Lecture] Lecture Data:", lectureData);
        console.log("🔍 [Lecture] Content:", lectureData.lecture?.content);
        console.log(
          "🔍 [Lecture] Content Length:",
          lectureData.lecture?.content?.length
        );

        // Garantir que a aula existe e tem os dados necessários
        if (!lectureData.lecture) {
          throw new Error("Aula não encontrada");
        }

        setLecture(lectureData.lecture);

        // Verificar se a aula tem quiz
        try {
          setCheckingQuiz(true);
          const quizResponse = await lecturesService.getLectureQuestions(lectureId);
          console.log("🔍 [Lecture] Quiz Response:", quizResponse);
          
          // Se conseguiu buscar questões, a aula tem quiz
          if (quizResponse && quizResponse.data && quizResponse.data.questions && quizResponse.data.questions.length > 0) {
            setHasQuiz(true);
            console.log("✅ [Lecture] Aula possui quiz com", quizResponse.data.questions.length, "questões");
          } else {
            setHasQuiz(false);
            console.log("ℹ️ [Lecture] Aula não possui quiz");
          }
        } catch (quizError: any) {
          // Se der erro 404, significa que não tem quiz
          console.log("ℹ️ [Lecture] Erro ao buscar quiz (provavelmente não existe):", quizError?.message || quizError);
          setHasQuiz(false);
        } finally {
          setCheckingQuiz(false);
        }
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
        <View className="bg-red-500 rounded-full p-4 mb-6">
          <Ionicons name="alert-circle" size={48} color="white" />
        </View>
        <Text className="text-text-primary text-2xl font-semibold mb-3">
          Aula não encontrada
        </Text>
        <Text className="text-text-secondary text-center mb-8 max-w-sm">
          {error ||
            "A aula que você está procurando não existe ou foi removida."}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-primary px-8 py-4 rounded-lg"
        >
          <Text className="text-white font-semibold text-base">Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const handleMarkComplete = async () => {
    if (!lecture || !courseId) {
      setError("Informações insuficientes para completar a aula.");
      return;
    }

    try {
      setCompleting(true);

      await lecturesService.completeLecture(lectureId, { courseId });

      // Atualiza o estado local
      setLecture({ ...lecture, completed: true });

      // Navega de volta para o curso após completar a aula
      setTimeout(() => {
        router.push(`/curso/${courseId}` as any);
      }, 1000); // Pequeno delay para mostrar o feedback visual
    } catch (err) {
      console.error("Erro ao marcar aula como concluída:", err);
      setError("Erro ao completar a aula. Tente novamente.");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-card border-b border-border px-5 py-2" style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center">
          <Pressable
            onPress={() => {
              if (courseId) {
                router.push(`/curso/${courseId}` as any);
              } else {
                router.back();
              }
            }}
            className="mr-4"
          >
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
      <ScrollView className="flex-1 px-4 py-4">
        <Text className="text-text-secondary mb-4">{lecture.description}</Text>

        <LectureContentRenderer lecture={lecture} />

        {/* Action Buttons */}
        <View className="mt-6 flex-col gap-3">
          {!lecture.completed && !checkingQuiz && (
            <>
              {hasQuiz ? (
                // Se a aula tem quiz, mostrar botão para fazer o quiz
                <Pressable
                  onPress={() => {
                    if (!courseId) {
                      Alert.alert("Erro", "Informações do curso não disponíveis.");
                      return;
                    }
                    router.push(`/quiz-aula/${lectureId}?courseId=${courseId}` as any);
                  }}
                  className="px-6 py-4 rounded-lg flex-row items-center justify-center bg-primary"
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={20}
                    color="white"
                  />
                  <Text className="text-white font-semibold ml-2">
                    Fazer Quiz
                  </Text>
                </Pressable>
              ) : (
                // Se não tem quiz, mostrar botão para marcar como concluída
                <Pressable
                  onPress={handleMarkComplete}
                  disabled={completing}
                  className={`px-6 py-4 rounded-lg flex-row items-center justify-center ${
                    completing ? "bg-secondary/50" : "bg-secondary"
                  }`}
                >
                  {completing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color="white"
                    />
                  )}
                  <Text className="text-white font-semibold ml-2">
                    {completing ? "Completando..." : "Marcar como Concluída"}
                  </Text>
                </Pressable>
              )}
            </>
          )}
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
