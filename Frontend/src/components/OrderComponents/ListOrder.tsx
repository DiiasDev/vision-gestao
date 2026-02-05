import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import OrderForm from "./OrderForm";
import { OrderService, type Order } from "../../services/Order.services";
import {
  formatCurrencyBR,
  formatDateBR,
  formatIdShort,
} from "../../utils/formatter";
import { ProductsService, type Product } from "../../services/Products.services";
import { ClienteService, type Client } from "../../services/Clients.services";
import { ServicesService, type Service } from "../../services/Services.services";

const statusLabelMap: Record<string, string> = {
  em_analise: "Em análise",
  aprovado: "Aprovado",
  recusado: "Recusado",
  convertido: "Convertido",
};
export default function ListOrder() {
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [actionAlert, setActionAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [ordersResult, productsResult, clientsResult, servicesResult] = await Promise.all([
      OrderService.getOrders(),
      ProductsService.getProducts(),
      ClienteService.getClients(),
      ServicesService.getServices(),
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
    if (clientsResult?.success) {
      setClients(clientsResult.clients ?? []);
    }
    if (servicesResult?.success) {
      setServices(servicesResult.services ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!actionAlert) return;
    const timer = setTimeout(() => setActionAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [actionAlert]);

  const productsById = useMemo(() => {
    return products.reduce((acc, product) => {
      if (product.id !== undefined && product.id !== null) {
        acc[String(product.id)] = product;
      }
      return acc;
    }, {} as Record<string, Product>);
  }, [products]);

  const clientsById = useMemo(() => {
    return clients.reduce((acc, client) => {
      if (client.id) acc[String(client.id)] = client;
      return acc;
    }, {} as Record<string, Client>);
  }, [clients]);

  const servicesById = useMemo(() => {
    return services.reduce((acc, service) => {
      if (service.id !== undefined && service.id !== null) {
        acc[String(service.id)] = service;
      }
      return acc;
    }, {} as Record<string, Service>);
  }, [services]);

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

  const formatCPFOrCNPJ = (value?: string | null) => {
    if (!value) return "";
    const digits = String(value).replace(/\D+/g, "");
    if (digits.length === 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    if (digits.length === 14) {
      return digits.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }
    return value;
  };

  const formatPhoneBR = (value?: string | null) => {
    if (!value) return "";
    const digits = String(value).replace(/\D+/g, "");
    if (digits.length === 11) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    if (digits.length === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };

  const buildOrderHtml = (order: Order) => {
    const contatoFormatado = formatPhoneBR(order.contato ?? "");
    const client = order.cliente_id
      ? clientsById[String(order.cliente_id)]
      : undefined;
    const documentoFormatado = formatCPFOrCNPJ(client?.cpf_cnpj ?? "");
    const serviceName =
      order.servico_descricao ??
      (order.servico_id ? servicesById[String(order.servico_id)]?.nome_servico : null) ??
      order.servico_id ??
      "-";
    const itemsHtml =
      order.items && order.items.length
        ? order.items
            .map(
              (item) => `
                <tr>
                  <td>${item.produto_nome ?? "Produto"}</td>
                  <td style="text-align:right;">${item.quantidade ?? 0}</td>
                  <td style="text-align:right;">${formatCurrencyBR(item.preco_unitario ?? 0)}</td>
                  <td style="text-align:right;">${formatCurrencyBR(item.total_item ?? 0)}</td>
                </tr>
              `
            )
            .join("")
        : `<tr><td colspan="4">Nenhum produto informado.</td></tr>`;

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: "Helvetica", Arial, sans-serif;
              color: #0F172A;
              padding: 32px;
              background: #F8FAFC;
            }
            .card {
              background: #FFFFFF;
              border: 1px solid #E2E8F0;
              border-radius: 16px;
              padding: 20px;
              box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
            }
            .brand {
              font-size: 18px;
              font-weight: 700;
              letter-spacing: 0.5px;
              color: #0F766E;
            }
            .title {
              font-size: 22px;
              font-weight: 700;
              margin: 6px 0 0;
            }
            .muted { color: #64748B; font-size: 12px; }
            .section {
              margin-top: 16px;
              padding: 14px;
              border: 1px solid #E2E8F0;
              border-radius: 14px;
              background: #F8FAFC;
            }
            .section-title {
              font-size: 13px;
              font-weight: 700;
              color: #0F172A;
              margin-bottom: 8px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              gap: 12px;
              font-size: 12px;
            }
            .row + .row { margin-top: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border-bottom: 1px solid #E2E8F0; padding: 8px; font-size: 12px; }
            th { text-align: left; color: #64748B; font-weight: 600; }
            .footer {
              margin-top: 16px;
              font-size: 11px;
              color: #94A3B8;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div>
                <div class="brand">Infiniti - Assistência técnica</div>
                <div class="title">Orçamento</div>
              </div>
              <div class="muted">
                <div>ID: ${order.id}</div>
                <div>Data: ${formatDateBR(order.validade ?? order.criado_em)}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Cliente</div>
              <div class="row">
                <div><strong>${order.cliente_nome ?? "Cliente não informado"}</strong></div>
                <div>${contatoFormatado}</div>
              </div>
              ${documentoFormatado ? `<div class="row">Documento: ${documentoFormatado}</div>` : ""}
              <div class="row">
                <div>Equipamento: ${order.equipamento ?? "-"}</div>
                <div>Serviço: ${serviceName}</div>
              </div>
              <div class="row">Problema: ${order.problema ?? "-"}</div>
            </div>

            <div class="section">
              <div class="section-title">Resumo financeiro</div>
              <div class="row">
                <div>Valor do serviço</div>
                <div><strong>${formatCurrencyBR(order.valor_servico ?? 0)}</strong></div>
              </div>
              <div class="row">
                <div>Produtos</div>
                <div><strong>${formatCurrencyBR(order.valor_itens ?? 0)}</strong></div>
              </div>
              <div class="row">
                <div>Total</div>
                <div><strong>${formatCurrencyBR(order.valor_total ?? 0)}</strong></div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Produtos</div>
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th style="text-align:right;">Qtd</th>
                    <th style="text-align:right;">Valor</th>
                    <th style="text-align:right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div class="footer">
              Orçamento válido até ${formatDateBR(order.validade ?? order.criado_em)}.
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleExport = async (order: Order) => {
    try {
      const html = buildOrderHtml(order);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      setActionAlert({
        type: "error",
        message: "Não foi possível exportar o orçamento.",
      });
    }
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
            {actionAlert ? (
              <View
                className={`rounded-2xl border px-4 py-3 ${
                  actionAlert.type === "success"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-rose-200 bg-rose-50"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    actionAlert.type === "success"
                      ? "text-emerald-700"
                      : "text-rose-700"
                  }`}
                >
                  {actionAlert.message}
                </Text>
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
                      {formatDateBR(order.validade ?? order.criado_em)}
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
        visible={!!editingOrder}
        animationType="slide"
        onRequestClose={() => setEditingOrder(null)}
      >
        <View className="flex-1 bg-background-primary">
          <OrderForm
            initialData={editingOrder}
            onBack={() => setEditingOrder(null)}
            onSaved={() => {
              setEditingOrder(null);
              loadOrders();
            }}
          />
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
              <View className="mb-4 flex-row gap-3">
                <Pressable
                  onPress={() => {
                    setEditingOrder(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-divider px-4 py-3"
                >
                  <Ionicons name="create-outline" size={16} color="#2563EB" />
                  <Text className="text-sm font-semibold text-text-primary">
                    Editar
                  </Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    if (!selectedOrder.id) return;
                    const result = await OrderService.convertToServiceRealized(
                      selectedOrder.id
                    );
                    if (result?.success) {
                      setSelectedOrder(null);
                      loadOrders();
                    }
                  }}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-divider px-4 py-3"
                >
                  <Ionicons name="swap-horizontal" size={16} color="#0E7490" />
                  <Text className="text-sm font-semibold text-text-primary">
                    Gerar ordem de serviço
                  </Text>
                </Pressable>
              </View>
              <View className="mb-4 flex-row gap-3">
                <Pressable
                  onPress={async () => {
                    if (!selectedOrder.id) return;
                    await handleExport(selectedOrder);
                  }}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-divider px-4 py-3"
                >
                  <Ionicons name="share-outline" size={16} color="#0E7490" />
                  <Text className="text-sm font-semibold text-text-primary">
                    Exportar PDF
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (!selectedOrder.id) return;
                    Alert.alert(
                      "Excluir orçamento",
                      "Tem certeza que deseja excluir este orçamento?",
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Excluir",
                          style: "destructive",
                          onPress: async () => {
                            const result = await OrderService.deleteOrder(
                              selectedOrder.id
                            );
                            if (result?.success) {
                              setActionAlert({
                                type: "success",
                                message: "Orçamento excluído com sucesso.",
                              });
                              setSelectedOrder(null);
                              loadOrders();
                            } else {
                              setActionAlert({
                                type: "error",
                                message:
                                  result?.message ??
                                  "Não foi possível excluir o orçamento.",
                              });
                            }
                          },
                        },
                      ]
                    );
                  }}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-divider px-4 py-3"
                >
                  <Ionicons name="trash-outline" size={16} color="#DC2626" />
                  <Text className="text-sm font-semibold text-text-primary">
                    Excluir
                  </Text>
                </Pressable>
              </View>
              <View className="rounded-[26px] border border-divider bg-card-background p-5">
                <Text className="text-xs text-text-tertiary">
                  {formatIdShort(selectedOrder.id)} •{" "}
                  {formatDateBR(selectedOrder.validade ?? selectedOrder.criado_em)}
                </Text>
                <Text className="mt-2 text-xl font-semibold text-text-primary">
                  {selectedOrder.servico_descricao ?? "Orçamento"}
                </Text>
                <Text className="mt-1 text-sm text-text-secondary">
                  {selectedOrder.cliente_nome ?? "Cliente não informado"}
                </Text>
                {selectedOrder.servico_descricao || selectedOrder.servico_id ? (
                  <Text className="mt-1 text-sm text-text-secondary">
                    Serviço: {selectedOrder.servico_descricao ??
                      (selectedOrder.servico_id
                        ? servicesById[String(selectedOrder.servico_id)]?.nome_servico
                        : undefined) ??
                      selectedOrder.servico_id}
                  </Text>
                ) : null}
                {selectedOrder.cliente_id ? (
                  <Text className="mt-1 text-sm text-text-secondary">
                    CPF/CNPJ: {formatCPFOrCNPJ(clientsById[String(selectedOrder.cliente_id)]?.cpf_cnpj ?? "")}
                  </Text>
                ) : null}
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
