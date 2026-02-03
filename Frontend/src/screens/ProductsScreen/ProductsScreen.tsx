import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ListProducts from "../../components/ProductsComponents/ListProducts";
import { Product, ProductsService } from "../../services/Products.services";

type ProductsScreenProps = {
  onBack?: () => void;
};

export default function ProductsScreen({ onBack }: ProductsScreenProps) {
  const [activeTab, setActiveTab] = useState<"produto" | "estoque">("produto");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
      <View className="relative overflow-hidden px-6 pt-10">
        <View
          className="absolute -right-16 -top-10 h-40 w-40 rounded-full"
          style={{ backgroundColor: "rgba(37, 99, 235, 0.12)" }}
        />
        <View
          className="absolute -left-20 top-24 h-32 w-32 rounded-full"
          style={{ backgroundColor: "rgba(16, 185, 129, 0.12)" }}
        />

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

        <View className="mt-6 flex-row rounded-full bg-background-secondary p-1">
          <Pressable
            onPress={() => setActiveTab("produto")}
            className={`flex-1 rounded-full px-4 py-2 ${
              activeTab === "produto"
                ? "bg-card-background shadow-lg"
                : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                activeTab === "produto"
                  ? "text-text-primary"
                  : "text-text-secondary"
              }`}
            >
              Produto
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("estoque")}
            className={`flex-1 rounded-full px-4 py-2 ${
              activeTab === "estoque"
                ? "bg-card-background shadow-lg"
                : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                activeTab === "estoque"
                  ? "text-text-primary"
                  : "text-text-secondary"
              }`}
            >
              Estoque
            </Text>
          </Pressable>
        </View>
      </View>

      <ListProducts
        products={products}
        loading={loading}
        error={error}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        activeTab={activeTab}
      />
    </View>
  );
}
