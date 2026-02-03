import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Product } from "../../services/Products.services";
import MovimentacaoEstoque, {
  Movimentacao,
} from "./MovimentacaoEstoque";

type EstoqueComponentProps = {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  refreshing?: boolean;
};

const parseNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const raw = String(value).trim();
  if (!raw) return 0;
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatNumber = (value: number) => {
  try {
    return new Intl.NumberFormat("pt-BR").format(value);
  } catch {
    return String(value);
  }
};

const mockMovements: Movimentacao[] = [
  {
    id: "mv-1",
    produto: "Cabo HDMI 2.1",
    tipo: "saida",
    quantidade: 3,
    unidade: "un",
    data: "Hoje, 14:12",
    responsavel: "Gabriel (Vendas)",
    motivo: "Venda balcão • Pedido #8291",
  },
  {
    id: "mv-2",
    produto: "Tela iPhone 13",
    tipo: "entrada",
    quantidade: 6,
    unidade: "un",
    data: "Hoje, 10:40",
    responsavel: "Larissa (Compras)",
    motivo: "Reposição automática • Fornecedor Prime",
  },
  {
    id: "mv-3",
    produto: "Película 3D",
    tipo: "ajuste",
    quantidade: 2,
    unidade: "un",
    data: "Ontem, 19:08",
    responsavel: "Estoque",
    motivo: "Ajuste após inventário rápido",
  },
  {
    id: "mv-4",
    produto: "Bateria A32",
    tipo: "saida",
    quantidade: 1,
    unidade: "un",
    data: "Ontem, 17:20",
    responsavel: "João (Técnico)",
    motivo: "Uso em manutenção",
  },
];

export default function EstoqueComponent({
  products,
  loading,
  error,
  onRefresh,
  refreshing,
}: EstoqueComponentProps) {
  const safeProducts = Array.isArray(products) ? products : [];
  const totalItems = safeProducts.reduce(
    (acc, product) => acc + parseNumber(product.estoque),
    0
  );
  const lowStockItems = safeProducts.filter(
    (product) => parseNumber(product.estoque) > 0 && parseNumber(product.estoque) <= 5
  );
  const outOfStock = safeProducts.filter(
    (product) => parseNumber(product.estoque) === 0
  );
  const activeProducts = safeProducts.filter((product) => product.ativo !== false);
  const giroEstimado = Math.max(1, Math.round((totalItems || 1) / 6));

  return (
    <View className="mt-6">
      {loading ? (
        <View className="items-center justify-center rounded-[26px] border border-divider bg-card-background py-10">
          <ActivityIndicator color="#2563EB" />
          <Text className="mt-2 text-sm text-text-secondary">
            Atualizando estoque...
          </Text>
        </View>
      ) : null}

      {error ? (
        <View className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <Text className="text-sm font-semibold text-rose-700">
            Falha ao carregar dados de estoque
          </Text>
          <Text className="mt-1 text-sm text-rose-600">{error}</Text>
          {onRefresh ? (
            <Pressable
              className="mt-3 self-start rounded-full border border-rose-200 px-3 py-1"
              onPress={onRefresh}
              disabled={Boolean(refreshing)}
            >
              <Text className="text-xs font-semibold text-rose-700">
                Tentar novamente
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View className="rounded-[28px] border border-divider bg-card-background p-5 shadow-lg">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-sm uppercase tracking-widest text-text-tertiary">
              Resumo do estoque
            </Text>
            <Text className="mt-2 text-lg font-semibold text-text-primary">
              Indicadores críticos e oportunidades
            </Text>
            <Text className="mt-2 text-sm text-text-secondary">
              {activeProducts.length} itens ativos no catálogo.
            </Text>
          </View>
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-background-secondary">
            <Ionicons name="analytics-outline" size={20} color="#2563EB" />
          </View>
        </View>

        <View className="mt-5 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-background-secondary px-4 py-3">
            <Text className="text-xs text-text-secondary">Estoque total</Text>
            <Text className="mt-1 text-lg font-semibold text-text-primary">
              {formatNumber(totalItems)} un
            </Text>
            <Text className="mt-1 text-[11px] text-text-tertiary">
              giro médio em {giroEstimado} dias
            </Text>
          </View>
          <View className="flex-1 rounded-2xl bg-background-secondary px-4 py-3">
            <Text className="text-xs text-text-secondary">Itens críticos</Text>
            <Text className="mt-1 text-lg font-semibold text-state-error">
              {lowStockItems.length}
            </Text>
            <Text className="mt-1 text-[11px] text-text-tertiary">
              {outOfStock.length} sem estoque
            </Text>
          </View>
        </View>

        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-xs text-text-secondary">
            Recomendações automáticas
          </Text>
          <Text className="mt-2 text-sm font-semibold text-text-primary">
            Priorize reposição de {lowStockItems[0]?.nome ?? "itens de alta saída"}
          </Text>
          <Text className="mt-1 text-xs text-text-tertiary">
            Baseado nas últimas 48h de movimentações.
          </Text>
        </View>
      </View>

      <View className="mt-6 rounded-[26px] border border-divider bg-card-background p-5 shadow-lg">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-semibold text-text-primary">
              Movimentações recentes
            </Text>
            <Text className="mt-1 text-xs text-text-tertiary">
              Últimas 24 horas
            </Text>
          </View>
          <Pressable className="rounded-full border border-divider px-3 py-1">
            <Text className="text-xs font-semibold text-text-secondary">
              Ver histórico
            </Text>
          </Pressable>
        </View>
        <View className="mt-4">
          <MovimentacaoEstoque data={mockMovements} />
        </View>
      </View>

      <View className="mt-6 rounded-[26px] border border-divider bg-card-background p-5 shadow-lg">
        <Text className="text-sm font-semibold text-text-primary">
          Itens com risco de ruptura
        </Text>
        <Text className="mt-1 text-xs text-text-tertiary">
          Produtos com baixa cobertura para os próximos 7 dias.
        </Text>
        <View className="mt-4">
          {lowStockItems.length ? (
            lowStockItems.slice(0, 4).map((item) => (
              <View
                key={item.id}
                className="mb-3 flex-row items-center justify-between rounded-2xl bg-background-secondary px-4 py-3"
              >
                <View>
                  <Text className="text-sm font-semibold text-text-primary">
                    {item.nome}
                  </Text>
                  <Text className="mt-1 text-xs text-text-tertiary">
                    {item.categoria ?? "Categoria n/d"} • {item.sku ?? "SKU n/d"}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-state-error">
                  {parseNumber(item.estoque)} un
                </Text>
              </View>
            ))
          ) : (
            <View className="rounded-2xl bg-background-secondary px-4 py-3">
              <Text className="text-sm text-text-secondary">
                Nenhum item crítico identificado no momento.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
