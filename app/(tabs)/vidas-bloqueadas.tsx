import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import Card from "@/components/Card";
import { useLives } from "@/stores";

interface LivesBlockedModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LivesBlockedModal({
  visible,
  onClose,
}: LivesBlockedModalProps) {
  const { userLives, getTimeUntilNextRegeneration } = useLives();
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextRegeneration());

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      const newTimeLeft = getTimeUntilNextRegeneration();
      setTimeLeft(newTimeLeft);

      // Se as vidas foram regeneradas, fechar o modal
      if (userLives.currentLives > 0) {
        onClose();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, getTimeUntilNextRegeneration, userLives.currentLives, onClose]);

  const formatTime = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <Card>
          <View className="p-8 items-center">
            {/* Ícone de coração quebrado */}
            <View className="bg-red-100 rounded-full p-6 mb-6">
              <Ionicons name="heart-dislike" size={64} color="#ef4444" />
            </View>

            {/* Título */}
            <Text className="text-text-primary text-2xl font-bold text-center mb-4">
              Suas Vidas Acabaram!
            </Text>

            {/* Descrição */}
            <Text className="text-text-secondary text-center mb-6 leading-6">
              Você não possui mais vidas para acessar os cursos. As vidas são
              perdidas quando você erra questões nos quizzes.
            </Text>

            {/* Contador de vidas atual */}
            <View className="bg-background rounded-lg p-4 mb-6 w-full">
              <View className="flex-row items-center justify-center mb-2">
                <Ionicons name="heart" size={24} color="#ef4444" />
                <Text className="text-text-primary text-xl font-bold ml-2">
                  {userLives.currentLives} / {userLives.maxLives}
                </Text>
              </View>
              <Text className="text-text-secondary text-center text-sm">
                Vidas Restantes
              </Text>
            </View>

            {/* Tempo para próxima regeneração */}
            <View className="bg-primary/10 rounded-lg p-4 mb-6 w-full">
              <Text className="text-text-primary text-center font-semibold mb-2">
                Próxima Regeneração em:
              </Text>
              <Text className="text-primary text-2xl font-bold text-center">
                {formatTime(timeLeft)}
              </Text>
              <Text className="text-text-secondary text-center text-sm mt-1">
                Você ganhará 10 vidas
              </Text>
            </View>

            {/* Explicação do sistema */}
            <View className="bg-background rounded-lg p-4 mb-6 w-full">
              <Text className="text-text-primary font-semibold mb-3 text-center">
                Como Funciona o Sistema de Vidas:
              </Text>

              <View className="flex-col gap-2">
                <View className="flex-row items-start">
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color="#10b981"
                    className="mt-1"
                  />
                  <Text className="text-text-secondary text-sm ml-2 flex-1">
                    Você ganha 10 vidas a cada 24 horas automaticamente
                  </Text>
                </View>

                <View className="flex-row items-start">
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color="#ef4444"
                    className="mt-1"
                  />
                  <Text className="text-text-secondary text-sm ml-2 flex-1">
                    Perde 1 vida a cada erro em quiz
                  </Text>
                </View>

                <View className="flex-row items-start">
                  <Ionicons
                    name="lock-closed"
                    size={16}
                    color="#f59e0b"
                    className="mt-1"
                  />
                  <Text className="text-text-secondary text-sm ml-2 flex-1">
                    Sem vidas = sem acesso aos cursos
                  </Text>
                </View>
              </View>
            </View>

            {/* Botões */}
            <View className="w-full flex-col gap-3">
              <Pressable
                onPress={onClose}
                className="bg-primary px-6 py-4 rounded-lg"
              >
                <Text className="text-white font-semibold text-center">
                  Entendi
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  onClose();
                  router.push("/ranking");
                }}
                className="bg-background border border-border px-6 py-3 rounded-lg"
              >
                <Text className="text-text-primary font-medium text-center">
                  Ver Ranking Enquanto Espero
                </Text>
              </Pressable>
            </View>
          </View>
        </Card>
      </View>
    </Modal>
  );
}

// Tela principal (caso seja acessada diretamente)
export default function LivesBlockedScreen() {
  return (
    <View className="flex-1 bg-background">
      <LivesBlockedModal visible={true} onClose={() => router.back()} />
    </View>
  );
}
