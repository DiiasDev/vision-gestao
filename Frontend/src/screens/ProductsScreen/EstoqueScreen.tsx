import { RefreshControl, ScrollView, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Product } from "../../services/Products.services";
import EstoqueComponent from "../../components/Estoque/EstoqueComponent";

type EstoqueScreenProps = {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  refreshing?: boolean;
  onBack?: () => void;
};

export default function EstoqueScreen({
  products,
  loading,
  error,
  onRefresh,
  refreshing,
  onBack,
}: EstoqueScreenProps) {
  return (
    <ScrollView
      className="flex-1 bg-background-primary"
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={Boolean(refreshing)}
            onRefresh={onRefresh}
            tintColor="#2563EB"
          />
        ) : undefined
      }
    >
      <View className="pt-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm uppercase tracking-widest text-text-tertiary">
              Estoque inteligente
            </Text>
            <Text className="mt-2 text-2xl font-semibold text-text-primary">
              Movimentações e alertas
            </Text>
          </View>
          {onBack ? (
            <Pressable
              onPress={onBack}
              className="h-10 w-10 items-center justify-center rounded-2xl border border-divider bg-card-background"
            >
              <Ionicons name="arrow-back" size={18} color="#111827" />
            </Pressable>
          ) : null}
        </View>
        <Text className="mt-2 text-sm text-text-secondary">
          Tenha clareza sobre entradas, saídas e itens que pedem reposição.
        </Text>
      </View>

      <EstoqueComponent
        products={products}
        loading={loading}
        error={error}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
    </ScrollView>
  );
}
