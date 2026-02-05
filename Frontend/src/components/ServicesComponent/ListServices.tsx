import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { ServicesService, type Service } from "../../services/Services.services";

type ServiceDone = {
  id: string;
  cliente: string;
  equipamento: string;
  descricao: string;
  data: string;
  valor: number;
  status: "concluido" | "em_execucao" | "agendado";
};

const mockServicesDone: ServiceDone[] = [
  {
    id: "SRV-2401",
    cliente: "Ana Beatriz",
    equipamento: "Notebook Dell Inspiron",
    descricao: "Troca de SSD + reinstalação",
    data: "02 Fev 2026",
    valor: 680,
    status: "concluido",
  },
  {
    id: "SRV-2402",
    cliente: "Lucas Menezes",
    equipamento: "iPhone 12",
    descricao: "Troca de bateria e vedação",
    data: "03 Fev 2026",
    valor: 420,
    status: "em_execucao",
  },
  {
    id: "SRV-2403",
    cliente: "Oficina NovaEra",
    equipamento: "Impressora HP 402",
    descricao: "Manutenção preventiva completa",
    data: "04 Fev 2026",
    valor: 310,
    status: "agendado",
  },
];

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);

  const loadServices = useCallback(async (silent?: boolean) => {
    if (!silent) setLoading(true);
    setError(null);
    const result = await ServicesService.getServices();
    if (result?.success) {
      setServices(result.services ?? []);
    } else {
      setServices([]);
      setError(result?.message ?? "Falha ao carregar serviços.");
    }
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

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

        <Text className="text-sm uppercase tracking-widest text-text-secondary">
          Serviços & atendimentos
        </Text>
        <Text className="mt-2 text-3xl font-semibold text-text-primary">
          Serviços cadastrados
        </Text>
        <Text className="mt-2 text-sm text-text-secondary">
          Separe o catálogo de serviços do histórico de atendimentos realizados.
        </Text>

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
              {mockServicesDone.length}
            </Text>
            <Text className="mt-1 text-[11px] text-text-tertiary">
              últimos 30 dias
            </Text>
          </View>
        </View>

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
      </View>

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
                  </View>
                );
              }}
            />
          )}
        </View>

        <View className="mt-10">
          <View className="flex-row items-center justify-between">
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
              className="flex-row items-center gap-2 rounded-full border border-divider bg-card-background px-4 py-2"
            >
              <Ionicons name="add" size={16} color="#0E7490" />
              <Text className="text-sm font-semibold text-text-primary">
                Novo serviço
              </Text>
            </Pressable>
          </View>

          <View className="mt-4 gap-4">
            {mockServicesDone.map((service) => {
              const statusColor =
                service.status === "concluido"
                  ? "bg-emerald-100 text-emerald-600"
                  : service.status === "em_execucao"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-blue-100 text-blue-600";
              const statusLabel =
                service.status === "concluido"
                  ? "Concluído"
                  : service.status === "em_execucao"
                    ? "Em execução"
                    : "Agendado";

              return (
                <View
                  key={service.id}
                  className="rounded-[26px] border border-divider bg-card-background p-5 shadow-lg"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="text-xs text-text-tertiary">
                        {service.id} • {service.data}
                      </Text>
                      <Text className="mt-2 text-base font-semibold text-text-primary">
                        {service.descricao}
                      </Text>
                      <Text className="mt-1 text-xs text-text-secondary">
                        {service.cliente} • {service.equipamento}
                      </Text>
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
                        {formatCurrency(service.valor)}
                      </Text>
                    </View>
                    <Pressable className="flex-row items-center gap-2 rounded-full border border-divider px-4 py-2">
                      <Ionicons name="document-text-outline" size={16} color="#0E7490" />
                      <Text className="text-sm font-semibold text-text-primary">
                        Ver detalhes
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isServiceFormOpen}
        animationType="slide"
        onRequestClose={() => setIsServiceFormOpen(false)}
      >
        <View className="flex-1 bg-background-primary">
          <ServicesRealizedForm onBack={() => setIsServiceFormOpen(false)} />
        </View>
      </Modal>
    </View>
  );
}
