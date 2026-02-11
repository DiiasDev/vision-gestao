import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  DateFilter,
  type DateRangeValue,
} from "../Home/Filters/DateFilter";
import FormComponent from "../FormComponent/FormComponent";
import FormEstoque from "./FormEstoque";
import { fieldsProduct } from "../../Fields/ProductsForm";
import MovimentacaoEstoque, {
  type Movimentacao,
} from "../Estoque/MovimentacaoEstoque";
import {
  ProductPayload,
  ProductsService,
  type StockMovement,
  type Product,
} from "../../services/Products.services";

type ListEstoqueProps = {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
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

const toTimestamp = (value?: string | null) => {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const formatMovementDate = (value?: string | null) => {
  if (!value) return "Data n/d";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data n/d";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  } catch {
    return value;
  }
};

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const createInitialDateRange = (): DateRangeValue => {
  const endDate = startOfDay(new Date());
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - 1);
  return {
    preset: "1m",
    startDate,
    endDate,
  };
};

const getAutomaticMovementMessage = (movement: StockMovement) => {
  if (movement.origem === "manual") {
    return movement.tipo === "entrada"
      ? "Entrada via formulário rápido"
      : movement.tipo === "saida"
        ? "Saída via formulário rápido"
        : "Ajuste manual via formulário rápido";
  }

  if (movement.origem === "servico") {
    return movement.tipo === "entrada"
      ? "Ajuste de entrada por edição de serviço realizado"
      : "Saída vinculada ao serviço realizado";
  }

  if (movement.origem === "orcamento") {
    return "Saída na conversão de orçamento";
  }

  return movement.tipo === "entrada"
    ? "Entrada de estoque"
    : movement.tipo === "saida"
      ? "Saída de estoque"
      : "Ajuste de estoque";
};

