import { useEffect, useMemo, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  CustoLucroData,
  GraphicService,
} from "../../../services/Graphic.services";
import { formatCurrencyBR } from "../../../utils/formatter";

export function CustoXLucro({
  dateRange,
  onInfoPress,
}: {
  dateRange?: { startDate: Date; endDate: Date };
  onInfoPress?: () => void;
}) {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 48;

  const [data, setData] = useState<CustoLucroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    title: string;
    lucro: number;
    label: "Custos" | "Vendas" | "Valor";
    value: number;
    color: string;
    lucroColor: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      const result = await GraphicService.getCustoXLucro(
        dateRange
          ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
          : undefined
      );
      if (!active) return;
      if (result?.success) {
        setData(result.data ?? null);
      } else {
        setData(null);
        setError(result?.message ?? "Falha ao carregar custo x lucro.");
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
  const services = data?.servicos ?? [];
  const maxServices = 6;
  const sorted = [...services].sort((a, b) => {
    const vendaA = a.totalVenda ?? a.totalValor ?? 0;
    const vendaB = b.totalVenda ?? b.totalValor ?? 0;
    return vendaB - vendaA;
  });
  const primary = sorted.slice(0, maxServices);
  const remainder = sorted.slice(maxServices);

  const aggregated =
    remainder.length > 0
      ? [
          ...primary,
          {
            servicoId: "outros",
            servicoNome: "Outros",
            totalValor: remainder.reduce(
              (acc, s) => acc + (s.totalValor || 0),
              0,
            ),
            totalVenda: remainder.reduce(
              (acc, s) => acc + ((s.totalVenda ?? s.totalValor) || 0),
              0,
            ),
            totalCusto: remainder.reduce(
              (acc, s) => acc + (s.totalCusto || 0),
              0,
            ),
            quantidade: remainder.reduce(
              (acc, s) => acc + (s.quantidade || 0),
              0,
            ),
            lucroTotal: remainder.reduce((acc, s) => acc + (s.lucroTotal || 0), 0),
            media: 0,
          },
        ]
      : primary;

  const periodLabel = dateRange
    ? `${formatRangeLabel(dateRange.startDate)} - ${formatRangeLabel(
        dateRange.endDate
      )}`
    : "Últimos 30 dias";

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

  const hasData =
    Array.isArray(aggregated) &&
    aggregated.some(
      (item) =>
        normalizeValue(item.totalVenda ?? item.totalValor) > 0 ||
        normalizeValue(item.totalCusto) > 0
    );

  const labels = aggregated.map((item) =>
    item.servicoNome.length > 12
      ? `${item.servicoNome.slice(0, 12)}…`
      : item.servicoNome,
  );
  const custos = aggregated.map((item) =>
    Number.isFinite(item.totalCusto) ? item.totalCusto : 0,
  );
  const vendas = aggregated.map((item) => {
    const value = item.totalVenda ?? item.totalValor ?? 0;
    return Number.isFinite(value) ? value : 0;
  });
  const chartHeight = 240;

  const themeTokens = useMemo(() => {
    if (theme === "dark") {
      return {
        card: "#1F2937",
        text: "#E5E7EB",
        textMuted: "#94A3B8",
        accent: "#60A5FA",
      };
    }
    return {
      card: "#FFFFFF",
      text: "#111827",
      textMuted: "#6B7280",
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
      propsForDots: {
        r: "4",
        strokeWidth: "2",
        stroke: themeTokens.accent,
      },
      propsForBackgroundLines: {
        stroke: themeTokens.textMuted,
      },
    }),
    [theme, themeTokens],
  );

  return (
    <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-2 pr-2">
          <Text
            className="flex-1 text-base font-semibold text-text-primary"
            numberOfLines={2}
          >
            Custos x vendas por serviço
          </Text>
          {onInfoPress ? (
            <Pressable
              onPress={onInfoPress}
              className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background-secondary"
              accessibilityRole="button"
              accessibilityLabel="Informacoes sobre custos e vendas por servico"
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
            Carregando custos e vendas...
          </Text>
        </View>
      ) : error ? (
        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-sm text-state-error">{error}</Text>
        </View>
      ) : aggregated.length && hasData ? (
        <>
          <View className="mt-4 items-center">
            {tooltip ? (
              <View
                className="absolute z-10 rounded-xl px-3 py-2"
                pointerEvents="none"
                style={{
                  left: Math.max(12, Math.min(tooltip.x - 40, chartWidth - 110)),
                  top: Math.max(8, tooltip.y - 48),
                  backgroundColor: theme === "dark" ? "#0B1220" : "#0F172A",
                  borderWidth: 1,
                  borderColor: "rgba(148, 163, 184, 0.25)",
                }}
              >
                <Text
                  className="text-[11px]"
                  style={{ color: theme === "dark" ? "#CBD5F1" : "#E2E8F0" }}
                >
                  {tooltip.title}
                </Text>
                <View className="mt-2">
                  <View className="flex-row items-center">
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: tooltip.lucroColor,
                        marginRight: 6,
                      }}
                    />
                    <Text
                      className="text-[11px]"
                      style={{ color: "rgba(148, 163, 184, 0.95)" }}
                    >
                      Lucro
                    </Text>
                  </View>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: tooltip.lucroColor }}
                  >
                    {formatCurrencyBR(tooltip.lucro)}
                  </Text>
                </View>
                <View className="mt-2 flex-row items-center">
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: tooltip.color,
                      marginRight: 6,
                    }}
                  />
                  <Text className="text-[11px]" style={{ color: "#CBD5F1" }}>
                    {tooltip.label}:{" "}
                  </Text>
                  <Text className="text-[12px]" style={{ color: "#F8FAFC" }}>
                    {formatCurrencyBR(tooltip.value)}
                  </Text>
                </View>
              </View>
            ) : null}
            <LineChart
              data={{
                labels,
                datasets: [
                  { data: custos, color: () => "#DC2626" },
                  { data: vendas, color: () => "#2563EB" },
                ],
                legend: ["Custos", "Vendas"],
              }}
              width={chartWidth}
              height={chartHeight}
              chartConfig={{
                ...chartConfig,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              }}
              withInnerLines={false}
              bezier
              style={{ borderRadius: 16 }}
              onDataPointClick={(point) => {
                const idx = point.index;
                const custoAt = custos[idx] ?? 0;
                const vendaAt = vendas[idx] ?? 0;
                const matchesCusto = Math.abs((point.value ?? 0) - custoAt) < 0.01;
                const matchesVenda = Math.abs((point.value ?? 0) - vendaAt) < 0.01;
                const datasetLabel =
                  matchesCusto
                    ? "Custos"
                    : matchesVenda
                      ? "Vendas"
                      : point.datasetIndex === 0
                        ? "Custos"
                        : point.datasetIndex === 1
                          ? "Vendas"
                          : "Valor";
                const item = aggregated[point.index];
                const rawLabel = item?.servicoNome ?? "";
                const lucroValue = item?.lucroTotal ?? 0;
                const lucroColor = lucroValue >= 0 ? "#22C55E" : "#EF4444";
                const color = datasetLabel === "Custos" ? "#DC2626" : "#2563EB";
                setTooltip({
                  title: rawLabel,
                  lucro: lucroValue,
                  label: datasetLabel,
                  value: point.value ?? 0,
                  color,
                  lucroColor,
                  x: point.x,
                  y: point.y,
                });
              }}
            />
          </View>
          <View className="mt-4 flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-background-secondary px-4 py-3">
              <Text className="text-xs text-text-secondary">Margem média de Lucro</Text>
              <Text className="mt-1 text-lg font-semibold text-text-primary">
                {data?.totalValor
                  ? `${((data.lucroTotal / data.totalValor) * 100).toFixed(1)}%`
                  : "0.0%"}
              </Text>
            </View>
            <View className="flex-1 rounded-2xl bg-background-secondary px-4 py-3">
              <Text className="text-xs text-text-secondary">Lucro total No Período</Text>
              <Text className="mt-1 text-lg font-semibold text-state-success">
                {formatCurrencyBR(data?.lucroTotal ?? 0)}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-sm text-text-secondary">
            Nenhum serviço realizado no período.
          </Text>
        </View>
      )}
    </View>
  );
}
