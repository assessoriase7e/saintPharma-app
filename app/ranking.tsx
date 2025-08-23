import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, ActivityIndicator } from "react-native";
import RankingUserCard from "../components/RankingUserCard";
import StatCard from "../components/StatCard";
import TopUserCard from "../components/TopUserCard";
import UserPositionCard from "../components/UserPositionCard";
import { useApiClient } from "../services/api";
import { RankingUser, UserPointsResponse } from "../types/api";

export default function Ranking() {
  const apiClient = useApiClient();
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [userPoints, setUserPoints] = useState<UserPointsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para determinar badge baseado nos pontos
  const getBadge = (points: number): string => {
    if (points >= 2500) return "Especialista";
    if (points >= 1500) return "Avançado";
    if (points >= 800) return "Intermediário";
    return "Iniciante";
  };

  // Função para gerar avatar baseado no nome
  const getAvatar = (name: string): string => {
    const avatars = ["👩‍⚕️", "👨‍⚕️", "👩‍🔬", "👨‍🔬", "👩‍💼", "👨‍💼"];
    const index = name.length % avatars.length;
    return avatars[index];
  };

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [rankingResponse, userPointsResponse] = await Promise.all([
          apiClient.getRanking(),
          apiClient.getUserPoints()
        ]);
        
        setRanking(rankingResponse.ranking);
        setUserPoints(userPointsResponse);
      } catch (err) {
        console.error('Erro ao carregar dados do ranking:', err);
        setError('Erro ao carregar dados do ranking');
      } finally {
        setLoading(false);
      }
    };

    fetchRankingData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="text-text-secondary mt-4">Carregando ranking...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-6">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <Text className="text-text-secondary text-center">
          Tente novamente mais tarde
        </Text>
      </View>
    );
  }

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
        {userPoints && (
          <UserPositionCard 
            position={userPoints.position} 
            points={userPoints.totalPoints} 
            badge={getBadge(userPoints.totalPoints)} 
          />
        )}

        {/* Estatísticas do Ranking */}
        <View className="grid grid-cols-1 gap-5 justify-between mb-6">
          <StatCard
            icon="people"
            iconColor="#10B981"
            label="Participantes"
            value={ranking.length.toString()}
            subtitle="Ativos"
            subtitleColor="text-green-600 dark:text-green-400"
          />

          <StatCard
            icon="trending-up"
            iconColor="#3B82F6"
            label="Média"
            value={ranking.length > 0 ? Math.round(ranking.reduce((acc, user) => acc + user.points, 0) / ranking.length).toString() : "0"}
            subtitle="Pontos"
            subtitleColor="text-blue-600 dark:text-blue-400"
          />

          <StatCard
            icon="star"
            iconColor="#F59E0B"
            label="Top 10%"
            value={ranking.length > 0 ? `${Math.round(ranking[Math.floor(ranking.length * 0.1)]?.points || 0)}+` : "0"}
            subtitle="Pontos"
            subtitleColor="text-yellow-600 dark:text-yellow-400"
          />
        </View>

        {/* Top 3 Destaque */}
        {ranking.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-text-primary mb-4">
              Top 3
            </Text>
            <View className="grid grid-cols-3 gap-1">
              {ranking.slice(0, 3).map((usuario, index) => (
                <TopUserCard
                  key={`${usuario.user.name}-${index}`}
                  position={index + 1}
                  name={usuario.user.name}
                  points={usuario.points}
                  completedCourses={usuario.certificatesCount}
                  avatar={getAvatar(usuario.user.name)}
                  badge={getBadge(usuario.points)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Ranking Completo */}
        <View className="space-y-3">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Ranking Completo
          </Text>

          {ranking.length > 0 ? (
            ranking.map((usuario, index) => (
              <RankingUserCard
                key={`${usuario.user.name}-${index}`}
                position={index + 1}
                name={usuario.user.name}
                points={usuario.points}
                completedCourses={usuario.certificatesCount}
                badge={getBadge(usuario.points)}
                avatar={getAvatar(usuario.user.name)}
              />
            ))
          ) : (
            <View className="bg-card border border-border rounded-lg p-6 items-center">
              <Text className="text-text-secondary text-center">
                Nenhum usuário encontrado no ranking
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