export default function ListEstoque({
  products,
  loading,
  error,
  onRefresh,
  refreshing,
}: ListEstoqueProps) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "compact">("cards");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockFormType, setStockFormType] = useState<"entrada" | "saida" | null>(
    null,
  );
  const [movementDateRange, setMovementDateRange] = useState<DateRangeValue>(
    createInitialDateRange(),
  );
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementsRefreshing, setMovementsRefreshing] = useState(false);
  const [movementsError, setMovementsError] = useState<string | null>(null);
  const [actionAlert, setActionAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!actionAlert) return;
    const timer = setTimeout(() => setActionAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [actionAlert]);

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

  const unitsByProductId = useMemo(
    () =>
      safeProducts.reduce(
        (acc, product) => {
          if (product.id !== undefined && product.id !== null) {
            acc[String(product.id)] = product.unidade ?? "un";
          }
          return acc;
        },
        {} as Record<string, string>,
      ),
    [safeProducts],
  );

  const loadMovements = useCallback(async () => {
    setMovementsLoading(true);
    setMovementsError(null);

    const result = await ProductsService.getStockMovements({ limit: 20 });
    if (!result?.success) {
      setMovements([]);
      setMovementsError(result?.message ?? "Falha ao carregar movimentações");
      setMovementsLoading(false);
      return;
    }

    const rawMovements: StockMovement[] = Array.isArray(result.movements)
      ? result.movements
      : [];

    setMovements(rawMovements);
    setMovementsLoading(false);
  }, [unitsByProductId]);

  const filteredMovements = useMemo(() => {
    const rangeStart = startOfDay(movementDateRange.startDate).getTime();
    const rangeEnd = startOfDay(movementDateRange.endDate).getTime();

    return movements
      .filter((movement) => {
        const timestamp = toTimestamp(movement.criado_em);
        if (!timestamp) return false;
        const movementDay = startOfDay(new Date(timestamp)).getTime();
        return movementDay >= rangeStart && movementDay <= rangeEnd;
      })
      .sort((a, b) => toTimestamp(b.criado_em) - toTimestamp(a.criado_em))
      .map((movement) => {
        const productId =
          movement.produto_id !== undefined && movement.produto_id !== null
            ? String(movement.produto_id)
            : null;
        return {
          id: String(movement.id ?? `${Date.now()}`),
          produto: movement.produto_nome ?? "Produto",
          tipo:
            movement.tipo === "entrada" || movement.tipo === "saida"
              ? movement.tipo
              : "ajuste",
          quantidade: Number(movement.quantidade ?? 0),
          unidade:
            movement.produto_unidade ??
            (productId ? unitsByProductId[productId] ?? "un" : "un"),
          data: formatMovementDate(movement.criado_em),
          responsavel: movement.criado_por ?? "Movimentação",
          motivo:
            typeof movement.descricao === "string" && movement.descricao.trim()
              ? movement.descricao.trim()
              : getAutomaticMovementMessage(movement),
        } as Movimentacao;
      })
      .slice(0, 12);
  }, [movementDateRange.endDate, movementDateRange.startDate, movements, unitsByProductId]);

  useEffect(() => {
    void loadMovements();
  }, [loadMovements]);

  const handleRefresh = async () => {
    setMovementsRefreshing(true);
    try {
      await Promise.all([Promise.resolve(onRefresh?.()), loadMovements()]);
    } finally {
      setMovementsRefreshing(false);
    }
  };

  const listHeader = (
    <View className="pb-6">
      <View className="rounded-[28px] border border-divider bg-card-background p-5 shadow-lg">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-sm uppercase tracking-widest text-text-tertiary">
              Catálogo
            </Text>
            <Text className="mt-2 text-2xl font-semibold text-text-primary">
              Controle de estoque
            </Text>
            <Text className="mt-2 text-sm text-text-secondary">
              Monitore níveis de estoque, custo e alertas de reposição.
            </Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-background-secondary">
            <Ionicons name="layers-outline" size={22} color="#2563EB" />
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

      <View className="mt-4 flex-row gap-3">
        <Pressable
          onPress={() => setStockFormType("entrada")}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3"
        >
          <Ionicons name="arrow-down-circle-outline" size={16} color="#059669" />
          <Text className="text-sm font-semibold text-emerald-700">
            Entrada de estoque
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setStockFormType("saida")}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3"
        >
          <Ionicons name="arrow-up-circle-outline" size={16} color="#DC2626" />
          <Text className="text-sm font-semibold text-rose-700">
            Saída de estoque
          </Text>
        </Pressable>
      </View>

      {error ? (
        <View className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <Text className="text-sm font-semibold text-rose-700">
            Não foi possível carregar os produtos
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

      <View className="mt-6 rounded-[26px] border border-divider bg-card-background p-5 shadow-lg">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-semibold text-text-primary">
              Movimentações recentes
            </Text>
            <Text className="mt-1 text-xs text-text-tertiary">
              Entradas, saídas e ajustes registrados no estoque
            </Text>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-background-secondary">
            <Ionicons name="swap-vertical-outline" size={18} color="#2563EB" />
          </View>
        </View>
        <View className="mt-4">
          <DateFilter value={movementDateRange} onChange={setMovementDateRange} />
          {movementsLoading ? (
            <View className="items-center rounded-2xl bg-background-secondary px-4 py-5">
              <ActivityIndicator color="#2563EB" />
              <Text className="mt-2 text-xs text-text-tertiary">
                Carregando movimentações...
              </Text>
            </View>
          ) : movementsError ? (
            <View className="rounded-2xl bg-rose-50 px-4 py-3">
              <Text className="text-xs font-semibold text-rose-700">
                {movementsError}
              </Text>
            </View>
          ) : filteredMovements.length ? (
            <MovimentacaoEstoque data={filteredMovements} />
          ) : (
            <View className="rounded-2xl bg-background-secondary px-4 py-3">
              <Text className="text-xs text-text-tertiary">
                Nenhuma movimentação nesse período.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderEstoqueCard = (item: Product) => {
    const stock = parseNumber(item.estoque);
    const isLowStock = stock !== null && stock <= 5;
    const cost = parseNumber(item.custo);
    const statusLabel = item.ativo === false ? "Inativo" : "Ativo";

    const imageUri = getImageUri(item.imagem);
    const handleEdit = () => setEditingProduct(item);
    const handleDelete = () => {
      if (!item.id) {
        setActionAlert({
          type: "error",
          message: "Não foi possível identificar o produto.",
        });
        return;
      }

      Alert.alert(
        "Excluir produto",
        `Tem certeza que deseja excluir "${item.nome ?? "este produto"}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: async () => {
              const result = await ProductsService.deleteProduct(item.id);
              if (result?.success) {
                setActionAlert({
                  type: "success",
                  message: "Produto excluído com sucesso.",
                });
                onRefresh?.();
              } else {
                setActionAlert({
                  type: "error",
                  message:
                    result?.message ??
                    "Não foi possível excluir o produto.",
                });
              }
            },
          },
        ]
      );
    };

    if (viewMode === "compact") {
      return (
        <View className="mb-3 rounded-2xl border border-divider bg-card-background px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  className="h-10 w-10 rounded-xl border border-divider"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-background-secondary">
                  <Text className="text-xs font-semibold text-text-primary">
                    {getInitials(item.nome)}
                  </Text>
                </View>
              )}
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
              <Text className={`text-sm font-semibold ${isLowStock ? "text-state-error" : "text-text-primary"}`}>
                {stock ?? 0} {item.unidade ?? "un"}
              </Text>
              <Text className="text-xs text-text-tertiary">
                {formatCurrency(cost ?? 0)}
              </Text>
            </View>
            <View className="ml-3 flex-row items-center gap-2">
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
          </View>
        </View>
      );
    }

    return (
      <View className="mb-4 overflow-hidden rounded-[26px] border border-divider bg-card-background p-5 shadow-lg">
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
                  {getInitials(item.nome)}
                </Text>
              </View>
            )}
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

        <View className="mt-4 flex-row items-center justify-between">
          <Text className="text-xs text-text-tertiary">
            Código: {item.codigo ?? "—"}
          </Text>
          <Text className="text-xs text-text-tertiary">
            SKU: {item.sku ?? "—"}
          </Text>
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
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#2563EB" />
        <Text className="mt-2 text-sm text-text-secondary">
          Carregando estoque...
        </Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={filtered}
        keyExtractor={(item, index) =>
          item.id?.toString() ?? item.sku ?? item.codigo ?? `product-${index}`
        }
        renderItem={({ item }) => renderEstoqueCard(item)}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={Boolean(refreshing) || movementsRefreshing}
        ListEmptyComponent={
          <View className="rounded-[26px] border border-divider bg-card-background p-6">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-background-secondary">
              <Ionicons name="layers-outline" size={22} color="#9CA3AF" />
            </View>
            <Text className="mt-4 text-lg font-semibold text-text-primary">
              Nenhum item de estoque encontrado
            </Text>
            <Text className="mt-2 text-sm text-text-secondary">
              Cadastre produtos ou refine sua busca para exibir resultados.
            </Text>
          </View>
        }
      />

      <Modal
        visible={!!stockFormType}
        animationType="slide"
        onRequestClose={() => setStockFormType(null)}
      >
        <View className="flex-1 bg-background-primary">
          {stockFormType ? (
            <FormEstoque
              products={safeProducts}
              movementType={stockFormType}
              onBack={() => setStockFormType(null)}
              onSuccess={handleRefresh}
            />
          ) : null}
        </View>
      </Modal>

      <Modal
        visible={!!editingProduct}
        animationType="slide"
        onRequestClose={() => setEditingProduct(null)}
      >
        <View className="flex-1 bg-background-primary">
          <FormComponent
            fields={fieldsProduct}
            title="Editar produto"
            subtitle="Atualize as informações do produto."
            submitButtonText="Salvar alterações"
            initialData={
              editingProduct
                ? {
                    codigo: editingProduct.codigo ?? editingProduct.sku ?? "",
                    nome: editingProduct.nome ?? "",
                    categoria: editingProduct.categoria ?? "",
                    sku: editingProduct.sku ?? "",
                    preco_venda: editingProduct.preco_venda ?? "",
                    custo: editingProduct.custo ?? "",
                    estoque: editingProduct.estoque ?? "",
                    unidade: editingProduct.unidade ?? "",
                    descricao: editingProduct.descricao ?? "",
                    imagem: editingProduct.imagem ?? null,
                    ativo: editingProduct.ativo === false ? 0 : 1,
                  }
                : null
            }
            onBack={() => setEditingProduct(null)}
            backButtonText="Cancelar"
            onSubmit={async (data) => {
              if (!editingProduct?.id) {
                setActionAlert({
                  type: "error",
                  message: "Não foi possível identificar o produto.",
                });
                return;
              }

              const payload: ProductPayload = {
                codigo: data.codigo ?? data.sku,
                nome: data.nome,
                categoria: data.categoria,
                sku: data.sku,
                preco_venda: data.preco_venda,
                custo: data.custo,
                estoque: data.estoque,
                unidade: data.unidade,
                descricao: data.descricao,
                imagem: data.imagem,
                ativo: data.ativo,
              };

              const result = await ProductsService.updateProduct(
                editingProduct.id,
                payload
              );

              if (result?.success) {
                setActionAlert({
                  type: "success",
                  message: "Produto atualizado com sucesso.",
                });
                setEditingProduct(null);
                onRefresh?.();
              } else {
                setActionAlert({
                  type: "error",
                  message:
                    result?.message ??
                    "Não foi possível atualizar o produto.",
                });
              }
            }}
          />
        </View>
      </Modal>
    </>
  );
}
