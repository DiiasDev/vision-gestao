import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FormComponent from "../FormComponent/FormComponent";
import { fieldsClient } from "../../Fields/ClientForm";
import {
  ClienteService,
  type Client,
  type ClientPayload,
} from "../../services/Clients.services";

type ListClientsProps = {
  clients: Client[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  refreshing?: boolean;
  onNewClient?: () => void;
};

const avatarPalette = [
  { bg: "#DBEAFE", text: "#1D4ED8" },
  { bg: "#DCFCE7", text: "#15803D" },
  { bg: "#FCE7F3", text: "#BE185D" },
  { bg: "#FEF3C7", text: "#B45309" },
  { bg: "#EDE9FE", text: "#6D28D9" },
];

const getInitials = (name?: string | null) => {
  if (!name) return "CL";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getTypeLabel = (tipo?: string | null) => {
  if (!tipo) return "Sem tipo";
  return tipo === "pj" ? "Pessoa Jurídica" : "Pessoa Física";
};

const isActive = (status: unknown) => status !== false && status !== 0;

export default function ListClients({
  clients,
  loading,
  error,
  onRefresh,
  refreshing,
  onNewClient,
}: ListClientsProps) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "compact">("cards");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "pf" | "pj">("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [actionAlert, setActionAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!loading && viewMode === "compact" && clients.length === 0) {
      setViewMode("cards");
    }
  }, [clients.length, loading, viewMode]);

  useEffect(() => {
    if (!actionAlert) return;
    const timer = setTimeout(() => setActionAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [actionAlert]);

  const safeClients = Array.isArray(clients) ? clients : [];
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return safeClients.filter((client) => {
      const statusOk =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? isActive(client.status)
            : !isActive(client.status);
      const typeOk =
        typeFilter === "all" ? true : client.tipo_de_cliente === typeFilter;
      if (!statusOk || !typeOk) return false;
      if (!term) return true;
      const target = [
        client.nome_completo,
        client.email,
        client.cpf_cnpj,
        client.telefone,
        client.cidade,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return target.includes(term);
    });
  }, [safeClients, search, statusFilter, typeFilter]);

  const totalClients = safeClients.length;
  const activeClients = safeClients.filter((client) => isActive(client.status))
    .length;
  const pfClients = safeClients.filter(
    (client) => client.tipo_de_cliente === "pf"
  ).length;
  const pjClients = safeClients.filter(
    (client) => client.tipo_de_cliente === "pj"
  ).length;

  const listHeader = (
    <View className="pb-6">
      <View className="relative overflow-hidden rounded-[28px] border border-divider bg-card-background p-5 shadow-lg">
        <View className="absolute -right-10 -top-12 h-28 w-28 rounded-full" style={{ backgroundColor: "rgba(59, 130, 246, 0.18)" }} />
        <View className="absolute -left-8 top-16 h-24 w-24 rounded-full" style={{ backgroundColor: "rgba(16, 185, 129, 0.16)" }} />

        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-sm uppercase tracking-widest text-text-tertiary">
              Carteira
            </Text>
            <Text className="mt-2 text-2xl font-semibold text-text-primary">
              Relacionamento com clientes
            </Text>
            <Text className="mt-2 text-sm text-text-secondary">
              Acompanhe contatos, status e perfil de cada cliente.
            </Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-background-secondary">
            <Ionicons name="people-outline" size={22} color="#2563EB" />
          </View>
        </View>

        <View className="mt-5 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-background-secondary px-4 py-3">
            <Text className="text-xs text-text-secondary">Clientes ativos</Text>
            <Text className="mt-1 text-lg font-semibold text-text-primary">
              {activeClients}
            </Text>
            <Text className="mt-1 text-[11px] text-text-tertiary">
              de {totalClients} cadastrados
            </Text>
          </View>
          <View className="flex-1 rounded-2xl bg-background-secondary px-4 py-3">
            <Text className="text-xs text-text-secondary">Tipos</Text>
            <Text className="mt-1 text-lg font-semibold text-text-primary">
              {pfClients} PF • {pjClients} PJ
            </Text>
            <Text className="mt-1 text-[11px] text-text-tertiary">
              distribuição atual
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-6 flex-row items-center gap-3">
        <View className="flex-1 flex-row items-center gap-2 rounded-2xl border border-divider bg-card-background px-4 py-3">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Buscar por nome, cidade ou documento"
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

      <View className="mt-4 flex-row flex-wrap gap-2">
        {[
          { key: "all", label: "Todos" },
          { key: "active", label: "Ativos" },
          { key: "inactive", label: "Inativos" },
        ].map((item) => (
          <Pressable
            key={item.key}
            onPress={() =>
              setStatusFilter(item.key as "all" | "active" | "inactive")
            }
            className={`rounded-full border px-3 py-1 ${
              statusFilter === item.key
                ? "border-blue-200 bg-blue-50"
                : "border-divider bg-card-background"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                statusFilter === item.key ? "text-blue-600" : "text-text-secondary"
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
        {[
          { key: "all", label: "Todos os tipos" },
          { key: "pf", label: "Pessoa Física" },
          { key: "pj", label: "Pessoa Jurídica" },
        ].map((item) => (
          <Pressable
            key={item.key}
            onPress={() => setTypeFilter(item.key as "all" | "pf" | "pj")}
            className={`rounded-full border px-3 py-1 ${
              typeFilter === item.key
                ? "border-emerald-200 bg-emerald-50"
                : "border-divider bg-card-background"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                typeFilter === item.key
                  ? "text-emerald-600"
                  : "text-text-secondary"
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? (
        <View className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <Text className="text-sm font-semibold text-rose-700">
            Não foi possível carregar os clientes
          </Text>
          <Text className="mt-1 text-sm text-rose-600">{error}</Text>
        </View>
      ) : null}

      {actionAlert ? (
        <View
          className={`mt-4 rounded-2xl border px-4 py-3 ${
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
    </View>
  );

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
  };

  const handleDeleteClient = (client: Client) => {
    if (!client.id) {
      setActionAlert({
        type: "error",
        message: "Não foi possível identificar o cliente.",
      });
      return;
    }

    Alert.alert(
      "Excluir cliente",
      `Tem certeza que deseja excluir "${client.nome_completo ?? "este cliente"}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const result = await ClienteService.deleteClient(client.id!);
            if (result?.success) {
              setActionAlert({
                type: "success",
                message: "Cliente excluído com sucesso.",
              });
              setSelectedClient(null);
              onRefresh?.();
            } else {
              setActionAlert({
                type: "error",
                message:
                  result?.message ?? "Não foi possível excluir o cliente.",
              });
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <FlatList
        data={filtered}
        keyExtractor={(item, index) =>
          String(
            item.cpf_cnpj ??
              item.email ??
              item.nome_completo ??
              `client-${index}`
          )
        }
        key={viewMode}
        contentContainerStyle={{ padding: 24, paddingTop: 16, paddingBottom: 140 }}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          loading ? (
            <View className="items-center justify-center py-10">
              <ActivityIndicator size="large" color="#2563EB" />
              <Text className="mt-3 text-sm text-text-secondary">
                Carregando clientes...
              </Text>
            </View>
          ) : (
            <View className="rounded-3xl border border-divider bg-card-background p-6">
              <Text className="text-base font-semibold text-text-primary">
                Nenhum cliente encontrado
              </Text>
              <Text className="mt-2 text-sm text-text-secondary">
                Ajuste os filtros ou cadastre um novo cliente.
              </Text>
              {onNewClient ? (
                <Pressable
                  onPress={onNewClient}
                  className="mt-4 rounded-xl bg-button-primary px-4 py-3"
                >
                  <Text className="text-center text-sm font-semibold text-white">
                    Novo cliente
                  </Text>
                </Pressable>
              ) : null}
            </View>
          )
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item, index }) => {
          const palette = avatarPalette[index % avatarPalette.length];
          const status = isActive(item.status);
          const typeLabel = getTypeLabel(item.tipo_de_cliente);
          const badgeColor = status
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-rose-200 bg-rose-50 text-rose-700";
          const handleEdit = () => handleEditClient(item);
          const handleDelete = () => handleDeleteClient(item);

        if (viewMode === "compact") {
          return (
            <Pressable
              onPress={() => setSelectedClient(item)}
              className="mb-3 rounded-2xl border border-divider bg-card-background px-4 py-3"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: palette.bg }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: palette.text }}
                    >
                      {getInitials(item.nome_completo)}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-sm font-semibold text-text-primary">
                      {item.nome_completo ?? "Sem nome"}
                    </Text>
                    <Text className="text-xs text-text-tertiary">
                      {item.cidade ?? "Cidade não informada"}
                    </Text>
                  </View>
                </View>
                <View className={`rounded-full border px-2 py-1 ${badgeColor}`}>
                  <Text
                    className={`text-[10px] font-semibold ${
                      status ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {status ? "Ativo" : "Inativo"}
                  </Text>
                </View>
              </View>
              <View className="mt-3 flex-row items-center justify-end gap-2">
                <Pressable
                  onPress={handleEdit}
                  className="h-9 w-9 items-center justify-center rounded-full border border-divider bg-background-secondary"
                >
                  <Ionicons name="create-outline" size={16} color="#2563EB" />
                </Pressable>
                <Pressable
                  onPress={handleDelete}
                  className="h-9 w-9 items-center justify-center rounded-full border border-divider bg-background-secondary"
                >
                  <Ionicons name="trash-outline" size={16} color="#DC2626" />
                </Pressable>
              </View>
            </Pressable>
          );
        }

        return (
          <Pressable
            onPress={() => setSelectedClient(item)}
            className="mb-4 rounded-3xl border border-divider bg-card-background p-5 shadow-sm"
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-center gap-3">
                <View
                  className="h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: palette.bg }}
                >
                  <Text
                    className="text-base font-semibold"
                    style={{ color: palette.text }}
                  >
                    {getInitials(item.nome_completo)}
                  </Text>
                </View>
                <View>
                  <Text className="text-base font-semibold text-text-primary">
                    {item.nome_completo ?? "Sem nome"}
                  </Text>
                  <Text className="mt-1 text-xs text-text-tertiary">
                    {typeLabel}
                  </Text>
                </View>
              </View>
              <View className={`rounded-full border px-2 py-1 ${badgeColor}`}>
                <Text
                  className={`text-[10px] font-semibold ${
                    status ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {status ? "Ativo" : "Inativo"}
                </Text>
              </View>
            </View>

            <View className="mt-4 gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="card-outline" size={14} color="#9CA3AF" />
                <Text className="text-xs text-text-secondary">
                  {item.cpf_cnpj ?? "Documento não informado"}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="call-outline" size={14} color="#9CA3AF" />
                <Text className="text-xs text-text-secondary">
                  {item.telefone ?? "Telefone não informado"}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="mail-outline" size={14} color="#9CA3AF" />
                <Text className="text-xs text-text-secondary">
                  {item.email ?? "E-mail não informado"}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                <Text className="text-xs text-text-secondary">
                  {item.cidade ?? "Cidade não informada"}
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
          </Pressable>
        );
        }}
      />

      <Modal
        visible={!!selectedClient}
        animationType="slide"
        onRequestClose={() => setSelectedClient(null)}
      >
        <View className="flex-1 bg-background-primary px-6 pt-8">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-text-primary">
              Detalhes do cliente
            </Text>
            <Pressable
              onPress={() => setSelectedClient(null)}
              className="rounded-full bg-background-secondary px-3 py-1"
            >
              <Text className="text-sm text-text-secondary">Fechar</Text>
            </Pressable>
          </View>

          {selectedClient ? (
            <View className="mt-6 rounded-3xl border border-divider bg-card-background p-6">
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-background-secondary">
                  <Text className="text-base font-semibold text-text-primary">
                    {getInitials(selectedClient.nome_completo)}
                  </Text>
                </View>
                <View>
                  <Text className="text-lg font-semibold text-text-primary">
                    {selectedClient.nome_completo ?? "Sem nome"}
                  </Text>
                  <Text className="text-sm text-text-secondary">
                    {getTypeLabel(selectedClient.tipo_de_cliente)}
                  </Text>
                </View>
              </View>

              <View className="mt-5 gap-3">
                <View>
                  <Text className="text-xs text-text-tertiary">Documento</Text>
                  <Text className="text-sm text-text-primary">
                    {selectedClient.cpf_cnpj ?? "Não informado"}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-text-tertiary">E-mail</Text>
                  <Text className="text-sm text-text-primary">
                    {selectedClient.email ?? "Não informado"}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-text-tertiary">Telefone</Text>
                  <Text className="text-sm text-text-primary">
                    {selectedClient.telefone ?? "Não informado"}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-text-tertiary">Cidade</Text>
                  <Text className="text-sm text-text-primary">
                    {selectedClient.cidade ?? "Não informado"}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-text-tertiary">Endereço</Text>
                  <Text className="text-sm text-text-primary">
                    {selectedClient.endereco ?? "Não informado"}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-text-tertiary">
                    Observações
                  </Text>
                  <Text className="text-sm text-text-primary">
                    {selectedClient.obs ?? "Sem observações"}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-text-tertiary">Status</Text>
                  <Text className="text-sm text-text-primary">
                    {isActive(selectedClient.status) ? "Ativo" : "Inativo"}
                  </Text>
                </View>
              </View>

              <View className="mt-6 flex-row gap-3">
                <Pressable
                  onPress={() => {
                    setSelectedClient(null);
                    handleEditClient(selectedClient);
                  }}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-divider px-4 py-3"
                >
                  <Ionicons name="create-outline" size={16} color="#2563EB" />
                  <Text className="text-sm font-semibold text-text-primary">
                    Editar
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDeleteClient(selectedClient)}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-divider px-4 py-3"
                >
                  <Ionicons name="trash-outline" size={16} color="#DC2626" />
                  <Text className="text-sm font-semibold text-text-primary">
                    Excluir
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>

      <Modal
        visible={!!editingClient}
        animationType="slide"
        onRequestClose={() => setEditingClient(null)}
      >
        <View className="flex-1 bg-background-primary">
          <FormComponent
            fields={fieldsClient}
            title="Editar cliente"
            subtitle="Atualize as informações do cliente."
            submitButtonText="Salvar alterações"
            initialData={
              editingClient
                ? {
                    nome: editingClient.nome_completo ?? "",
                    tipo: editingClient.tipo_de_cliente ?? "",
                    documento: editingClient.cpf_cnpj ?? "",
                    email: editingClient.email ?? "",
                    telefone: editingClient.telefone ?? "",
                    cidade: editingClient.cidade ?? "",
                    endereco: editingClient.endereco ?? "",
                    observacoes: editingClient.obs ?? "",
                    ativo: isActive(editingClient.status) ? 1 : 0,
                  }
                : null
            }
            onBack={() => setEditingClient(null)}
            backButtonText="Cancelar"
            onSubmit={async (data) => {
              if (!editingClient?.id) {
                setActionAlert({
                  type: "error",
                  message: "Não foi possível identificar o cliente.",
                });
                return;
              }

              const payload: ClientPayload = {
                nome: data.nome,
                tipo: data.tipo,
                documento: data.documento,
                email: data.email,
                telefone: data.telefone,
                cidade: data.cidade,
                endereco: data.endereco,
                observacoes: data.observacoes,
                ativo: data.ativo,
              };

              const result = await ClienteService.updateClient(
                editingClient.id,
                payload
              );

              if (result?.success) {
                setActionAlert({
                  type: "success",
                  message: "Cliente atualizado com sucesso.",
                });
                setEditingClient(null);
                onRefresh?.();
              } else {
                setActionAlert({
                  type: "error",
                  message:
                    result?.message ??
                    "Não foi possível atualizar o cliente.",
                });
              }
            }}
          />
        </View>
      </Modal>
    </>
  );
}
