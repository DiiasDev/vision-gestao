import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import OrderForm from "./OrderForm";
import { OrderService, type Order } from "../../services/Order.services";
import {
  formatCurrencyBR,
  formatDateBR,
  formatIdShort,
} from "../../utils/formatter";
import { ProductsService, type Product } from "../../services/Products.services";

const statusLabelMap: Record<string, string> = {
  em_analise: "Em análise",
  aprovado: "Aprovado",
  recusado: "Recusado",
};
export default function ListOrder() {
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [ordersResult, productsResult] = await Promise.all([
      OrderService.getOrders(),
      ProductsService.getProducts(),
    ]);
    if (ordersResult?.success) {
      setOrders(ordersResult.orders ?? []);
    } else {
      setOrders([]);
      setError(ordersResult?.message ?? "Falha ao carregar orçamentos.");
    }
    if (productsResult?.success) {
      setProducts(productsResult.products ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const productsById = useMemo(() => {
    return products.reduce((acc, product) => {
      if (product.id !== undefined && product.id !== null) {
        acc[String(product.id)] = product;
      }
      return acc;
    }, {} as Record<string, Product>);
  }, [products]);

  const getImageUri = (imagem?: string | null) => {
    if (!imagem) return null;
    const trimmed = String(imagem).trim();
    if (!trimmed) return null;
    if (
      trimmed.startsWith("data:image/") ||
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("file://") ||
      trimmed.startsWith("content://")
    ) {
      return trimmed;
    }
    const looksLikeBase64 =
      trimmed.length > 40 && /^[A-Za-z0-9+/=\s]+$/.test(trimmed);
    return looksLikeBase64 ? `data:image/jpeg;base64,${trimmed}` : null;
  };

  return (
    <View className="flex-1 bg-background-primary">
      <View className="px-6 pt-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-semibold text-text-primary">
              Orçamentos
            </Text>
            <Text className="mt-1 text-xs text-text-tertiary">
              Acompanhe propostas e serviços orçados.
            </Text>
          </View>
          <Pressable
            onPress={() => setIsNewOpen(true)}
            className="flex-row items-center gap-2 rounded-full border border-divider bg-card-background px-4 py-2"
          >
            <Ionicons name="add" size={16} color="#0E7490" />
            <Text className="text-sm font-semibold text-text-primary">
              Novo orçamento
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="mt-10 items-center justify-center">
            <ActivityIndicator color="#0E7490" />
            <Text className="mt-2 text-sm text-text-secondary">
              Carregando orçamentos...
            </Text>
          </View>
        ) : orders.length === 0 ? (
          <View className="mt-10 rounded-[26px] border border-divider bg-card-background p-6">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-background-secondary">
              <Ionicons name="document-text-outline" size={22} color="#9CA3AF" />
            </View>
            <Text className="mt-4 text-lg font-semibold text-text-primary">
              Nenhum orçamento cadastrado
            </Text>
            <Text className="mt-2 text-sm text-text-secondary">
              Crie um novo orçamento para começar a registrar propostas.
            </Text>
            <Pressable
              onPress={() => setIsNewOpen(true)}
              className="mt-4 items-center rounded-2xl bg-button-primary px-4 py-3"
            >
              <Text className="text-sm font-semibold text-white">
                Criar orçamento
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="mt-6 gap-4">
            {error ? (
              <View className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                <Text className="text-sm font-semibold text-rose-700">
                  Não foi possível carregar os orçamentos
                </Text>
                <Text className="mt-1 text-sm text-rose-600">{error}</Text>
              </View>
            ) : null}
            {orders.map((order) => (
              <View
                key={order.id}
                className="rounded-[26px] border border-divider bg-card-background p-5 shadow-lg"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-xs text-text-tertiary">
                      {formatIdShort(order.id)} •{" "}
                      {formatDateBR(order.criado_em)}
                    </Text>
                    <Text className="mt-2 text-base font-semibold text-text-primary">
                      {order.servico_descricao ?? "Orçamento"}
                    </Text>
                    <Text className="mt-1 text-xs text-text-secondary">
                      {order.cliente_nome ?? "Cliente não informado"}
                    </Text>
                  </View>
                  <View className="rounded-full bg-emerald-100 px-3 py-1">
                    <Text className="text-xs font-semibold text-emerald-600">
                      {statusLabelMap[order.status ?? "em_analise"] ??
                        order.status ??
                        "Em análise"}
                    </Text>
                  </View>
                </View>

                <View className="mt-4 flex-row items-center justify-between">
                  <View>
                    <Text className="text-xs text-text-secondary">
                      Valor total
                    </Text>
                    <Text className="mt-1 text-lg font-semibold text-text-primary">
                      {formatCurrencyBR(order.valor_total ?? 0)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setSelectedOrder(order)}
                    className="flex-row items-center gap-2 rounded-full border border-divider px-4 py-2"
                  >
                    <Ionicons name="document-text-outline" size={16} color="#0E7490" />
                    <Text className="text-sm font-semibold text-text-primary">
                      Ver detalhes
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isNewOpen}
        animationType="slide"
        onRequestClose={() => setIsNewOpen(false)}
      >
        <View className="flex-1 bg-background-primary">
          <OrderForm onBack={() => setIsNewOpen(false)} />
        </View>
      </Modal>

      <Modal
        visible={!!selectedOrder}
        animationType="slide"
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View className="flex-1 bg-background-primary">
          <View className="flex-row items-center justify-between px-6 pt-10">
            <Text className="text-lg font-semibold text-text-primary">
              Detalhes do orçamento
            </Text>
            <Pressable
              onPress={() => setSelectedOrder(null)}
              className="rounded-full border border-divider px-3 py-1"
            >
              <Text className="text-sm text-text-secondary">Fechar</Text>
            </Pressable>
          </View>
          {selectedOrder ? (
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
              <View className="rounded-[26px] border border-divider bg-card-background p-5">
                <Text className="text-xs text-text-tertiary">
                  {formatIdShort(selectedOrder.id)} •{" "}
                  {formatDateBR(selectedOrder.criado_em)}
                </Text>
                <Text className="mt-2 text-xl font-semibold text-text-primary">
                  {selectedOrder.servico_descricao ?? "Orçamento"}
                </Text>
                <Text className="mt-1 text-sm text-text-secondary">
                  {selectedOrder.cliente_nome ?? "Cliente não informado"}
                </Text>
                {selectedOrder.equipamento ? (
                  <Text className="mt-1 text-sm text-text-secondary">
                    Equipamento: {selectedOrder.equipamento}
                  </Text>
                ) : null}
                {selectedOrder.problema ? (
                  <Text className="mt-1 text-sm text-text-secondary">
                    {selectedOrder.problema}
                  </Text>
                ) : null}
                {selectedOrder.observacoes ? (
                  <Text className="mt-2 text-sm text-text-secondary">
                    {selectedOrder.observacoes}
                  </Text>
                ) : null}
              </View>

              <View className="mt-4 rounded-[26px] border border-divider bg-card-background p-5">
                <Text className="text-base font-semibold text-text-primary">
                  Resumo financeiro
                </Text>
                <View className="mt-3 gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-text-secondary">
                      Valor do serviço
                    </Text>
                    <Text className="text-sm font-semibold text-text-primary">
                      {formatCurrencyBR(selectedOrder.valor_servico ?? 0)}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-text-secondary">Produtos</Text>
                    <Text className="text-sm font-semibold text-text-primary">
                      {formatCurrencyBR(selectedOrder.valor_itens ?? 0)}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-text-secondary">Total</Text>
                    <Text className="text-base font-semibold text-text-primary">
                      {formatCurrencyBR(selectedOrder.valor_total ?? 0)}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-4 rounded-[26px] border border-divider bg-card-background p-5">
                <Text className="text-base font-semibold text-text-primary">
                  Produtos adicionados
                </Text>
                <View className="mt-3 gap-2">
                  {(selectedOrder.items ?? []).length ? (
                    selectedOrder.items?.map((item) => {
                      const product =
                        item.produto_id !== undefined && item.produto_id !== null
                          ? productsById[String(item.produto_id)]
                          : undefined;
                      const imageUri = getImageUri(product?.imagem ?? null);
                      return (
                        <View
                          key={item.id ?? `${item.produto_id}-${item.produto_nome}`}
                          className="flex-row items-center justify-between rounded-2xl border border-divider px-4 py-3"
                        >
                          <View className="flex-row items-center gap-3">
                            {imageUri ? (
                              <Image
                                source={{ uri: imageUri }}
                                className="h-10 w-10 rounded-xl border border-divider"
                                resizeMode="cover"
                              />
                            ) : (
                              <View className="h-10 w-10 items-center justify-center rounded-xl bg-background-secondary">
                                <Ionicons
                                  name="cube-outline"
                                  size={16}
                                  color="#9CA3AF"
                                />
                              </View>
                            )}
                            <View>
                              <Text className="text-sm font-semibold text-text-primary">
                                {item.produto_nome ?? "Produto"}
                              </Text>
                              <Text className="text-xs text-text-tertiary">
                                Qtd: {item.quantidade ?? 0} • R$ {item.preco_unitario ?? 0}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-sm font-semibold text-text-primary">
                            {formatCurrencyBR(item.total_item ?? 0)}
                          </Text>
                        </View>
                      );
                    })
                  ) : (
                    <Text className="text-sm text-text-secondary">
                      Nenhum produto informado.
                    </Text>
                  )}
                </View>
              </View>
            </ScrollView>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
