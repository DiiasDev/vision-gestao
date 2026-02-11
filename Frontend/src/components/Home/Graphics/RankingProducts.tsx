import { useEffect, useMemo, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  GraphicService,
  RankingProdutoItem,
} from "../../../services/Graphic.services";

type RankingProductsProps = {
  dateRange?: { startDate: Date; endDate: Date };
  onInfoPress?: () => void;
};

type RankingItem = {
  id: string;
  nome: string;
  quantidade: number;
};

export function RankingProducts({ dateRange, onInfoPress }: RankingProductsProps) {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 48;
  const [mode, setMode] = useState<"ranking" | "grafico">("ranking");
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [totalSaidas, setTotalSaidas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      const result = await GraphicService.getRankingProdutos(
        dateRange
          ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
          : undefined,
      );
      if (!active) return;
      if (result?.success) {
        setRanking((result.data?.produtos ?? []) as RankingProdutoItem[]);
        setTotalSaidas(result.data?.totalSaidas ?? 0);
      } else {
        setRanking([]);
        setTotalSaidas(0);
        setError(result?.message ?? "Falha ao carregar ranking de produtos.");
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [dateRange?.endDate, dateRange?.startDate]);

  const themeTokens = useMemo(() => {
    if (theme === "dark") {
      return {
        card: "#1F2937",
        text: "#E5E7EB",
        textMuted: "#94A3B8",
        grid: "#334155",
      };
    }
    return {
      card: "#FFFFFF",
      text: "#111827",
      textMuted: "#6B7280",
      grid: "#E5E7EB",
    };
  }, [theme]);

  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: themeTokens.card,
      backgroundGradientTo: themeTokens.card,
      backgroundGradientFromOpacity: 1,
      backgroundGradientToOpacity: 1,
      color: (opacity = 1) =>
        theme === "dark"
          ? `rgba(96, 165, 250, ${opacity})`
          : `rgba(37, 99, 235, ${opacity})`,
      labelColor: (opacity = 1) =>
        theme === "dark"
          ? `rgba(148, 163, 184, ${opacity})`
          : `rgba(107, 114, 128, ${opacity})`,
      strokeWidth: 2,
      barPercentage: 0.7,
      propsForBackgroundLines: {
        stroke: themeTokens.grid,
      },
    }),
    [theme, themeTokens],
  );

  return (
    <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-semibold text-text-primary">
            Produtos mais vendidos
          </Text>
          {onInfoPress ? (
            <Pressable
              onPress={onInfoPress}
              className="h-7 w-7 items-center justify-center rounded-full bg-background-secondary"
              accessibilityRole="button"
              accessibilityLabel="Informacoes sobre ranking de produtos"
            >
              <Ionicons name="information-circle-outline" size={16} color="#2563EB" />
            </Pressable>
          ) : null}
        </View>
        <Text className="text-xs text-text-tertiary">{totalSaidas} un.</Text>
      </View>

      <View className="mt-4 flex-row rounded-xl bg-background-secondary p-1">
        <Pressable
          onPress={() => setMode("ranking")}
          className={`flex-1 rounded-lg px-3 py-2 ${mode === "ranking" ? "bg-card-background" : ""}`}
        >
          <Text
            className={`text-center text-xs font-medium ${
              mode === "ranking" ? "text-text-primary" : "text-text-secondary"
            }`}
          >
            Ranking
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("grafico")}
          className={`flex-1 rounded-lg px-3 py-2 ${mode === "grafico" ? "bg-card-background" : ""}`}
        >
          <Text
            className={`text-center text-xs font-medium ${
              mode === "grafico" ? "text-text-primary" : "text-text-secondary"
            }`}
          >
            Grafico
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-sm text-text-secondary">
            Carregando ranking de produtos...
          </Text>
        </View>
      ) : error ? (
        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-sm text-state-error">{error}</Text>
        </View>
      ) : ranking.length === 0 ? (
        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-sm text-text-secondary">
            Nenhuma saida de estoque encontrada no periodo.
          </Text>
        </View>
      ) : mode === "ranking" ? (
        <View className="mt-4 gap-3">
          {ranking.map((item, index) => {
            const maxQty = ranking[0]?.quantidade || 1;
            const width = Math.max(8, Math.round((item.quantidade / maxQty) * 100));
            return (
              <View
                key={item.id}
                className="rounded-2xl bg-background-secondary px-4 py-3"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-text-primary" numberOfLines={1}>
                    {`${index + 1}. ${item.nome}`}
                  </Text>
                  <Text className="text-sm font-semibold text-state-info">
                    {item.quantidade} un.
                  </Text>
                </View>
                <View className="mt-2 h-2 rounded-full bg-divider">
                  <View
                    className="h-2 rounded-full bg-state-info"
                    style={{ width: `${width}%` }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View className="mt-4 items-center">
          <BarChart
            data={{
              labels: ranking.map((item) =>
                item.nome.length > 10 ? `${item.nome.slice(0, 10)}...` : item.nome,
              ),
              datasets: [{ data: ranking.map((item) => item.quantidade) }],
            }}
            width={chartWidth}
            height={220}
            fromZero
            showValuesOnTopOfBars
            withInnerLines={false}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              ...chartConfig,
              decimalPlaces: 0,
            }}
            style={{ borderRadius: 16 }}
          />
        </View>
      )}
    </View>
  );
}
