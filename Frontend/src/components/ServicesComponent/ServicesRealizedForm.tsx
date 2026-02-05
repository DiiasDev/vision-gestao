import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ClienteService, type Client } from "../../services/Clients.services";
import { ProductsService, type Product } from "../../services/Products.services";
import {
  ServicesService,
  type Service,
  type ServiceRealized,
} from "../../services/Services.services";
import { formatCurrencyBR } from "../../utils/formatter";

type ServicesRealizedFormProps = {
  onBack?: () => void;
  initialData?: ServiceRealized | null;
  onSaved?: () => void;
};

type SelectOption = {
  value: string;
  label: string;
  subtitle?: string;
  image?: string | null;
};

type SelectState = {
  title: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
};

type ProductItem = {
  key: string;
  productKey?: string;
  quantity: string;
  price: string;
  cost: string;
};

const toNumber = (value?: string | number | null) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = formatCurrencyBR;

const resolveSelectLabel = (
  value: string | undefined,
  options: SelectOption[],
  placeholder: string
) => {
  if (!value) return placeholder;
  const match = options.find((option) => option.value === value);
  return match?.label ?? placeholder;
};

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

const createProductItem = (): ProductItem => ({
  key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  productKey: undefined,
  quantity: "1",
  price: "",
  cost: "",
});

