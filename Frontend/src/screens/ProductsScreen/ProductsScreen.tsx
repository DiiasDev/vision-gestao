import { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ListProducts from "../../components/ProductsComponents/ListProducts";
import { Product, ProductsService } from "../../services/Products.services";
import EstoqueScreen from "./EstoqueScreen";

type ProductsScreenProps = {
  onBack?: () => void;
};

export default function ProductsScreen({ onBack }: ProductsScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isEstoqueOpen, setIsEstoqueOpen] = useState(false);

  const loadProducts = useCallback(async (silent?: boolean) => {
    if (!silent) setLoading(true);
    setError(null);
    const result = await ProductsService.getProducts();
    if (result?.success) {
      setProducts(result.products ?? []);
    } else {
      setProducts([]);
      setError(result?.message ?? "Falha ao carregar produtos.");
    }
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts(true);
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-background-primary">
      <View className="relative z-20 px-6 pt-10">
        <View className="absolute inset-0" pointerEvents="none">
          <View
            className="absolute -right-16 -top-10 h-40 w-40 rounded-full"
            style={{ backgroundColor: "rgba(37, 99, 235, 0.12)" }}
          />
          <View
            className="absolute -left-20 top-24 h-32 w-32 rounded-full"
            style={{ backgroundColor: "rgba(16, 185, 129, 0.12)" }}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-sm uppercase tracking-widest text-text-secondary">
              Gestão de produtos
            </Text>
            <Text className="mt-2 text-3xl font-semibold text-text-primary">
              Produtos & estoque
            </Text>
            <Text className="mt-2 text-sm text-text-secondary">
              Visualize o catálogo e acompanhe níveis de estoque em tempo real.
            </Text>
          </View>
          {onBack ? (
            <Pressable
              onPress={onBack}
              className="h-11 w-11 items-center justify-center rounded-2xl border border-divider bg-card-background"
            >
              <Ionicons name="arrow-back" size={18} color="#111827" />
            </Pressable>
          ) : null}
        </View>

        <Pressable
          onPress={() => setIsEstoqueOpen(true)}
          className="mt-6 flex-row items-center justify-between rounded-2xl border border-divider bg-card-background px-4 py-3"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-background-secondary">
              <Ionicons name="layers-outline" size={18} color="#2563EB" />
            </View>
            <View>
              <Text className="text-sm font-semibold text-text-primary">
                Ver painel de estoque
              </Text>
              <Text className="mt-1 text-xs text-text-tertiary">
                Movimentações, alertas e recomendações
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </Pressable>
      </View>

      <View className="flex-1 z-0">
        <ListProducts
          products={products}
          loading={loading}
          error={error}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          activeTab="produto"
        />
      </View>

      <Modal
        transparent
        visible={isEstoqueOpen}
        animationType="slide"
        onRequestClose={() => setIsEstoqueOpen(false)}
      >
        <View className="flex-1 bg-background-primary">
          <View className="flex-row items-center justify-between px-6 pt-6">
            <Text className="text-lg font-semibold text-text-primary">
              Painel de estoque
            </Text>
            <Pressable
              onPress={() => setIsEstoqueOpen(false)}
              className="rounded-full border border-divider px-3 py-1"
            >
              <Text className="text-sm text-text-secondary">Fechar</Text>
            </Pressable>
          </View>
          <EstoqueScreen
            products={products}
            loading={loading}
            error={error}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            onBack={() => setIsEstoqueOpen(false)}
          />
        </View>
      </Modal>
    </View>
  );
}
