import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ServicesRealizedForm from "./ServicesRealizedForm";
import FormComponent from "../FormComponent/FormComponent";
import { fieldsServices } from "../../Fields/ServicesForm";
import ListOrder from "../OrderComponents/ListOrder";
import {
  ServicesService,
  type Service,
  type ServiceRealized,
} from "../../services/Services.services";
import { ClienteService, type Client } from "../../services/Clients.services";
import {
  formatCPFOrCNPJ,
  formatCurrencyBR,
  formatDateBR,
  formatIdShort,
  formatPhoneBR,
} from "../../utils/formatter";
import { ProductsService, type Product } from "../../services/Products.services";

const statusLabelMap: Record<string, string> = {
  concluido: "Concluído",
  em_execucao: "Em execução",
  agendado: "Agendado",
};

const parseNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const raw = String(value).trim();
  if (!raw) return null;
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatCurrency = formatCurrencyBR;
const formatId = formatIdShort;
const formatDate = formatDateBR;

const getInitials = (name?: string | null) => {
  if (!name) return "SV";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
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

export default function ListServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [servicesRealized, setServicesRealized] = useState<ServiceRealized[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [realizedSearch, setRealizedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "todos" | "concluido" | "em_execucao" | "agendado"
  >("todos");
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [selectedRealized, setSelectedRealized] = useState<ServiceRealized | null>(null);
  const [editingRealized, setEditingRealized] = useState<ServiceRealized | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [actionAlert, setActionAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<"servicos" | "orcamentos">(
    "servicos"
  );

  const loadServices = useCallback(async (silent?: boolean) => {
    if (!silent) setLoading(true);
    setError(null);
    const [catalogResult, realizedResult, clientsResult, productsResult] = await Promise.all([
      ServicesService.getServices(),
      ServicesService.getServicesRealized(),
      ClienteService.getClients(),
      ProductsService.getProducts(),
    ]);

    if (catalogResult?.success) {
      setServices(catalogResult.services ?? []);
    } else {
      setServices([]);
      setError(catalogResult?.message ?? "Falha ao carregar serviços.");
    }

    if (realizedResult?.success) {
      setServicesRealized(realizedResult.services_realized ?? []);
    } else {
      setServicesRealized([]);
      setError(
        realizedResult?.message ??
          "Falha ao carregar serviços realizados."
      );
    }
    if (clientsResult?.success) {
      setClients(clientsResult.clients ?? []);
    }
    if (productsResult?.success) {
      setProducts(productsResult.products ?? []);
    }
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    if (!actionAlert) return;
    const timer = setTimeout(() => setActionAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [actionAlert]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadServices(true);
    setRefreshing(false);
  };

  const filteredServices = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return services;
    return services.filter((service) => {
      const target = [service.nome_servico, service.categoria]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return target.includes(term);
    });
  }, [services, search]);

  const totalCatalog = services.length;
  const activeCatalog = services.filter((item) => item.status !== false).length;

  const clientsById = useMemo(() => {
    return clients.reduce((acc, client) => {
      if (client.id) acc[client.id] = client;
      return acc;
    }, {} as Record<string, Client>);
  }, [clients]);

  const productsById = useMemo(() => {
    return products.reduce((acc, product) => {
      if (product.id !== undefined && product.id !== null) {
        acc[String(product.id)] = product;
      }
      if (product.sku) acc[product.sku] = product;
      if (product.codigo) acc[product.codigo] = product;
      return acc;
    }, {} as Record<string, Product>);
  }, [products]);

  const filteredRealized = useMemo(() => {
    const term = realizedSearch.trim().toLowerCase();
    return servicesRealized.filter((service) => {
      if (statusFilter !== "todos" && service.status !== statusFilter) {
        return false;
      }

      if (!term) return true;

      const client = service.cliente_id
        ? clientsById[String(service.cliente_id)]
        : undefined;

      const itemsText = (service.items ?? [])
        .map((item) => item.produto_nome)
        .filter(Boolean)
        .join(" ");

      const target = [
        service.id,
        service.cliente_nome,
        client?.cpf_cnpj,
        client?.telefone,
        service.servico_nome,
        service.descricao,
        service.equipamento,
        service.observacoes,
        itemsText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return target.includes(term);
    });
  }, [servicesRealized, realizedSearch, statusFilter, clientsById]);

  return (
    <View className="flex-1 bg-background-primary">
      <View className="relative px-6 pt-10">
        <View className="absolute inset-0" pointerEvents="none">
          <View
            className="absolute -right-16 -top-12 h-40 w-40 rounded-full"
            style={{ backgroundColor: "rgba(14, 116, 144, 0.12)" }}
          />
          <View
            className="absolute -left-20 top-20 h-32 w-32 rounded-full"
            style={{ backgroundColor: "rgba(16, 185, 129, 0.12)" }}
          />
        </View>

        {activeSection === "servicos" ? (
          <>
            <Text className="text-sm uppercase tracking-widest text-text-secondary">
              Serviços & atendimentos
            </Text>
            <Text className="mt-2 text-3xl font-semibold text-text-primary">
              Serviços cadastrados
            </Text>
            <Text className="mt-2 text-sm text-text-secondary">
              Separe o catálogo de serviços do histórico de atendimentos realizados.
            </Text>
          </>
        ) : (
          <>
            <Text className="text-sm uppercase tracking-widest text-text-secondary">
              Orçamentos
            </Text>
            <Text className="mt-2 text-3xl font-semibold text-text-primary">
              Orçamentos registrados
            </Text>
            <Text className="mt-2 text-sm text-text-secondary">
              Acompanhe propostas e transforme em ordem de serviço.
            </Text>
          </>
        )}

        <View className="mt-4 flex-row gap-2">
          {[
            { key: "servicos", label: "Serviços" },
            { key: "orcamentos", label: "Orçamentos" },
          ].map((item) => {
            const isActive = activeSection === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() =>
                  setActiveSection(item.key as typeof activeSection)
                }
                className={`flex-1 rounded-full border px-4 py-2 ${
                  isActive
                    ? "border-transparent bg-button-primary"
                    : "border-divider bg-card-background"
                }`}
              >
                <Text
                  className={`text-center text-xs font-semibold ${
                    isActive ? "text-white" : "text-text-secondary"
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeSection === "servicos" ? (
          <View className="mt-6 flex-row gap-3">
            <View className="flex-1 rounded-2xl border border-divider bg-card-background px-4 py-3">
              <Text className="text-xs text-text-secondary">
                Serviços no catálogo
              </Text>
              <Text className="mt-1 text-lg font-semibold text-text-primary">
                {activeCatalog}
              </Text>
              <Text className="mt-1 text-[11px] text-text-tertiary">
                de {totalCatalog} cadastrados
              </Text>
            </View>
            <View className="flex-1 rounded-2xl border border-divider bg-card-background px-4 py-3">
              <Text className="text-xs text-text-secondary">
                Serviços realizados
              </Text>
              <Text className="mt-1 text-lg font-semibold text-text-primary">
                {servicesRealized.length}
              </Text>
              <Text className="mt-1 text-[11px] text-text-tertiary">
                últimos 30 dias
              </Text>
            </View>
          </View>
        ) : null}

        {activeSection === "servicos" ? (
          <View className="mt-5 flex-row items-center gap-3">
            <View className="flex-1 flex-row items-center gap-2 rounded-2xl border border-divider bg-card-background px-4 py-3">
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                placeholder="Buscar serviço por nome ou categoria"
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
              onPress={() => setIsServiceFormOpen(true)}
              className="h-12 w-12 items-center justify-center rounded-2xl bg-button-primary"
            >
              <Ionicons name="add" size={20} color="#fff" />
            </Pressable>
          </View>
        ) : null}
      </View>

      {activeSection === "orcamentos" ? (
        <View className="flex-1">
          <ListOrder />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
        <View className="mt-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-text-primary">
              Catálogo de serviços
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-emerald-500" />
              <Text className="text-xs text-text-tertiary">
                Produtos cadastrados
              </Text>
            </View>
          </View>

          {error ? (
            <View className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
              <Text className="text-sm font-semibold text-rose-700">
                Não foi possível carregar os serviços
              </Text>
              <Text className="mt-1 text-sm text-rose-600">{error}</Text>
            </View>
          ) : null}

          {actionAlert ? (
            <View
              className={`mt-3 rounded-2xl border px-4 py-3 ${
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

          {loading ? (
            <View className="mt-6 items-center justify-center">
              <ActivityIndicator color="#0E7490" />
              <Text className="mt-2 text-sm text-text-secondary">
                Carregando catálogo...
              </Text>
            </View>
          ) : filteredServices.length === 0 ? (
            <View className="mt-4 rounded-[26px] border border-divider bg-card-background p-6">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-background-secondary">
                <Ionicons name="construct-outline" size={22} color="#9CA3AF" />
              </View>
              <Text className="mt-4 text-lg font-semibold text-text-primary">
                Nenhum serviço cadastrado
              </Text>
              <Text className="mt-2 text-sm text-text-secondary">
                Cadastre novos serviços no módulo de serviços para aparecer aqui.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredServices}
              keyExtractor={(item, index) =>
                `${item.nome_servico ?? "service"}-${index}`
              }
              scrollEnabled={false}
              renderItem={({ item }) => {
                const imageUri = getImageUri(item.imagem);
                const price = parseNumber(item.preco);
                const statusLabel = item.status === false ? "Inativo" : "Ativo";
                const handleEdit = () => setEditingService(item);
                const handleDelete = () => {
                  if (!item.id) {
                    setActionAlert({
                      type: "error",
                      message: "Não foi possível identificar o serviço.",
                    });
                    return;
                  }

                  Alert.alert(
                    "Excluir serviço",
                    `Tem certeza que deseja excluir "${item.nome_servico ?? "este serviço"}"?`,
                    [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Excluir",
                        style: "destructive",
                        onPress: async () => {
                          const result = await ServicesService.deleteService(
                            String(item.id)
                          );
                          if (result?.success) {
                            setActionAlert({
                              type: "success",
                              message: "Serviço excluído com sucesso.",
                            });
                            loadServices(true);
                          } else {
                            setActionAlert({
                              type: "error",
                              message:
                                result?.message ??
                                "Não foi possível excluir o serviço.",
                            });
                          }
                        },
                      },
                    ]
                  );
                };
                return (
                  <View className="mt-4 rounded-[26px] border border-divider bg-card-background p-5 shadow-lg">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 flex-row items-center gap-3 pr-3">
                        {imageUri ? (
                          <Image
                            source={{ uri: imageUri }}
                            className="h-12 w-12 rounded-2xl border border-divider"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-background-secondary">
                            <Text className="text-sm font-semibold text-text-primary">
                              {getInitials(item.nome_servico)}
                            </Text>
                          </View>
                        )}
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-text-primary">
                            {item.nome_servico ?? "Serviço sem nome"}
                          </Text>
                          <Text className="mt-1 text-xs text-text-tertiary">
                            {item.categoria ?? "Sem categoria"}
                          </Text>
                        </View>
                      </View>
                      <View
                        className={`shrink-0 rounded-full px-3 py-1 ${
                          item.status === false ? "bg-rose-100" : "bg-emerald-100"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            item.status === false ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {statusLabel}
                        </Text>
                      </View>
                    </View>

                    <View className="mt-4 flex-row items-center justify-between">
                      <View>
                        <Text className="text-xs text-text-secondary">
                          Valor sugerido
                        </Text>
                        <Text className="mt-1 text-lg font-semibold text-text-primary">
                          {formatCurrency(price ?? 0)}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-xs text-text-secondary">
                          Tipo
                        </Text>
                        <Text className="mt-1 text-sm font-semibold text-text-primary">
                          Serviço cadastrado
                        </Text>
                      </View>
                    </View>

                    <View className="mt-4 flex-row gap-3">
                      <Pressable
                        onPress={handleEdit}
                        className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-divider px-4 py-3"
                      >
                        <Ionicons name="create-outline" size={16} color="#2563EB" />
                        <Text className="text-sm font-semibold text-text-primary">
                          Editar
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={handleDelete}
                        className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-divider px-4 py-3"
                      >
                        <Ionicons name="trash-outline" size={16} color="#DC2626" />
                        <Text className="text-sm font-semibold text-text-primary">
                          Excluir
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>

        <View className="mt-10">
          <View className="gap-3">
            <View>
              <Text className="text-lg font-semibold text-text-primary">
                Serviços realizados
              </Text>
              <Text className="mt-1 text-xs text-text-tertiary">
                Histórico de atendimentos e ordens concluídas.
              </Text>
            </View>
            <Pressable
              onPress={() => setIsServiceFormOpen(true)}
              className="flex-row items-center justify-center gap-2 rounded-full border border-divider bg-card-background px-4 py-2"
            >
              <Ionicons name="add" size={16} color="#0E7490" />
              <Text className="text-sm font-semibold text-text-primary">
                Novo serviço
              </Text>
            </Pressable>
          </View>

          <View className="mt-4 gap-3">
            <View className="flex-row items-center gap-3">
              <View className="flex-1 flex-row items-center gap-2 rounded-2xl border border-divider bg-card-background px-4 py-3">
                <Ionicons name="search" size={16} color="#9CA3AF" />
                <TextInput
                  placeholder="Buscar por ID, cliente, CPF, produto..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-sm text-text-primary"
                  value={realizedSearch}
                  onChangeText={setRealizedSearch}
                />
                {realizedSearch ? (
                  <Pressable onPress={() => setRealizedSearch("")} hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                  </Pressable>
                ) : null}
              </View>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {[
                { key: "todos", label: "Todos" },
                { key: "concluido", label: "Concluídos" },
                { key: "em_execucao", label: "Em execução" },
                { key: "agendado", label: "Agendados" },
              ].map((item) => {
                const isActive = statusFilter === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() =>
                      setStatusFilter(item.key as typeof statusFilter)
                    }
                    className={`rounded-full border px-4 py-2 ${
                      isActive
                        ? "border-transparent bg-button-primary"
                        : "border-divider bg-card-background"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isActive ? "text-white" : "text-text-secondary"
                      }`}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="mt-4 gap-4">
            {filteredRealized.map((service) => {
              const statusColor =
                service.status === "concluido"
                  ? "bg-emerald-100 text-emerald-600"
                  : service.status === "em_execucao"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-blue-100 text-blue-600";
              const statusLabel =
                statusLabelMap[service.status ?? ""] ?? "Agendado";
              const client = service.cliente_id
                ? clientsById[String(service.cliente_id)]
                : undefined;

              return (
                <View
                  key={service.id}
                  className="rounded-[26px] border border-divider bg-card-background p-5 shadow-lg"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="text-xs text-text-tertiary">
                        {formatId(service.id)} • {formatDate(service.data_servico ?? service.criado_em)}
                      </Text>
                      <Text className="mt-2 text-base font-semibold text-text-primary">
                        {service.descricao ?? service.servico_nome}
                      </Text>
                      <Text className="mt-1 text-xs text-text-secondary">
                        {service.cliente_nome} • {service.equipamento ?? "Sem equipamento"}
                      </Text>
                      {client?.cpf_cnpj ? (
                        <Text className="mt-1 text-xs text-text-tertiary">
                          CPF/CNPJ: {formatCPFOrCNPJ(client.cpf_cnpj)}
                        </Text>
                      ) : null}
                      {client?.telefone ? (
                        <Text className="mt-1 text-xs text-text-tertiary">
                          Telefone: {formatPhoneBR(client.telefone)}
                        </Text>
                      ) : null}
                    </View>
                    <View className={`rounded-full px-3 py-1 ${statusColor}`}>
                      <Text className="text-xs font-semibold">{statusLabel}</Text>
                    </View>
                  </View>

                  <View className="mt-4 flex-row items-center justify-between">
                    <View>
                      <Text className="text-xs text-text-secondary">
                        Valor total
                      </Text>
                      <Text className="mt-1 text-lg font-semibold text-text-primary">
                        {formatCurrency(
                          typeof service.valor_total === "number"
                            ? service.valor_total
                            : Number(service.valor_total ?? 0)
                        )}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setSelectedRealized(service)}
                      className="flex-row items-center gap-2 rounded-full border border-divider px-4 py-2"
                    >
                      <Ionicons name="document-text-outline" size={16} color="#0E7490" />
                      <Text className="text-sm font-semibold text-text-primary">
                        Ver detalhes
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
            {!loading && filteredRealized.length === 0 ? (
              <View className="rounded-[26px] border border-divider bg-card-background p-6">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-background-secondary">
                  <Ionicons name="documents-outline" size={22} color="#9CA3AF" />
                </View>
                <Text className="mt-4 text-lg font-semibold text-text-primary">
                  Nenhum serviço encontrado
                </Text>
                <Text className="mt-2 text-sm text-text-secondary">
                  Ajuste os filtros ou registre um novo serviço realizado.
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        </ScrollView>
      )}

      <Modal
        visible={isServiceFormOpen}
        animationType="slide"
        onRequestClose={() => setIsServiceFormOpen(false)}
      >
        <View className="flex-1 bg-background-primary">
          <ServicesRealizedForm onBack={() => setIsServiceFormOpen(false)} />
        </View>
      </Modal>

      <Modal
        visible={!!editingRealized}
        animationType="slide"
        onRequestClose={() => setEditingRealized(null)}
      >
        <View className="flex-1 bg-background-primary">
          <ServicesRealizedForm
            initialData={editingRealized}
            onBack={() => setEditingRealized(null)}
            onSaved={() => {
              setEditingRealized(null);
              loadServices(true);
            }}
          />
        </View>
      </Modal>

      <Modal
        visible={!!editingService}
        animationType="slide"
        onRequestClose={() => setEditingService(null)}
      >
        <View className="flex-1 bg-background-primary">
          <FormComponent
            fields={fieldsServices}
            title="Editar serviço"
            subtitle="Atualize os dados do serviço."
            submitButtonText="Salvar alterações"
            initialData={
              editingService
                ? {
                    nome: editingService.nome_servico ?? "",
                    categoria: editingService.categoria ?? "",
                    preco: editingService.preco ?? "",
                    prazo: editingService.prazo ?? "",
                    descricao: editingService.descricao ?? "",
                    imagem: editingService.imagem ?? null,
                    ativo: editingService.status === false ? 0 : 1,
                  }
                : null
            }
            onBack={() => setEditingService(null)}
            backButtonText="Cancelar"
            onSubmit={async (data) => {
              if (!editingService?.id) {
                setActionAlert({
                  type: "error",
                  message: "Não foi possível identificar o serviço.",
                });
                return;
              }

              const payload = {
                nome: data.nome,
                categoria: data.categoria,
                preco: data.preco,
                prazo: data.prazo,
                descricao: data.descricao,
                imagem: data.imagem,
                ativo: data.ativo,
              };

              const result = await ServicesService.updateService(
                String(editingService.id),
                payload
              );

              if (result?.success) {
                setActionAlert({
                  type: "success",
                  message: "Serviço atualizado com sucesso.",
                });
                setEditingService(null);
                loadServices(true);
              } else {
                setActionAlert({
                  type: "error",
                  message:
                    result?.message ??
                    "Não foi possível atualizar o serviço.",
                });
              }
            }}
          />
        </View>
      </Modal>

      <Modal
        visible={!!selectedRealized}
        animationType="slide"
        onRequestClose={() => setSelectedRealized(null)}
      >
        <View className="flex-1 bg-background-primary">
          <View className="flex-row items-center justify-between px-6 pt-10">
            <Text className="text-lg font-semibold text-text-primary">
              Detalhes do serviço
            </Text>
            <Pressable
              onPress={() => setSelectedRealized(null)}
              className="rounded-full border border-divider px-3 py-1"
            >
              <Text className="text-sm text-text-secondary">Fechar</Text>
            </Pressable>
          </View>

          {selectedRealized ? (
            <ScrollView
              contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
            >
              <View className="mb-4 flex-row gap-3">
                <Pressable
                  onPress={() => {
                    setEditingRealized(selectedRealized);
                    setSelectedRealized(null);
                  }}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-divider px-4 py-3"
                >
                  <Ionicons name="create-outline" size={16} color="#2563EB" />
                  <Text className="text-sm font-semibold text-text-primary">
                    Editar
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    Alert.alert(
                      "Excluir serviço realizado",
                      "Tem certeza que deseja excluir este registro?",
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Excluir",
                          style: "destructive",
                          onPress: async () => {
                            const result =
                              await ServicesService.deleteServiceRealized(
                                selectedRealized.id
                              );
                            if (result?.success) {
                              setActionAlert({
                                type: "success",
                                message: "Serviço realizado excluído com sucesso.",
                              });
                              setSelectedRealized(null);
                              loadServices(true);
                            } else {
                              setActionAlert({
                                type: "error",
                                message:
                                  result?.message ??
                                  "Não foi possível excluir o serviço realizado.",
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
                  {formatId(selectedRealized.id)} •{" "}
                  {formatDate(selectedRealized.data_servico ?? selectedRealized.criado_em)}
                </Text>
                <Text className="mt-2 text-xl font-semibold text-text-primary">
                  {selectedRealized.descricao ?? selectedRealized.servico_nome}
                </Text>
                <Text className="mt-1 text-sm text-text-secondary">
                  {selectedRealized.cliente_nome}
                </Text>
                {selectedRealized.equipamento ? (
                  <Text className="mt-1 text-sm text-text-secondary">
                    Equipamento: {selectedRealized.equipamento}
                  </Text>
                ) : null}
                {selectedRealized.observacoes ? (
                  <Text className="mt-2 text-sm text-text-secondary">
                    {selectedRealized.observacoes}
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
                      {formatCurrency(
                        typeof selectedRealized.valor_servico === "number"
                          ? selectedRealized.valor_servico
                          : Number(selectedRealized.valor_servico ?? 0)
                      )}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-text-secondary">
                      Produtos
                    </Text>
                    <Text className="text-sm font-semibold text-text-primary">
                      {formatCurrency(
                        typeof selectedRealized.valor_produtos === "number"
                          ? selectedRealized.valor_produtos
                          : Number(selectedRealized.valor_produtos ?? 0)
                      )}
                    </Text>
                  </View>
                  <View className="mt-2 border-t border-divider/40 pt-2" />
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-text-secondary">
                      Custo do serviço
                    </Text>
                    <Text className="text-sm font-semibold text-text-primary">
                      {formatCurrency(
                        typeof (selectedRealized as any).custo_servico === "number"
                          ? (selectedRealized as any).custo_servico
                          : Number((selectedRealized as any).custo_servico ?? 0)
                      )}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-text-secondary">
                      Custo de produtos
                    </Text>
                    <Text className="text-sm font-semibold text-text-primary">
                      {formatCurrency(
                        typeof (selectedRealized as any).custo_produtos === "number"
                          ? (selectedRealized as any).custo_produtos
                          : Number((selectedRealized as any).custo_produtos ?? 0)
                      )}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-text-secondary">
                      Custo total
                    </Text>
                    <Text className="text-sm font-semibold text-text-primary">
                      {formatCurrency(
                        typeof (selectedRealized as any).custo_total === "number"
                          ? (selectedRealized as any).custo_total
                          : Number((selectedRealized as any).custo_total ?? 0)
                      )}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-text-secondary">Total</Text>
                    <Text className="text-base font-semibold text-text-primary">
                      {formatCurrency(
                        typeof selectedRealized.valor_total === "number"
                          ? selectedRealized.valor_total
                          : Number(selectedRealized.valor_total ?? 0)
                      )}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-4 rounded-[26px] border border-divider bg-card-background p-5">
                <Text className="text-base font-semibold text-text-primary">
                  Produtos utilizados
                </Text>
                <View className="mt-3 gap-2">
                  {(selectedRealized.items ?? []).length ? (
                    selectedRealized.items?.map((item) => {
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
                            {formatCurrency(
                              typeof item.total_item === "number"
                                ? item.total_item
                                : Number(item.total_item ?? 0)
                            )}
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
