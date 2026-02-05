import { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
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
import { OrderService } from "../../services/Order.services";
import { ServicesService, type Service } from "../../services/Services.services";
import { formatCurrencyBR } from "../../utils/formatter";

type OrderFormProps = {
  onBack?: () => void;
};

type SelectOption = {
  value: string;
  label: string;
  subtitle?: string;
  image?: string;
};

type SelectState = {
  title: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
};

type OrderItem = {
  key: string;
  productId?: string;
  quantity: string;
  price: string;
};

const toNumber = (value?: string | number | null) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = formatCurrencyBR;

const getImageUri = (imagem?: string | null) => {
  if (!imagem) return undefined;
  const trimmed = String(imagem).trim();
  if (!trimmed) return undefined;
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
  return looksLikeBase64 ? `data:image/jpeg;base64,${trimmed}` : undefined;
};

const createOrderItem = (): OrderItem => ({
  key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  productId: undefined,
  quantity: "1",
  price: "",
});

const resolveSelectLabel = (
  value: string | undefined,
  options: SelectOption[],
  placeholder: string
) => {
  if (!value) return placeholder;
  const match = options.find((option) => option.value === value);
  return match?.label ?? placeholder;
};

export default function OrderForm({ onBack }: OrderFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
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
  const [contact, setContact] = useState<string>("");
  const [equipment, setEquipment] = useState<string>("");
  const [problem, setProblem] = useState<string>("");
  const [validity, setValidity] = useState<Date | null>(null);
  const [status, setStatus] = useState<string>("em_analise");
  const [notes, setNotes] = useState<string>("");
  const [items, setItems] = useState<OrderItem[]>([createOrderItem()]);
  const [selectedServiceKey, setSelectedServiceKey] = useState<string | undefined>(
    undefined
  );
  const [manualService, setManualService] = useState<string>("");
  const [manualEstimate, setManualEstimate] = useState<string>("");
  const [isEstimateLocked, setIsEstimateLocked] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoadingData(true);
      const [clientsResult, productsResult, servicesResult] = await Promise.all([
        ClienteService.getClients(),
        ProductsService.getProducts(),
        ServicesService.getServices(),
      ]);
      if (!mounted) return;
      setClients(clientsResult?.clients ?? []);
      setProducts(productsResult?.products ?? []);
      setServices(servicesResult?.services ?? []);
      setLoadingData(false);
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 5000);
    return () => clearTimeout(timer);
  }, [alert]);

  const clientsByKey = useMemo(() => {
    return new Map(
      clients.map((client) => [client.id ?? client.nome_completo, client])
    );
  }, [clients]);

  const productsById = useMemo(() => {
    return new Map(products.map((product) => [product.id ?? product.nome, product]));
  }, [products]);

  const serviceOptions = useMemo(() => {
    return services.map((service) => ({
      value: String(service.id ?? service.nome_servico),
      label: service.nome_servico,
      image: getImageUri(service.imagem),
      subtitle:
        service.preco !== undefined
          ? formatCurrency(toNumber(service.preco))
          : undefined,
    }));
  }, [services]);

  const productOptions = useMemo(() => {
    const filteredProducts = products.filter((product) => {
      const category = String(product.categoria ?? "").toLowerCase();
      return !category.includes("serv");
    });

    return filteredProducts.map((product) => ({
      value: product.id ?? product.nome,
      label: product.nome,
      image: getImageUri(product.imagem),
      subtitle:
        product.preco_venda !== undefined
          ? formatCurrency(toNumber(product.preco_venda))
          : undefined,
    }));
  }, [products]);

  const clientOptions = useMemo(() => {
    return clients.map((client) => ({
      value: client.id ?? client.nome_completo,
      label: client.nome_completo,
      subtitle: client.telefone || client.email || undefined,
    }));
  }, [clients]);

  const selectedClient = selectedClientKey
    ? clientsByKey.get(selectedClientKey)
    : undefined;

  const selectedService = selectedServiceKey
    ? services.find((service) => String(service.id ?? service.nome_servico) === selectedServiceKey)
    : undefined;

  const servicePrice = selectedService ? toNumber(selectedService.preco) : 0;

  const itemsTotal = items.reduce((acc, item) => {
    const quantity = toNumber(item.quantity);
    const price = toNumber(item.price);
    return acc + quantity * price;
  }, 0);

  const estimatedTotal = itemsTotal + servicePrice;

  useEffect(() => {
    if (!isEstimateLocked) return;
    setManualEstimate(estimatedTotal ? estimatedTotal.toFixed(2) : "");
  }, [estimatedTotal, isEstimateLocked]);

  const updateItem = (key: string, patch: Partial<OrderItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item))
    );
  };

  const handleSelectClient = (value: string) => {
    setSelectedClientKey(value);
    const client = clientsByKey.get(value);
    if (client) {
      setContact(client.telefone || client.email || "");
    }
  };

  const handleSelectProduct = (itemKey: string, value: string) => {
    const product = productsById.get(value);
    updateItem(itemKey, {
      productId: value,
      price:
        product?.preco_venda !== undefined
          ? String(product.preco_venda)
          : "",
      quantity: product ? "1" : "",
    });
  };

  const openSelect = (title: string, options: SelectOption[], onSelect: (value: string) => void) => {
    setActiveSelect({ title, options, onSelect });
  };

  const hasServiceSelection = !!selectedServiceKey;
  const showManualServiceField = !hasServiceSelection;
  const hasServiceOptions = serviceOptions.length > 0;

  const handleSubmit = async () => {
    if (!selectedClientKey) {
      setAlert({
        type: "error",
        title: "Cliente obrigatório",
        message: "Selecione um cliente para continuar.",
      });
      return;
    }

    const hasInvalidItems =
      items.length > 0 && items.some((item) => !item.productId);

    if (hasInvalidItems) {
      setAlert({
        type: "error",
        title: "Produtos incompletos",
        message: "Selecione o produto em todos os itens adicionados.",
      });
      return;
    }

    if (!hasServiceSelection && !manualService.trim() && items.length === 0) {
      setAlert({
        type: "error",
        title: "Informe o serviço",
        message: "Selecione um serviço, descreva manualmente ou adicione produtos.",
      });
      return;
    }

    setSaving(true);
    try {
      const parsedEstimate = toNumber(manualEstimate);
      const estimatedValue =
        manualEstimate.trim() !== "" ? parsedEstimate : estimatedTotal;

      const result = await OrderService.createOrder({
        client_id: selectedClient?.id ?? selectedClientKey ?? null,
        client_name: selectedClient?.nome_completo ?? null,
        client_contact: contact || null,
        equipment: equipment || null,
        problem: problem || null,
        service_id: selectedService?.id ?? null,
        service_description: hasServiceSelection ? null : manualService || null,
        service_value: servicePrice,
        items: items.map((item) => ({
          product_id: item.productId ?? null,
          product_name: item.productId
            ? productsById.get(item.productId)?.nome ?? null
            : null,
          quantity: toNumber(item.quantity) || null,
          price: toNumber(item.price) || null,
        })),
        estimated_value:
          Number.isFinite(estimatedValue) && estimatedValue !== 0
            ? estimatedValue
            : estimatedValue === 0
              ? 0
              : null,
        validity: validity
          ? validity.toISOString().split("T")[0]
          : null,
        status: status || null,
        notes: notes || null,
      });

      if (result?.success) {
        setAlert({
          type: "success",
          title: "Orçamento salvo",
          message: "O orçamento foi registrado com sucesso.",
        });
      } else {
        setAlert({
          type: "error",
          title: "Falha ao salvar",
          message:
            result?.message ??
            "Não foi possível salvar o orçamento. Verifique a conexão.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="rounded-3xl border border-divider bg-card-background p-6">
            <View className="mb-6">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-semibold text-text-primary">
                  Cadastrar orçamento
                </Text>
                {onBack ? (
                  <Pressable
                    onPress={onBack}
                    className="rounded-full border border-divider px-3 py-1"
                  >
                    <Text className="text-sm text-text-secondary">Voltar</Text>
                  </Pressable>
                ) : null}
              </View>
              <Text className="mt-2 text-sm text-text-secondary">
                Registre os dados para gerar uma nova proposta.
              </Text>
            </View>

            <View className="gap-6">
              <View className="gap-4">
                <Text className="text-base font-semibold text-text-primary">
                  Cliente
                </Text>
                <View className="gap-2">
                  <Text className="text-sm text-text-secondary">Cliente *</Text>
                  <Pressable
                    onPress={() =>
                      openSelect("Selecionar cliente", clientOptions, handleSelectClient)
                    }
                    className="rounded-xl border border-divider bg-background-secondary px-4 py-3"
                  >
                    <Text
                      className={`text-base ${
                        selectedClientKey ? "text-text-primary" : "text-text-tertiary"
                      }`}
                    >
                      {resolveSelectLabel(
                        selectedClientKey,
                        clientOptions,
                        "Selecione o cliente"
                      )}
                    </Text>
                  </Pressable>
                  {loadingData ? (
                    <Text className="text-xs text-text-tertiary">
                      Carregando clientes...
                    </Text>
                  ) : null}
                </View>
                <View className="gap-2">
                  <Text className="text-sm text-text-secondary">Contato</Text>
                  <TextInput
                    className="rounded-xl border border-divider bg-background-secondary px-4 py-3 text-text-primary"
                    placeholder="Ex.: (11) 99999-0000"
                    placeholderTextColor="#9CA3AF"
                    value={contact}
                    onChangeText={setContact}
                  />
                </View>
              </View>

              <View className="gap-4">
                <Text className="text-base font-semibold text-text-primary">
                  Equipamento
                </Text>
                <View className="gap-2">
                  <Text className="text-sm text-text-secondary">Equipamento</Text>
                  <TextInput
                    className="rounded-xl border border-divider bg-background-secondary px-4 py-3 text-text-primary"
                    placeholder="Ex.: Notebook Dell Inspiron"
                    placeholderTextColor="#9CA3AF"
                    value={equipment}
                    onChangeText={setEquipment}
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-sm text-text-secondary">
                    Descrição do problema
                  </Text>
                  <TextInput
                    className="rounded-xl border border-divider bg-background-secondary px-4 py-3 text-text-primary"
                    placeholder="Explique o que precisa ser feito."
                    placeholderTextColor="#9CA3AF"
                    value={problem}
                    onChangeText={setProblem}
                    multiline
                    textAlignVertical="top"
                    numberOfLines={4}
                  />
                </View>
              </View>

              <View className="gap-4">
                <Text className="text-base font-semibold text-text-primary">
                  Serviço realizado
                </Text>
                <View className="gap-2">
                  <Text className="text-sm text-text-secondary">Serviço</Text>
                  <Pressable
                    onPress={() =>
                      openSelect(
                        "Selecionar serviço",
                        [
                          { value: "", label: "Não selecionar serviço" },
                          ...serviceOptions,
                        ],
                        (value) => {
                          setSelectedServiceKey(value || undefined);
                        }
                      )
                    }
                    className="rounded-xl border border-divider bg-background-secondary px-4 py-3"
                  >
                    <Text
                      className={`text-base ${
                        selectedServiceKey ? "text-text-primary" : "text-text-tertiary"
                      }`}
                    >
                      {selectedServiceKey
                        ? resolveSelectLabel(
                            selectedServiceKey,
                            serviceOptions,
                            "Selecione o serviço"
                          )
                        : hasServiceOptions
                          ? "Selecione o serviço"
                          : "Nenhum serviço cadastrado"}
                    </Text>
                  </Pressable>
                  {selectedService ? (
                    <Text className="text-xs text-text-tertiary">
                      Valor do serviço: {formatCurrency(servicePrice)}
                    </Text>
                  ) : null}
                </View>
                {showManualServiceField ? (
                  <View className="gap-2">
                    <Text className="text-sm text-text-secondary">
                      Descreva o serviço realizado
                    </Text>
                    <TextInput
                      className="rounded-xl border border-divider bg-background-secondary px-4 py-3 text-text-primary"
                      placeholder="Ex.: Troca de bateria e limpeza interna"
                      placeholderTextColor="#9CA3AF"
                      value={manualService}
                      onChangeText={setManualService}
                      multiline
                      textAlignVertical="top"
                      numberOfLines={3}
                    />
                    {!hasServiceOptions ? (
                      <Text className="text-xs text-text-tertiary">
                        Nenhum serviço foi encontrado no sistema. Preencha manualmente.
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </View>

                <View className="gap-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-text-primary">
                      Produtos
                    </Text>
                    <Pressable
                      onPress={() => setItems((prev) => [...prev, createOrderItem()])}
                      className="flex-row items-center gap-2 rounded-full border border-divider px-3 py-1"
                    >
                      <Ionicons name="add" size={16} color="#6B7280" />
                      <Text className="text-sm text-text-secondary">Adicionar</Text>
                    </Pressable>
                  </View>

                {items.map((item, index) => {
                  const selectedProduct = item.productId
                    ? productsById.get(item.productId)
                    : undefined;
                  return (
                    <View
                      key={item.key}
                      className="gap-3 rounded-2xl border border-divider bg-background-secondary p-4"
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-semibold text-text-primary">
                          Produto {index + 1}
                        </Text>
                        <Pressable
                          onPress={() =>
                            setItems((prev) => prev.filter((p) => p.key !== item.key))
                          }
                          className="h-8 w-8 items-center justify-center rounded-full"
                        >
                          <Ionicons name="trash" size={16} color="#9CA3AF" />
                        </Pressable>
                      </View>
                      <Pressable
                        onPress={() =>
                          openSelect(
                            "Selecionar produto",
                            productOptions,
                            (value) => handleSelectProduct(item.key, value)
                          )
                        }
                        className="rounded-xl border border-divider bg-card-background px-4 py-3"
                      >
                        <Text
                          className={`text-base ${
                            item.productId ? "text-text-primary" : "text-text-tertiary"
                          }`}
                        >
                          {resolveSelectLabel(
                            item.productId,
                            productOptions,
                            "Selecione o produto"
                          )}
                        </Text>
                      </Pressable>
                      {selectedProduct ? (
                        <View className="flex-row items-center gap-3">
                          {getImageUri(selectedProduct.imagem) ? (
                            <Image
                              source={{ uri: getImageUri(selectedProduct.imagem) }}
                              className="h-10 w-10 rounded-lg border border-divider"
                              resizeMode="cover"
                            />
                          ) : null}
                          <Text className="text-xs text-text-tertiary">
                            Estoque: {selectedProduct.estoque ?? "-"} • Valor sugerido:{" "}
                            {formatCurrency(toNumber(selectedProduct.preco_venda))}
                          </Text>
                        </View>
                      ) : null}
                      <View className="flex-row gap-3">
                        <View className="flex-1 gap-2">
                          <Text className="text-xs text-text-secondary">Quantidade</Text>
                          <TextInput
                            className="rounded-xl border border-divider bg-card-background px-4 py-3 text-text-primary"
                            placeholder="1"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={item.quantity}
                            onChangeText={(text) => updateItem(item.key, { quantity: text })}
                          />
                        </View>
                        <View className="flex-1 gap-2">
                          <Text className="text-xs text-text-secondary">Valor</Text>
                          <TextInput
                            className="rounded-xl border border-divider bg-card-background px-4 py-3 text-text-primary"
                            placeholder="0.00"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={item.price}
                            onChangeText={(text) => updateItem(item.key, { price: text })}
                          />
                        </View>
                      </View>
                      <Text className="text-xs text-text-tertiary">
                        Total do item: {formatCurrency(toNumber(item.quantity) * toNumber(item.price))}
                      </Text>
                    </View>
                  );
                })}

                {items.length === 0 ? (
                  <Text className="text-xs text-text-tertiary">
                    Nenhum produto adicionado ao orçamento.
                  </Text>
                ) : null}
                {loadingData ? (
                  <Text className="text-xs text-text-tertiary">
                    Carregando produtos...
                  </Text>
                ) : null}
                {productOptions.length === 0 ? (
                  <Text className="text-xs text-text-tertiary">
                    Nenhum produto cadastrado disponível.
                  </Text>
                ) : null}
              </View>

              <View className="gap-4">
                <Text className="text-base font-semibold text-text-primary">
                  Resumo do orçamento
                </Text>
                <View className="gap-2">
                  <Text className="text-sm text-text-secondary">Valor</Text>
                  <TextInput
                    className="rounded-xl border border-divider bg-background-secondary px-4 py-3 text-text-primary"
                    placeholder="Ex.: 320.00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={manualEstimate}
                    onChangeText={(text) => {
                      setIsEstimateLocked(false);
                      setManualEstimate(text);
                    }}
                  />
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-text-tertiary">
                      Total calculado: {formatCurrency(estimatedTotal)}
                    </Text>
                    <Pressable
                      onPress={() => {
                        setIsEstimateLocked(true);
                        setManualEstimate(estimatedTotal ? estimatedTotal.toFixed(2) : "");
                      }}
                      className="rounded-full border border-divider px-3 py-1"
                    >
                      <Text className="text-xs text-text-secondary">
                        Usar cálculo
                      </Text>
                    </Pressable>
                  </View>
                </View>
                <View className="gap-2">
                  <Text className="text-sm text-text-secondary">Validade</Text>
                  <Pressable
                    onPress={() => setShowDatePicker(true)}
                    className="rounded-xl border border-divider bg-background-secondary px-4 py-3"
                  >
                    <Text className="text-base text-text-primary">
                      {validity
                        ? validity.toLocaleDateString("pt-BR")
                        : "Selecionar data"}
                    </Text>
                  </Pressable>
                </View>
                <View className="gap-2">
                  <Text className="text-sm text-text-secondary">Status</Text>
                  <Pressable
                    onPress={() =>
                      openSelect(
                        "Selecionar status",
                        [
                          { value: "em_analise", label: "Em análise" },
                          { value: "aprovado", label: "Aprovado" },
                          { value: "recusado", label: "Recusado" },
                        ],
                        setStatus
                      )
                    }
                    className="rounded-xl border border-divider bg-background-secondary px-4 py-3"
                  >
                    <Text className="text-base text-text-primary">
                      {resolveSelectLabel(status, [
                        { value: "em_analise", label: "Em análise" },
                        { value: "aprovado", label: "Aprovado" },
                        { value: "recusado", label: "Recusado" },
                      ], "Selecione o status")}
                    </Text>
                  </Pressable>
                </View>
                <View className="gap-2">
                  <Text className="text-sm text-text-secondary">Observações</Text>
                  <TextInput
                    className="rounded-xl border border-divider bg-background-secondary px-4 py-3 text-text-primary"
                    placeholder="Informações extras para o orçamento."
                    placeholderTextColor="#9CA3AF"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    textAlignVertical="top"
                    numberOfLines={3}
                  />
                </View>
              </View>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={saving}
              className="mt-8 items-center rounded-2xl bg-button-primary px-4 py-4"
            >
              <Text className="text-base font-semibold text-white">
                {saving ? "Salvando..." : "Salvar orçamento"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
                  key={`${option.value}-${option.label}`}
                  onPress={() => {
                    activeSelect.onSelect(option.value);
                    setActiveSelect(null);
                  }}
                  className="rounded-2xl border border-divider px-4 py-3"
                >
                  <View className="flex-row items-center gap-3">
                    {option.image ? (
                      <Image
                        source={{ uri: option.image }}
                        className="h-10 w-10 rounded-lg border border-divider"
                        resizeMode="cover"
                      />
                    ) : null}
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
              Selecionar validade
            </Text>
            <View className="mt-4">
              <DateTimePicker
                value={validity ?? new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event, selected) => {
                  const chosen = selected ?? validity ?? new Date();
                  if (Platform.OS === "android") {
                    setShowDatePicker(false);
                  }
                  if (event.type === "set") {
                    setValidity(chosen);
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

      {alert ? (
        <View pointerEvents="box-none" className="absolute left-0 right-0 top-3 px-6">
          <View
            className={`rounded-2xl border px-4 py-3 ${
              alert.type === "success"
                ? "border-emerald-200 bg-emerald-50"
                : "border-rose-200 bg-rose-50"
            }`}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-start gap-3 pr-6">
                <View
                  className={`mt-1 h-7 w-7 items-center justify-center rounded-full ${
                    alert.type === "success" ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                >
                  <Ionicons
                    name={alert.type === "success" ? "checkmark" : "alert"}
                    size={16}
                    color="#fff"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-text-primary">
                    {alert.title}
                  </Text>
                  <Text className="mt-1 text-sm text-text-secondary">
                    {alert.message}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setAlert(null)}
                hitSlop={8}
                className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full"
              >
                <Ionicons name="close" size={16} color="#6B7280" />
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
