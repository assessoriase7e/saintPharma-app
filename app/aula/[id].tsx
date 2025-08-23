import React, { useState } from 'react';
import { Text, View, ScrollView, Pressable, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { getLessonById } from '../../data/mockData';
import Card from '../../components/Card';
import { ContentBlock } from '../../types/course';

const { width: screenWidth } = Dimensions.get('window');

interface ContentBlockRendererProps {
  block: ContentBlock;
}

function ContentBlockRenderer({ block }: ContentBlockRendererProps) {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  switch (block.type) {
    case 'heading':
      return (
        <Text 
          className={`text-text-primary font-bold mb-4 ${
            block.style?.fontSize === 'large' ? 'text-2xl' :
            block.style?.fontSize === 'medium' ? 'text-xl' : 'text-lg'
          }`}
          style={{
            textAlign: block.style?.textAlign || 'left',
            color: block.style?.color
          }}
        >
          {block.content}
        </Text>
      );

    case 'text':
      return (
        <Text 
          className={`text-text-primary mb-4 leading-6 ${
            block.style?.fontSize === 'large' ? 'text-lg' :
            block.style?.fontSize === 'small' ? 'text-sm' : 'text-base'
          } ${
            block.style?.fontWeight === 'bold' ? 'font-bold' : 'font-normal'
          }`}
          style={{
            textAlign: block.style?.textAlign || 'left',
            color: block.style?.color
          }}
        >
          {block.content}
        </Text>
      );

    case 'image':
      if (imageError) {
        return (
          <View className="bg-border rounded-lg p-6 mb-4 items-center justify-center" style={{ height: 200 }}>
            <Ionicons name="image-outline" size={48} color="#6b7280" />
            <Text className="text-text-secondary mt-2 text-center">
              Erro ao carregar imagem
            </Text>
            {block.metadata?.alt && (
              <Text className="text-text-secondary text-sm mt-1 text-center">
                {block.metadata.alt}
              </Text>
            )}
          </View>
        );
      }

      return (
        <View className="mb-4">
          <Image
            source={{ uri: block.content }}
            style={{
              width: block.metadata?.width ? Math.min(block.metadata.width, screenWidth - 48) : screenWidth - 48,
              height: block.metadata?.height || 200,
              borderRadius: 8
            }}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
          {block.metadata?.alt && (
            <Text className="text-text-secondary text-sm mt-2 text-center">
              {block.metadata.alt}
            </Text>
          )}
        </View>
      );

    case 'video':
      if (videoError) {
        return (
          <View className="bg-border rounded-lg p-6 mb-4 items-center justify-center" style={{ height: 200 }}>
            <Ionicons name="play-circle-outline" size={48} color="#6b7280" />
            <Text className="text-text-secondary mt-2 text-center">
              Erro ao carregar vídeo
            </Text>
            {block.metadata?.duration && (
              <Text className="text-text-secondary text-sm mt-1">
                Duração: {block.metadata.duration}
              </Text>
            )}
          </View>
        );
      }

      // Para vídeos do YouTube, extrair o ID e usar embed
      const getYouTubeEmbedUrl = (url: string) => {
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
      };

      const embedUrl = block.content.includes('youtube') ? getYouTubeEmbedUrl(block.content) : block.content;

      return (
        <View className="mb-4">
          {block.metadata?.thumbnail && (
            <View className="mb-2">
              <Image
                source={{ uri: block.metadata.thumbnail }}
                style={{
                  width: screenWidth - 48,
                  height: 200,
                  borderRadius: 8
                }}
                resizeMode="cover"
              />
              <View className="absolute inset-0 items-center justify-center">
                <View className="bg-black/50 rounded-full p-3">
                  <Ionicons name="play" size={32} color="white" />
                </View>
              </View>
            </View>
          )}
          <WebView
            source={{ uri: embedUrl }}
            style={{
              width: screenWidth - 48,
              height: 200,
              borderRadius: 8
            }}
            onError={() => setVideoError(true)}
            allowsFullscreenVideo
          />
          {block.metadata?.duration && (
            <Text className="text-text-secondary text-sm mt-2">
              Duração: {block.metadata.duration}
            </Text>
          )}
        </View>
      );

    default:
      return (
        <Text className="text-text-secondary italic mb-4">
          Tipo de conteúdo não suportado: {block.type}
        </Text>
      );
  }
}

export default function LessonView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = parseInt(id || '0');
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-text-primary text-xl font-semibold mt-4 mb-2">
          Aula não encontrada
        </Text>
        <Text className="text-text-secondary text-center mb-6">
          A aula que você está procurando não existe ou foi removida.
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

  const handleQuizPress = () => {
    if (lesson.quiz) {
      router.push(`/prova/${lesson.quiz.id}` as any);
    }
  };

  const handleMarkComplete = () => {
    // Aqui você implementaria a lógica para marcar a aula como concluída
    console.log('Marcar aula como concluída:', lesson.id);
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
              {lesson.titulo}
            </Text>
            <Text className="text-text-secondary text-sm">
              Aula {lesson.ordem}
            </Text>
          </View>
          {lesson.completed && (
            <View className="bg-secondary rounded-full p-2">
              <Ionicons name="checkmark" size={20} color="white" />
            </View>
          )}
        </View>
        
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text className="text-text-secondary text-sm ml-1">
              {lesson.duracao}
            </Text>
          </View>
          
          {lesson.quiz && (
            <Pressable 
              onPress={handleQuizPress}
              className="flex-row items-center bg-primary/10 px-3 py-1 rounded-full"
            >
              <Ionicons name="help-circle-outline" size={16} color="#3b82f6" />
              <Text className="text-primary text-sm font-medium ml-1">
                Quiz
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-6">
        <Text className="text-text-secondary mb-4">
          {lesson.descricao}
        </Text>
        
        <Card>
          <View className="p-6">
            {lesson.content.blocks.map((block) => (
              <ContentBlockRenderer key={block.id} block={block} />
            ))}
          </View>
        </Card>
        
        {/* Action Buttons */}
        <View className="mt-6 space-y-3">
          {!lesson.completed && (
            <Pressable 
              onPress={handleMarkComplete}
              className="bg-secondary px-6 py-4 rounded-lg flex-row items-center justify-center"
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                Marcar como Concluída
              </Text>
            </Pressable>
          )}
          
          {lesson.quiz && (
            <Pressable 
              onPress={handleQuizPress}
              className="bg-primary px-6 py-4 rounded-lg flex-row items-center justify-center"
            >
              <Ionicons name="help-circle-outline" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                Fazer Quiz
              </Text>
            </Pressable>
          )}
        </View>
        
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}