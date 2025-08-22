import React from "react";
import { Text, View, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import "./global.css";

const estatisticas = [
  {
    titulo: "Concluídos",
    valor: "12",
    icone: "checkmark-circle" as const,
    cor: "#10b981",
  },
  {
    titulo: "Em Progresso",
    valor: "3",
    icone: "play-circle" as const,
    cor: "#3b82f6",
  },
  {
    titulo: "Horas Estudadas",
    valor: "127h",
    icone: "time" as const,
    cor: "#f59e0b",
  },
];

const cursosMockados = [
  {
    id: 1,
    titulo: "Farmacologia Básica",
    descricao: "Fundamentos da farmacologia moderna",
    duracao: "8 horas",
    nivel: "Iniciante",
    categoria: "Farmácia",
    progresso: 0,
  },
  {
    id: 2,
    titulo: "Análises Clínicas",
    descricao: "Interpretação de exames laboratoriais",
    duracao: "12 horas",
    nivel: "Intermediário",
    categoria: "Laboratório",
    progresso: 0,
  },
  {
    id: 3,
    titulo: "Atenção Farmacêutica",
    descricao: "Cuidado farmacêutico ao paciente",
    duracao: "6 horas",
    nivel: "Avançado",
    categoria: "Clínica",
    progresso: 0,
  },
  {
    id: 4,
    titulo: "Cosmetologia",
    descricao: "Formulação e desenvolvimento de cosméticos",
    duracao: "10 horas",
    nivel: "Intermediário",
    categoria: "Cosmética",
    progresso: 0,
  },
  {
    id: 5,
    titulo: "Fitoterapia",
    descricao: "Plantas medicinais e seus usos terapêuticos",
    duracao: "14 horas",
    nivel: "Avançado",
    categoria: "Natural",
    progresso: 0,
  },
  {
    id: 6,
    titulo: "Farmácia Hospitalar",
    descricao: "Gestão farmacêutica em ambiente hospitalar",
    duracao: "16 horas",
    nivel: "Avançado",
    categoria: "Hospitalar",
    progresso: 0,
  },
];

export default function Index() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="pt-12 px-4 pb-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-text-primary mb-2">
            Cursos
          </Text>
          <Text className="text-text-secondary">
            Continue seu aprendizado e desenvolva suas habilidades
          </Text>
        </View>

        {/* Estatísticas */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Resumo dos Estudos
          </Text>
          <View className="flex-row justify-between">
            {estatisticas.map((stat, index) => (
              <View
                key={index}
                className="bg-card border border-border rounded-lg p-4 flex-1 mx-1 items-center"
              >
                <Ionicons name={stat.icone} size={24} color={stat.cor} />
                <Text className="text-lg font-bold text-text-primary mt-2">
                  {stat.valor}
                </Text>
                <Text className="text-text-secondary text-xs text-center">
                  {stat.titulo}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Cursos em Progresso */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Continue Estudando
          </Text>
          
          <View className="bg-card border border-border rounded-lg p-4 mb-3">
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-text-primary mb-1">
                  Farmacologia Avançada
                </Text>
                <Text className="text-sm text-text-secondary">
                  Módulo 3: Farmacocinética
                </Text>
              </View>
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-xs font-medium text-blue-800">
                  65% concluído
                </Text>
              </View>
            </View>
            <View className="bg-border rounded-full h-2 mb-3">
              <View className="bg-primary h-2 rounded-full" style={{ width: '65%' }} />
            </View>
            <Pressable className="bg-blue-600 rounded-lg py-2 px-4">
              <Text className="text-white text-center font-medium">
                Continuar Curso
              </Text>
            </Pressable>
          </View>
          

        </View>

        {/* Cursos Disponíveis */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Cursos Disponíveis
          </Text>
          <View className="space-y-3">
            {cursosMockados.map((curso) => (
              <View
                key={curso.id}
                className="bg-card border border-border rounded-lg p-4"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-text-primary mb-1">
                      {curso.titulo}
                    </Text>
                    <Text className="text-sm text-text-secondary mb-2">
                      {curso.descricao}
                    </Text>
                  </View>
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-xs font-medium text-blue-800">
                      {curso.nivel}
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <Ionicons name="time" size={16} color="#6b7280" style={{ marginRight: 4 }} />
                    <Text className="text-sm text-text-secondary">
                      {curso.duracao}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="library" size={16} color="#6b7280" style={{ marginRight: 4 }} />
                    <Text className="text-sm text-text-secondary">
                      {curso.categoria}
                    </Text>
                  </View>
                </View>
                <Pressable 
                  className="bg-primary rounded-lg py-2 px-4"
                  onPress={() => router.push(`/curso/${curso.id}` as any)}
                >
                  <Text className="text-white text-center font-medium">
                    Iniciar Curso
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
