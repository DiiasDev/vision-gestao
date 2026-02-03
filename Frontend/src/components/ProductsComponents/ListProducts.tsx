import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Product } from "../../services/Products.services";

type ListProductsProps = {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  refreshing?: boolean;
  activeTab: "produto" | "estoque";
};

const parseNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const normalized = String(value).replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "R$ 0,00";
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  }
};

const getInitials = (name?: string | null) => {
  if (!name) return "PR";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export default function ListProducts({
  products,
  loading,
  error,
  onRefresh,
  refreshing,
  activeTab,
}: ListProductsProps) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "compact">("cards");

  const safeProducts = Array.isArray(products) ? products : [];
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return safeProducts;
    return safeProducts.filter((product) => {
      const target = [
        product.nome,
        product.categoria,
        product.sku,
        product.codigo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return target.includes(term);
    });
  }, [safeProducts, search]);

  const totalProducts = safeProducts.length;
  const activeProducts = safeProducts.filter((product) => product.ativo !== false)
    .length;
  const lowStock = safeProducts.filter((product) => {
    const stock = parseNumber(product.estoque);
    return stock !== null && stock <= 5;
  }).length;
  const totalStock = safeProducts.reduce((acc, product) => {
    const stock = parseNumber(product.estoque) ?? 0;
    return acc + stock;
  }, 0);

  const listHeader = (
    <View className="pb-6">
      <View className="rounded-[28px] border border-divider bg-card-background p-5 shadow-lg">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-sm uppercase tracking-widest text-text-tertiary">
              Catálogo
            </Text>
            <Text className="mt-2 text-2xl font-semibold text-text-primary">
              {activeTab === "produto" ? "Produtos disponíveis" : "Controle de estoque"}
            </Text>
            <Text className="mt-2 text-sm text-text-secondary">
              {activeTab === "produto"
                ? "Acompanhe preços, categorias e status de cada item."
                : "Monitore níveis de estoque, custo e alertas de reposição."}
            </Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-background-secondary">
            <Ionicons
              name={activeTab === "produto" ? "cube-outline" : "layers-outline"}
              size={22}
              color="#2563EB"
            />
          </View>
        </View>

        <View className="mt-5 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-background-secondary px-4 py-3">
            <Text className="text-xs text-text-secondary">Produtos ativos</Text>
            <Text className="mt-1 text-lg font-semibold text-text-primary">
              {activeProducts}
            </Text>
            <Text className="mt-1 text-[11px] text-text-tertiary">
              de {totalProducts} cadastrados
            </Text>
          </View>
          <View className="flex-1 rounded-2xl bg-background-secondary px-4 py-3">
            <Text className="text-xs text-text-secondary">Estoque total</Text>
            <Text className="mt-1 text-lg font-semibold text-text-primary">
              {totalStock}
            </Text>
            <Text className="mt-1 text-[11px] text-text-tertiary">
              {lowStock} em nível crítico
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-6 flex-row items-center gap-3">
        <View className="flex-1 flex-row items-center gap-2 rounded-2xl border border-divider bg-card-background px-4 py-3">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Buscar por nome, SKU ou categoria"
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-sm text-text-primary"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          className="h-12 w-12 items-center justify-center rounded-2xl border border-divider bg-card-background"
          onPress={() =>
            setViewMode((current) => (current === "cards" ? "compact" : "cards"))
          }
        >
          <Ionicons
            name={viewMode === "cards" ? "grid-outline" : "list-outline"}
            size={20}
            color="#6B7280"
          />
        </Pressable>
      </View>

      {error ? (
        <View className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <Text className="text-sm font-semibold text-rose-700">
            Não foi possível carregar os produtos
          </Text>
          <Text className="mt-1 text-sm text-rose-600">
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );

  const renderProductCard = (item: Product) => {
    const stock = parseNumber(item.estoque);
    const isLowStock = stock !== null && stock <= 5;
    const price = parseNumber(item.preco_venda);
    const cost = parseNumber(item.custo);
    const statusLabel = item.ativo === false ? "Inativo" : "Ativo";

    if (viewMode === "compact") {
      return (
        <View className="mb-3 rounded-2xl border border-divider bg-card-background px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-background-secondary">
                <Text className="text-xs font-semibold text-text-primary">
                  {getInitials(item.nome)}
                </Text>
              </View>
              <View>
                <Text className="text-sm font-semibold text-text-primary">
                  {item.nome ?? "Produto sem nome"}
                </Text>
                <Text className="text-xs text-text-tertiary">
                  {item.categoria ?? "Sem categoria"} • {item.sku ?? "SKU n/d"}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-sm font-semibold text-text-primary">
                {formatCurrency(price ?? 0)}
              </Text>
              <Text className={`text-xs ${isLowStock ? "text-state-error" : "text-text-tertiary"}`}>
                {stock ?? 0} {item.unidade ?? "un"}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View className="mb-4 overflow-hidden rounded-[26px] border border-divider bg-card-background p-5 shadow-lg">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-3 pr-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-background-secondary">
              <Text className="text-sm font-semibold text-text-primary">
                {getInitials(item.nome)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-text-primary">
                {item.nome ?? "Produto sem nome"}
              </Text>
              <Text className="mt-1 text-xs text-text-tertiary">
                {item.categoria ?? "Sem categoria"} • {item.sku ?? "SKU n/d"}
              </Text>
            </View>
          </View>
          <View
            className={`shrink-0 rounded-full px-3 py-1 ${
              item.ativo === false ? "bg-rose-100" : "bg-emerald-100"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                item.ativo === false ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {statusLabel}
            </Text>
          </View>
        </View>

        {activeTab === "produto" ? (
          <View className="mt-4 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-text-secondary">Preço de venda</Text>
              <Text className="mt-1 text-lg font-semibold text-text-primary">
                {formatCurrency(price ?? 0)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-text-secondary">Estoque</Text>
              <Text
                className={`mt-1 text-lg font-semibold ${
                  isLowStock ? "text-state-error" : "text-text-primary"
                }`}
              >
                {stock ?? 0} {item.unidade ?? "un"}
              </Text>
            </View>
          </View>
        ) : (
          <View className="mt-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-text-secondary">Nível de estoque</Text>
              <Text
                className={`text-xs font-semibold ${
                  isLowStock ? "text-state-error" : "text-state-success"
                }`}
              >
                {isLowStock ? "Reposição urgente" : "Estoque saudável"}
              </Text>
            </View>
            <View className="mt-2 h-2 overflow-hidden rounded-full bg-background-secondary">
              <View
                className={`h-2 ${
                  isLowStock ? "bg-state-error" : "bg-state-success"
                }`}
                style={{
                  width: `${Math.min(100, Math.max(12, (stock ?? 0) * 5))}%`,
                }}
              />
            </View>
            <View className="mt-3 flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-text-secondary">Quantidade</Text>
                <Text className="mt-1 text-base font-semibold text-text-primary">
                  {stock ?? 0} {item.unidade ?? "un"}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-text-secondary">Custo médio</Text>
                <Text className="mt-1 text-base font-semibold text-text-primary">
                  {formatCurrency(cost ?? 0)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="mt-4 flex-row items-center justify-between">
          <Text className="text-xs text-text-tertiary">
            Código: {item.codigo ?? "—"}
          </Text>
          <Text className="text-xs text-text-tertiary">
            SKU: {item.sku ?? "—"}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#2563EB" />
        <Text className="mt-2 text-sm text-text-secondary">
          Carregando produtos...
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item, index) =>
        item.id?.toString() ?? item.sku ?? item.codigo ?? `product-${index}`
      }
      renderItem={({ item }) => renderProductCard(item)}
      ListHeaderComponent={listHeader}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
      onRefresh={onRefresh}
      refreshing={Boolean(refreshing)}
      ListEmptyComponent={
        <View className="rounded-[26px] border border-divider bg-card-background p-6">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-background-secondary">
            <Ionicons name="cube-outline" size={22} color="#9CA3AF" />
          </View>
          <Text className="mt-4 text-lg font-semibold text-text-primary">
            Nenhum produto encontrado
          </Text>
          <Text className="mt-2 text-sm text-text-secondary">
            Cadastre novos produtos ou refine sua busca para exibir resultados.
          </Text>
        </View>
      }
    />
  );
}
