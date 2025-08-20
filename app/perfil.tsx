import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeToggle } from "../components/ThemeToggle";

export default function Perfil() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="pt-12 px-4 pb-4">
        {/* Título da Página */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-text-primary mb-2">
            Perfil
          </Text>
        </View>
        
        {/* Header do Perfil */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-4">
            <Ionicons name="person" size={48} color="white" />
          </View>
          <Text className="text-2xl font-bold text-text-primary">
            Dr. João Silva
          </Text>
          <Text className="text-text-secondary">
            Farmacêutico Responsável
          </Text>
          <Text className="text-text-secondary">
            CRF: 12345-SP
          </Text>
        </View>

        {/* Informações do Perfil */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Informações Pessoais
          </Text>
          
          <View className="bg-card border border-border rounded-lg p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="mail" size={20} color="#6b7280" style={{ marginRight: 12 }} />
              <View>
                <Text className="text-text-secondary text-sm">Email</Text>
                <Text className="text-text-primary">joao.silva@saintpharma.com</Text>
              </View>
            </View>
            
            <View className="flex-row items-center mb-3">
              <Ionicons name="call" size={20} color="#6b7280" style={{ marginRight: 12 }} />
              <View>
                <Text className="text-text-secondary text-sm">Telefone</Text>
                <Text className="text-text-primary">(11) 99999-9999</Text>
              </View>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="location" size={20} color="#6b7280" style={{ marginRight: 12 }} />
              <View>
                <Text className="text-text-secondary text-sm">Localização</Text>
                <Text className="text-text-primary">São Paulo, SP</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Configurações */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Configurações
          </Text>
          
          <ThemeToggle />
          
          <View className="bg-card border border-border rounded-lg p-3 flex-row items-center justify-between mt-4">
            <View className="flex-row items-center">
              <Ionicons name="notifications" size={20} color="#6b7280" style={{ marginRight: 12 }} />
              <Text className="text-text-primary font-medium">Notificações</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </View>
          
          <View className="bg-card border border-border rounded-lg p-3 flex-row items-center justify-between mt-4">
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark" size={20} color="#6b7280" style={{ marginRight: 12 }} />
              <Text className="text-text-primary font-medium">Privacidade</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </View>
        </View>

        {/* Estatísticas */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Estatísticas
          </Text>
          
          <View className="flex-row justify-between">
            <View className="bg-card border border-border rounded-lg p-4 flex-1 mr-2 items-center">
              <Ionicons name="cube" size={24} color="#3b82f6" />
              <Text className="text-2xl font-bold text-text-primary mt-2">156</Text>
              <Text className="text-text-secondary text-sm">Produtos</Text>
            </View>
            
            <View className="bg-card border border-border rounded-lg p-4 flex-1 ml-2 items-center">
              <Ionicons name="trending-up" size={24} color="#10b981" />
              <Text className="text-2xl font-bold text-text-primary mt-2">89%</Text>
              <Text className="text-text-secondary text-sm">Disponibilidade</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}