export default function ServicesRealizedForm({
  onBack,
  initialData,
  onSaved,
}: ServicesRealizedFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeSelect, setActiveSelect] = useState<SelectState | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const [selectedClientKey, setSelectedClientKey] = useState<string | undefined>(
    undefined
  );
  const [selectedServiceKey, setSelectedServiceKey] = useState<
    string | undefined
  >(undefined);
  const [contact, setContact] = useState<string>("");
  const [equipment, setEquipment] = useState<string>("");
  const [manualServiceName, setManualServiceName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [serviceDate, setServiceDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<string>("concluido");
  const [notes, setNotes] = useState<string>("");
  const [serviceValue, setServiceValue] = useState<string>("");
  const [serviceCost, setServiceCost] = useState<string>("");
  const [items, setItems] = useState<ProductItem[]>([createProductItem()]);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 5000);
    return () => clearTimeout(timer);
  }, [alert]);

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      const [clientsResult, servicesResult, productsResult] = await Promise.all([
        ClienteService.getClients(),
        ServicesService.getServices(),
        ProductsService.getProducts(),
      ]);
      setClients(clientsResult?.clients ?? []);
      setServices(servicesResult?.services ?? []);
      setProducts(productsResult?.products ?? []);
      setLoadingData(false);
    };

      loadData();
  }, []);

  useEffect(() => {
    if (!initialData) return;
    setSelectedClientKey(initialData.cliente_nome ?? "");
    setContact(initialData.contato ?? "");
    setSelectedServiceKey(
      initialData.servico_id
        ? String(initialData.servico_id)
        : initialData.servico_nome ?? undefined
    );
    setManualServiceName(initialData.servico_id ? "" : initialData.servico_nome ?? "");
    setEquipment(initialData.equipamento ?? "");
    setDescription(initialData.descricao ?? "");
    setServiceDate(
      initialData.data_servico ? new Date(initialData.data_servico) : null
    );
    setStatus(initialData.status ?? "concluido");
    setNotes(initialData.observacoes ?? "");
    setServiceValue(
      initialData.valor_servico !== null && initialData.valor_servico !== undefined
        ? String(initialData.valor_servico)
        : ""
    );
    setServiceCost(
      initialData.custo_servico !== null && initialData.custo_servico !== undefined
        ? String(initialData.custo_servico)
        : ""
    );

    if (initialData.items?.length) {
      setItems(
        initialData.items.map((item) => ({
          key: item.id ?? `${item.produto_id ?? Math.random()}`,
          productKey:
            item.produto_id !== undefined && item.produto_id !== null
              ? String(item.produto_id)
              : undefined,
          quantity:
            item.quantidade !== null && item.quantidade !== undefined
              ? String(item.quantidade)
              : "1",
          price:
            item.preco_unitario !== null && item.preco_unitario !== undefined
              ? String(item.preco_unitario)
              : "",
          cost:
            item.custo_unitario !== null && item.custo_unitario !== undefined
              ? String(item.custo_unitario)
              : "",
        }))
      );
    }
  }, [initialData]);

  const clientOptions = useMemo<SelectOption[]>(() => {
    return clients.map((client) => ({
      value: client.nome_completo,
      label: client.nome_completo,
      subtitle: client.cidade ?? "Sem cidade",
    }));
  }, [clients]);

  const serviceOptions = useMemo<SelectOption[]>(() => {
    return services.map((service) => ({
      value: String(service.id ?? service.nome_servico),
      label: service.nome_servico,
      subtitle: service.categoria ?? "Sem categoria",
    }));
  }, [services]);

  const productOptions = useMemo<SelectOption[]>(() => {
    return products.map((product) => ({
      value: String(
        product.id ?? product.sku ?? product.codigo ?? product.nome ?? ""
      ),
      label: product.nome ?? "Produto",
      subtitle: product.categoria ?? "Sem categoria",
      image: product.imagem ?? null,
    }));
  }, [products]);

  const statusOptions: SelectOption[] = [
    {
      value: "concluido",
      label: "Concluído",
      subtitle: "Finalizado e entregue ao cliente.",
    },
    {
      value: "em_execucao",
      label: "Em execução",
      subtitle: "Serviço em andamento.",
    },
    {
      value: "agendado",
      label: "Agendado",
      subtitle: "Previsto para uma data futura.",
    },
  ];

  const resolveServiceByKey = (key?: string) => {
    if (!key) return undefined;
    return services.find((service) => {
      const candidate = String(service.id ?? service.nome_servico);
      return candidate === key;
    });
  };

  const selectedService = resolveServiceByKey(selectedServiceKey);

  const resolveProductByKey = (key?: string) => {
    if (!key) return undefined;
    return products.find((product) => {
      const candidate = String(
        product.id ?? product.sku ?? product.codigo ?? product.nome ?? ""
      );
      return candidate === key;
    });
  };

  const updateItem = (key: string, patch: Partial<ProductItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item))
    );
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const productsTotal = items.reduce((acc, item) => {
    const quantity = toNumber(item.quantity);
    const price = toNumber(item.price);
    return acc + quantity * price;
  }, 0);

  const productsCostTotal = items.reduce((acc, item) => {
    const quantity = toNumber(item.quantity);
    const cost = toNumber(item.cost);
    return acc + quantity * cost;
  }, 0);

  const baseServiceValue = toNumber(serviceValue || (selectedService?.preco ?? 0));
  const totalValue = baseServiceValue + productsTotal;
  const baseServiceCost = toNumber(serviceCost);
  const totalCost = baseServiceCost + productsCostTotal;

  const handleSubmit = async () => {
    if (!selectedClientKey) {
      setAlert({
        type: "error",
        title: "Dados obrigatórios",
        message: "Selecione o cliente.",
      });
      return;
    }
    if (!selectedServiceKey && !manualServiceName.trim()) {
      setAlert({
        type: "error",
        title: "Dados obrigatórios",
        message: "Selecione ou informe o serviço realizado.",
      });
      return;
    }

    setSaving(true);

    const itemsPayload = items
      .filter((item) => item.productKey)
      .map((item) => {
        const product = resolveProductByKey(item.productKey);
        return {
          product_id: product?.id ?? null,
          product_name: product?.nome ?? null,
          quantity: toNumber(item.quantity),
          price: toNumber(item.price),
          cost: toNumber(item.cost),
        };
      });

    const payload = {
      client_id:
        clients.find((client) => client.nome_completo === selectedClientKey)?.id ??
        null,
      client_name: selectedClientKey,
      client_contact: contact,
      service_id: selectedService?.id ? String(selectedService.id) : null,
      service_name: selectedService?.nome_servico ?? manualServiceName,
      equipment,
      description,
      service_date: serviceDate
        ? serviceDate.toLocaleDateString("pt-BR")
        : null,
      status,
      value: baseServiceValue,
      cost: baseServiceCost,
      items: itemsPayload,
      notes,
    };

    const result = initialData?.id
      ? await ServicesService.updateServiceRealized(initialData.id, payload)
      : await ServicesService.createServiceRealized(payload);

    setSaving(false);

    if (result?.success) {
      setAlert({
        type: "success",
        title: "Serviço registrado",
        message: "O serviço realizado foi salvo com sucesso.",
      });
      onSaved?.();
      return;
    }

    setAlert({
      type: "error",
      title: "Erro ao salvar",
      message:
        result?.message ??
        "Não foi possível registrar o serviço. Tente novamente.",
    });
  };

  const renderSelect = (
    label: string,
    value: string | undefined,
    options: SelectOption[],
    onSelect: (value: string) => void,
    placeholder: string
  ) => (
    <Pressable
      onPress={() =>
        setActiveSelect({
          title: label,
          options,
          onSelect,
        })
      }
      className="rounded-2xl border border-divider bg-card-background px-4 py-3"
    >
      <Text className="text-xs text-text-secondary">{label}</Text>
      <Text className="mt-1 text-base font-semibold text-text-primary">
        {resolveSelectLabel(value, options, placeholder)}
      </Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-[28px] border border-divider bg-card-background p-6 shadow-lg">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-sm uppercase tracking-widest text-text-tertiary">
                Serviços realizados
              </Text>
              <Text className="mt-2 text-2xl font-semibold text-text-primary">
                Registrar atendimento
              </Text>
              <Text className="mt-2 text-sm text-text-secondary">
                Preencha os dados para salvar o serviço executado.
              </Text>
            </View>
            {onBack ? (
              <Pressable
                onPress={onBack}
                className="h-10 w-10 items-center justify-center rounded-full border border-divider"
              >
                <Ionicons name="close" size={18} color="#6B7280" />
              </Pressable>
            ) : null}
          </View>
        </View>

        {loadingData ? (
          <View className="mt-6 items-center justify-center">
            <ActivityIndicator color="#0E7490" />
            <Text className="mt-2 text-sm text-text-secondary">
              Carregando dados...
            </Text>
          </View>
        ) : (
          <>
            <View className="mt-6 gap-4">
              {renderSelect(
                "Cliente",
                selectedClientKey,
                clientOptions,
                (value) => {
                  setSelectedClientKey(value);
                  const client = clients.find(
                    (item) => item.nome_completo === value
                  );
                  if (client?.telefone) {
                    setContact(client.telefone);
                  }
                },
                "Selecione o cliente"
              )}

              <View className="rounded-2xl border border-divider bg-card-background px-4 py-3">
                <Text className="text-xs text-text-secondary">Contato</Text>
                <TextInput
                  className="mt-1 text-base font-semibold text-text-primary"
                  placeholder="Telefone ou whatsapp"
                  placeholderTextColor="#9CA3AF"
                  value={contact}
                  onChangeText={setContact}
                />
              </View>

              {renderSelect(
                "Serviço executado",
                selectedServiceKey,
                serviceOptions,
                (value) => {
                  setSelectedServiceKey(value);
                  const service = resolveServiceByKey(value);
                  if (service?.preco) {
                    setServiceValue(String(service.preco));
                  }
                },
                "Selecione o serviço"
              )}

              {!selectedServiceKey ? (
                <View className="rounded-2xl border border-divider bg-card-background px-4 py-3">
                  <Text className="text-xs text-text-secondary">
                    Serviço realizado (manual)
                  </Text>
                  <TextInput
                    className="mt-1 text-base font-semibold text-text-primary"
                    placeholder="Descreva o serviço executado"
                    placeholderTextColor="#9CA3AF"
                    value={manualServiceName}
                    onChangeText={setManualServiceName}
                  />
                </View>
              ) : null}

              <View className="rounded-2xl border border-divider bg-card-background px-4 py-3">
                <Text className="text-xs text-text-secondary">Equipamento</Text>
                <TextInput
                  className="mt-1 text-base font-semibold text-text-primary"
                  placeholder="Ex.: Notebook Dell"
                  placeholderTextColor="#9CA3AF"
                  value={equipment}
                  onChangeText={setEquipment}
                />
              </View>

              <View className="rounded-2xl border border-divider bg-card-background px-4 py-3">
                <Text className="text-xs text-text-secondary">
                  Descrição do serviço
                </Text>
                <TextInput
                  className="mt-1 text-base font-semibold text-text-primary"
                  placeholder="Detalhe o que foi realizado"
                  placeholderTextColor="#9CA3AF"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
              </View>
            </View>

            <View className="mt-6 rounded-[26px] border border-divider bg-card-background p-5">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-text-primary">
                  Produtos utilizados
                </Text>
                <Pressable
                  onPress={() =>
                    setItems((prev) => [...prev, createProductItem()])
                  }
                  className="flex-row items-center gap-2 rounded-full border border-divider px-3 py-1"
                >
                  <Ionicons name="add" size={14} color="#0E7490" />
                  <Text className="text-xs font-semibold text-text-primary">
                    Adicionar
                  </Text>
                </Pressable>
              </View>

              <View className="mt-4 gap-4">
                {items.map((item) => {
                  const selectedProduct = resolveProductByKey(item.productKey);
                  const productLabel =
                    selectedProduct?.nome ?? "Selecionar produto";
                  const productImage = getImageUri(selectedProduct?.imagem ?? null);
                  return (
                    <View
                      key={item.key}
                      className="rounded-2xl border border-divider bg-background-secondary p-4"
                    >
                      <View className="flex-row items-center justify-between">
                        <Pressable
                          onPress={() =>
                            setActiveSelect({
                              title: "Produto",
                              options: productOptions,
                              onSelect: (value) => {
                                updateItem(item.key, { productKey: value });
                                const product = resolveProductByKey(value);
                                if (product?.preco_venda && !item.price) {
                                  updateItem(item.key, {
                                    price: String(product.preco_venda),
                                  });
                                }
                                if (product?.custo && !item.cost) {
                                  updateItem(item.key, {
                                    cost: String(product.custo),
                                  });
                                }
                              },
                            })
                          }
                          className="flex-1 rounded-2xl border border-divider bg-card-background px-3 py-3"
                        >
                          <View className="flex-row items-center gap-3">
                            {productImage ? (
                              <Image
                                source={{ uri: productImage }}
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
                            <View className="flex-1">
                              <Text className="text-xs text-text-secondary">
                                Produto
                              </Text>
                              <Text className="mt-1 text-sm font-semibold text-text-primary">
                                {productLabel}
                              </Text>
                            </View>
                          </View>
                        </Pressable>
                        <Pressable
                          onPress={() => removeItem(item.key)}
                          className="ml-3 h-10 w-10 items-center justify-center rounded-full border border-divider"
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#DC2626"
                          />
                        </Pressable>
                      </View>

                      <View className="mt-3 flex-row gap-3">
                        <View className="flex-1 rounded-2xl border border-divider bg-card-background px-3 py-3">
                          <Text className="text-xs text-text-secondary">
                            Qtd
                          </Text>
                          <TextInput
                            className="mt-1 text-sm font-semibold text-text-primary"
                            keyboardType="numeric"
                            value={item.quantity}
                            onChangeText={(text) =>
                              updateItem(item.key, { quantity: text })
                            }
                          />
                        </View>
                        <View className="flex-1 rounded-2xl border border-divider bg-card-background px-3 py-3">
                          <Text className="text-xs text-text-secondary">
                            Preço
                          </Text>
                          <TextInput
                            className="mt-1 text-sm font-semibold text-text-primary"
                            keyboardType="numeric"
                            value={item.price}
                            onChangeText={(text) =>
                              updateItem(item.key, { price: text })
                            }
                          />
                        </View>
                        <View className="flex-1 rounded-2xl border border-divider bg-card-background px-3 py-3">
                          <Text className="text-xs text-text-secondary">
                            Custo
                          </Text>
                          <TextInput
                            className="mt-1 text-sm font-semibold text-text-primary"
                            keyboardType="numeric"
                            value={item.cost}
                            onChangeText={(text) =>
                              updateItem(item.key, { cost: text })
                            }
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            <View className="mt-6 rounded-[26px] border border-divider bg-card-background p-5">
              <Text className="text-base font-semibold text-text-primary">
                Informações finais
              </Text>
              <View className="mt-4 gap-4">
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  className="rounded-2xl border border-divider bg-background-secondary px-4 py-3"
                >
                  <Text className="text-xs text-text-secondary">
                    Data do serviço
                  </Text>
                  <Text className="mt-1 text-base font-semibold text-text-primary">
                    {serviceDate
                      ? serviceDate.toLocaleDateString("pt-BR")
                      : "Selecionar data"}
                  </Text>
                </Pressable>

                {renderSelect(
                  "Status",
                  status,
                  statusOptions,
                  (value) => setStatus(value),
                  "Selecione o status"
                )}

                <View className="rounded-2xl border border-divider bg-background-secondary px-4 py-3">
                  <Text className="text-xs text-text-secondary">
                    Valor do serviço
                  </Text>
                  <View className="mt-2 flex-row items-center justify-between">
                    <TextInput
                      className="flex-1 text-base font-semibold text-text-primary"
                      placeholder="0,00"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={serviceValue}
                      onChangeText={setServiceValue}
                    />
                    <Text className="text-sm text-text-tertiary">
                      {formatCurrency(baseServiceValue)}
                    </Text>
                  </View>
                </View>

                <View className="rounded-2xl border border-divider bg-background-secondary px-4 py-3">
                  <Text className="text-xs text-text-secondary">
                    Custo do serviço
                  </Text>
                  <View className="mt-2 flex-row items-center justify-between">
                    <TextInput
                      className="flex-1 text-base font-semibold text-text-primary"
                      placeholder="0,00"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={serviceCost}
                      onChangeText={setServiceCost}
                    />
                    <Text className="text-sm text-text-tertiary">
                      {formatCurrency(baseServiceCost)}
                    </Text>
                  </View>
                </View>

                <View className="rounded-2xl border border-divider bg-background-secondary px-4 py-3">
                  <Text className="text-xs text-text-secondary">
                    Valor total (serviço + produtos)
                  </Text>
                  <View className="mt-2 flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-text-primary">
                      {formatCurrency(totalValue)}
                    </Text>
                    <Text className="text-xs text-text-tertiary">
                      Produtos: {formatCurrency(productsTotal)}
                    </Text>
                  </View>
                </View>

                <View className="rounded-2xl border border-divider bg-background-secondary px-4 py-3">
                  <Text className="text-xs text-text-secondary">
                    Custo total (serviço + produtos)
                  </Text>
                  <View className="mt-2 flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-text-primary">
                      {formatCurrency(totalCost)}
                    </Text>
                    <Text className="text-xs text-text-tertiary">
                      Produtos: {formatCurrency(productsCostTotal)}
                    </Text>
                  </View>
                </View>

                <View className="rounded-2xl border border-divider bg-background-secondary px-4 py-3">
                  <Text className="text-xs text-text-secondary">Observações</Text>
                  <TextInput
                    className="mt-1 text-base font-semibold text-text-primary"
                    placeholder="Informações adicionais"
                    placeholderTextColor="#9CA3AF"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                  />
                </View>
              </View>
            </View>
          </>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={saving || loadingData}
          className={`mt-8 items-center rounded-2xl bg-button-primary px-4 py-4 ${
            saving || loadingData ? "opacity-70" : ""
          }`}
        >
          <Text className="text-base font-semibold text-white">
            {saving ? "Salvando..." : "Registrar serviço"}
          </Text>
        </Pressable>

        {alert ? (
          <View
            className={`mt-4 rounded-2xl border px-4 py-3 ${
              alert.type === "success"
                ? "border-emerald-200 bg-emerald-50"
                : "border-rose-200 bg-rose-50"
            }`}
          >
            <Text className="text-sm font-semibold text-text-primary">
              {alert.title}
            </Text>
            <Text className="mt-1 text-sm text-text-secondary">
              {alert.message}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <Modal
        transparent
        visible={showDatePicker}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable
          onPress={() => setShowDatePicker(false)}
          className="flex-1 items-center justify-center bg-black/40 px-6"
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            className="w-full rounded-3xl bg-card-background p-5"
          >
            <Text className="text-lg font-semibold text-text-primary">
              Selecionar data
            </Text>
            <View className="mt-4">
              <DateTimePicker
                value={serviceDate ?? new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event, selected) => {
                  const chosen = selected ?? serviceDate ?? new Date();
                  if (Platform.OS === "android") {
                    setShowDatePicker(false);
                  }
                  if (event.type === "set") {
                    setServiceDate(chosen);
                  }
                }}
              />
            </View>
            {Platform.OS === "ios" ? (
              <Pressable
                onPress={() => setShowDatePicker(false)}
                className="mt-4 items-center rounded-2xl bg-button-primary px-4 py-3"
              >
                <Text className="text-sm font-semibold text-white">
                  Confirmar
                </Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={!!activeSelect}
        animationType="fade"
        onRequestClose={() => setActiveSelect(null)}
      >
        <Pressable
          onPress={() => setActiveSelect(null)}
          className="flex-1 items-center justify-center bg-black/40 px-6"
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            className="w-full max-h-[70%] rounded-3xl bg-card-background p-5"
          >
            <Text className="text-lg font-semibold text-text-primary">
              {activeSelect?.title}
            </Text>
            <Text className="mt-1 text-sm text-text-secondary">
              Escolha uma opção para continuar.
            </Text>
            <View className="mt-4 gap-2">
              {activeSelect?.options.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    activeSelect.onSelect(option.value);
                    setActiveSelect(null);
                  }}
                  className="rounded-2xl border border-divider px-4 py-3"
                >
                  <View className="flex-row items-center gap-3">
                    {option.image ? (
                      <Image
                        source={{ uri: getImageUri(option.image) ?? "" }}
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
                    <View className="flex-1">
                      <Text className="text-base text-text-primary">
                        {option.label}
                      </Text>
                      {option.subtitle ? (
                        <Text className="text-xs text-text-tertiary">
                          {option.subtitle}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
