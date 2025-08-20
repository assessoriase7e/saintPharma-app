import React from "react";
import { ScrollView, Text, View } from "react-native";
import RankingUserCard from "../components/RankingUserCard";
import StatCard from "../components/StatCard";
import TopUserCard from "../components/TopUserCard";
import UserPositionCard from "../components/UserPositionCard";

export default function Ranking() {
  const ranking = [
    {
      id: 1,
      posicao: 1,
      nome: "Ana Silva",
      pontos: 2850,
      cursosCompletos: 12,
      badge: "Especialista",
      avatar: "👩‍⚕️",
    },
    {
      id: 2,
      posicao: 2,
      nome: "Carlos Santos",
      pontos: 2720,
      cursosCompletos: 11,
      badge: "Avançado",
      avatar: "👨‍⚕️",
    },
    {
      id: 3,
      posicao: 3,
      nome: "Maria Oliveira",
      pontos: 2650,
      cursosCompletos: 10,
      badge: "Avançado",
      avatar: "👩‍🔬",
    },
    {
      id: 4,
      posicao: 4,
      nome: "João Costa",
      pontos: 2480,
      cursosCompletos: 9,
      badge: "Intermediário",
      avatar: "👨‍🔬",
    },
    {
      id: 5,
      posicao: 5,
      nome: "Lucia Ferreira",
      pontos: 2350,
      cursosCompletos: 8,
      badge: "Intermediário",
      avatar: "👩‍💼",
    },
    {
      id: 6,
      posicao: 6,
      nome: "Pedro Lima",
      pontos: 2200,
      cursosCompletos: 7,
      badge: "Iniciante",
      avatar: "👨‍💼",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="pt-12 px-6 pb-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-text-primary">Ranking</Text>
          <Text className="text-text-secondary">
            Veja os melhores desempenhos da plataforma
          </Text>
        </View>

        {/* Sua Posição */}
        <UserPositionCard position={15} points={1850} badge="Intermediário" />

        {/* Estatísticas do Ranking */}
        <View className="grid grid-cols-1 gap-5 justify-between mb-6">
          <StatCard
            icon="people"
            iconColor="#10B981"
            label="Participantes"
            value="1.247"
            subtitle="Ativos"
            subtitleColor="text-green-600 dark:text-green-400"
          />

          <StatCard
            icon="trending-up"
            iconColor="#3B82F6"
            label="Média"
            value="1.850"
            subtitle="Pontos"
            subtitleColor="text-blue-600 dark:text-blue-400"
          />

          <StatCard
            icon="star"
            iconColor="#F59E0B"
            label="Top 10%"
            value="2.500+"
            subtitle="Pontos"
            subtitleColor="text-yellow-600 dark:text-yellow-400"
          />
        </View>

        {/* Top 3 Destaque */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Top 3
          </Text>
          <View className="grid grid-cols-3 gap-1">
            {ranking.slice(0, 3).map((usuario) => (
              <TopUserCard
                key={usuario.id}
                position={usuario.posicao}
                name={usuario.nome}
                points={usuario.pontos}
                completedCourses={usuario.cursosCompletos}
                avatar={usuario.avatar}
                badge={usuario.badge}
              />
            ))}
          </View>
        </View>

        {/* Ranking Completo */}
        <View className="space-y-3">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Ranking Completo
          </Text>

          {ranking.map((usuario) => (
            <RankingUserCard
              key={usuario.id}
              position={usuario.posicao}
              name={usuario.nome}
              points={usuario.pontos}
              completedCourses={usuario.cursosCompletos}
              badge={usuario.badge}
              avatar={usuario.avatar}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
