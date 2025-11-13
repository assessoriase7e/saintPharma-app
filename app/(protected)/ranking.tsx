import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RankingUserCard from "@/components/RankingUserCard";
import StatCard from "@/components/StatCard";
import TopUserCard from "@/components/TopUserCard";
import UserPositionCard from "@/components/UserPositionCard";
import { rankingService } from "@/services";
import { RankingResponse, RankingUser, UserPointsResponse } from "@/types/api";

export default function Ranking() {
  const [rankingData, setRankingData] = useState<RankingResponse | null>(null);
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
    const index = (name?.length || 0) % avatars.length;
    return avatars[index];
  };

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await rankingService.getRankingData();

        setRankingData(data?.ranking || null);
        setUserPoints(data?.userPoints || null);
      } catch (err) {
        console.error("Erro ao carregar dados do ranking:", err);
        setError("Erro ao carregar dados do ranking");
      } finally {
        setLoading(false);
      }
    };

    fetchRankingData();
  }, []);

  const ranking = rankingData?.ranking || [];

  // Calcular posição do usuário no ranking
  const userPosition = userPoints && ranking.length > 0
    ? (() => {
        // Primeiro, tentar encontrar pelo userId e usar a position que já vem da API
        const foundUser = ranking.find(
          (user) => user.id === userPoints.userId || user.clerkId === userPoints.userId
        );
        if (foundUser) {
          return foundUser.position;
        }
        // Se não encontrar, calcular posição baseado nos pontos semanais
        // Encontrar quantos usuários têm pontos maiores ou iguais
        const usersWithMorePoints = ranking.filter(
          (user) => user.points >= userPoints.weekPoints
        ).length;
        return usersWithMorePoints + 1;
      })()
    : undefined;

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
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1">
        <View className="px-6 pb-6 pt-4">
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
            position={userPosition || ranking.length + 1}
            points={userPoints.weekPoints}
            badge={getBadge(userPoints.totalPoints)}
          />
        )}

        {/* Informações da Semana */}
        {rankingData?.week && (
          <View className="mb-4 p-4 bg-card border border-border rounded-lg">
            <Text className="text-sm text-text-secondary mb-1">
              Semana do Ranking
            </Text>
            <Text className="text-base font-semibold text-text-primary">
              {new Date(rankingData.week.start).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
              })}{" "}
              -{" "}
              {new Date(rankingData.week.end).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
              })}
            </Text>
          </View>
        )}

        {/* Estatísticas do Ranking */}
        <View className="grid grid-cols-1 gap-5 justify-between mb-6">
          <StatCard
            icon="people"
            iconColor="#10B981"
            label="Participantes"
            value={(rankingData?.pagination?.total || ranking?.length || 0).toString()}
            subtitle="Total"
            subtitleColor="text-green-600 dark:text-green-400"
          />

          <StatCard
            icon="trending-up"
            iconColor="#3B82F6"
            label="Média"
            value={
              ranking?.length > 0
                ? Math.round(
                    ranking.reduce(
                      (acc, user) => acc + (user?.points || 0),
                      0
                    ) / ranking.length
                  ).toString()
                : "0"
            }
            subtitle="Pontos"
            subtitleColor="text-blue-600 dark:text-blue-400"
          />

          <StatCard
            icon="star"
            iconColor="#F59E0B"
            label="Top 10%"
            value={
              ranking?.length > 0
                ? `${Math.round(
                    ranking[Math.floor(ranking.length * 0.1)]?.points || 0
                  )}+`
                : "0"
            }
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
              {ranking.slice(0, 3).map((usuario, index) => {
                return (
                  <TopUserCard
                    key={usuario.id || usuario.clerkId || `top-${index}`}
                    position={usuario.position}
                    name={usuario.name || "Usuário"}
                    points={usuario.points || 0}
                    completedCourses={0}
                    avatar={getAvatar(usuario.name || "Usuário")}
                    badge={getBadge(usuario.points || 0)}
                  />
                );
              })}
            </View>
          </View>
        )}

        {/* Ranking Completo */}
        <View className="space-y-3">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-text-primary">
              Ranking Completo
            </Text>
            {rankingData?.pagination && (
              <Text className="text-sm text-text-secondary">
                Página {rankingData.pagination.page} de {rankingData.pagination.pages}
              </Text>
            )}
          </View>

          {ranking.length > 0 ? (
            ranking.map((usuario, index) => {
              return (
                <RankingUserCard
                  key={usuario.id || usuario.clerkId || `ranking-${index}`}
                  position={usuario.position}
                  name={usuario.name || "Usuário"}
                  points={usuario.points || 0}
                  completedCourses={0}
                  badge={getBadge(usuario.points || 0)}
                  avatar={getAvatar(usuario.name || "Usuário")}
                />
              );
            })
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
    </SafeAreaView>
  );
}
