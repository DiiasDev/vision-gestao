import { useEffect, useMemo, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  GraphicService,
  VendasMensaisItem,
} from "../../../services/Graphic.services";
import { formatCurrencyBR } from "../../../utils/formatter";

type TooltipState = {
  title: string;
  value: string;
  x: number;
  y: number;
};

const buildFallbackMonths = () => {
  const monthLabels = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const now = new Date();
  const months: VendasMensaisItem[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const label = monthLabels[monthIndex];
    months.push({
      id: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
      key: label.toLowerCase(),
      label,
      valor: 0,
      year,
      month: monthIndex + 1,
    });
  }
  return months;
};

export function VendasMensais({
  dateRange,
  onInfoPress,
}: {
  dateRange?: { startDate: Date; endDate: Date };
  onInfoPress?: () => void;
}) {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 48;
  const barChartHeight = 220;

  const [barTooltip, setBarTooltip] = useState<TooltipState | null>(null);
  const [months, setMonths] = useState<VendasMensaisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const themeTokens = useMemo(() => {
    if (theme === "dark") {
      return {
        card: "#1F2937",
        text: "#E5E7EB",
        textMuted: "#94A3B8",
        grid: "#334155",
        accent: "#60A5FA",
      };
    }
    return {
      card: "#FFFFFF",
      text: "#111827",
      textMuted: "#6B7280",
      grid: "#E5E7EB",
      accent: "#2563EB",
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
      barPercentage: 0.6,
      propsForBackgroundLines: {
        stroke: themeTokens.grid,
      },
    }),
    [theme, themeTokens]
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      const result = await GraphicService.getVendasMensais(
        6,
        dateRange
          ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
          : undefined
      );
      if (!active) return;
      if (result?.success) {
        setMonths(result.meses ?? []);
      } else {
        setMonths([]);
        setError(result?.message ?? "Falha ao carregar vendas mensais.");
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [dateRange?.endDate, dateRange?.startDate]);

  const formatRangeLabel = (date: Date) =>
    date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  const periodLabel = dateRange
    ? `${formatRangeLabel(dateRange.startDate)} - ${formatRangeLabel(
        dateRange.endDate
      )}`
    : "Produtos + serviços";

  const normalizeValue = (raw: unknown) => {
    if (raw === undefined || raw === null || raw === "") return 0;
    if (typeof raw === "number") return Number.isFinite(raw) ? raw : 0;
    const text = String(raw).trim();
    if (!text) return 0;
    const normalized = text.includes(",")
      ? text.replace(/\./g, "").replace(",", ".")
      : text;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const displayMonths = months.length ? months : buildFallbackMonths();
  const barLabels = displayMonths.map((item) => item.label);
  const barValues = displayMonths.map((item) => normalizeValue(item.valor));
  const barMax = Math.max(...barValues, 1);
  const hasData =
    Array.isArray(barValues) && barValues.some((value) => value > 0);

  return (
    <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-2 pr-2">
          <Text
            className="flex-1 text-base font-semibold text-text-primary"
            numberOfLines={2}
          >
            Vendas mensais
          </Text>
          {onInfoPress ? (
            <Pressable
              onPress={onInfoPress}
              className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background-secondary"
              accessibilityRole="button"
              accessibilityLabel="Informacoes sobre vendas mensais"
            >
              <Ionicons name="information-circle-outline" size={16} color="#2563EB" />
            </Pressable>
          ) : null}
        </View>
        <View className="w-[42%] shrink-0 items-end">
          <Text
            className="text-right text-xs text-text-tertiary"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {periodLabel}
          </Text>
        </View>
      </View>

      {loading ? (
        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-sm text-text-secondary">
            Carregando vendas mensais...
          </Text>
        </View>
      ) : error ? (
        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-sm text-state-error">{error}</Text>
        </View>
      ) : !hasData ? (
        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-sm text-text-secondary">
            Nenhuma venda registrada no período.
          </Text>
        </View>
      ) : (
        <View className="mt-4 items-center relative">
          {barTooltip ? (
            <View
              className="absolute z-10 rounded-xl px-3 py-2"
              style={{
                left: Math.max(
                  12,
                  Math.min(barTooltip.x - 40, chartWidth - 110)
                ),
                top: Math.max(8, barTooltip.y - 48),
                backgroundColor: theme === "dark" ? "#111827" : "#111827",
              }}
            >
              <Text
                className="text-[11px]"
                style={{ color: theme === "dark" ? "#CBD5F1" : "#E5E7EB" }}
              >
                {barTooltip.title}
              </Text>
              <Text className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                {barTooltip.value}
              </Text>
            </View>
          ) : null}

          <BarChart
            data={{
              labels: barLabels,
              datasets: [{ data: barValues }],
            }}
            width={chartWidth}
            height={barChartHeight}
            fromZero
            showValuesOnTopOfBars
            withInnerLines={false}
            yAxisLabel="R$ "
            yAxisSuffix=""
            chartConfig={{
              ...chartConfig,
              decimalPlaces: 0,
            }}
            style={{ borderRadius: 16 }}
          />
          <View
            className="absolute inset-0 flex-row"
            style={{ height: barChartHeight }}
          >
            {barValues.map((value, index) => {
              const barWidth = chartWidth / barValues.length;
              const x = barWidth * index + barWidth / 2;
              const y =
                barChartHeight - (value / barMax) * (barChartHeight - 24);
              return (
                <Pressable
                  key={`${value}-${index}`}
                  className="flex-1"
                  onPress={() => {
                    setBarTooltip({
                      title: `Mês ${barLabels[index]}`,
                      value: formatCurrencyBR(value),
                      x,
                      y,
                    });
                  }}
                />
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
