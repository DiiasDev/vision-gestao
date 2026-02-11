import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { PieChart } from "react-native-chart-kit";
import Svg, { Text as SvgText } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  GraphicService,
  ServicosPorCategoriaData,
} from "../../../services/Graphic.services";
import {
  ServicesCategories,
  ServicesCategoryOption,
} from "../Filters/ServicesCategories";

type ServicosPorCategoriasProps = {
  chartWidth: number;
  chartConfig: {
    backgroundGradientFrom: string;
    backgroundGradientTo: string;
    backgroundGradientFromOpacity: number;
    backgroundGradientToOpacity: number;
    color: (opacity?: number) => string;
    labelColor: (opacity?: number) => string;
    strokeWidth: number;
    barPercentage: number;
    propsForDots?: {
      r?: string;
      strokeWidth?: string;
      stroke?: string;
    };
    propsForBackgroundLines?: {
      stroke?: string;
    };
  };
  textMuted: string;
  dateRange?: { startDate: Date; endDate: Date };
  onInfoPress?: () => void;
};

export function ServicosPorCategorias({
  chartWidth,
  chartConfig,
  textMuted,
  dateRange,
  onInfoPress,
}: ServicosPorCategoriasProps) {
  const { theme } = useTheme();
  const range = dateRange
    ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
    : undefined;
  const [pieTooltip, setPieTooltip] = useState<{
    title: string;
    value: string;
    count?: number;
    total?: number;
  } | null>(null);

  const [data, setData] = useState<ServicosPorCategoriaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const palette = useMemo(
    () =>
      theme === "dark"
        ? [
            "#60A5FA",
            "#4ADE80",
            "#FACC15",
            "#38BDF8",
            "#C084FC",
            "#FB7185",
            "#2DD4BF",
            "#FB923C",
          ]
        : [
            "#2563EB",
            "#16A34A",
            "#F59E0B",
            "#0EA5E9",
            "#9333EA",
            "#EF4444",
            "#14B8A6",
            "#F97316",
          ],
    [theme]
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      const result = await GraphicService.getServicosPorCategoria(range);
      if (!active) return;
      if (result?.success) {
        const nextData = result.data ?? { total: 0, categorias: [], dias: 30 };
        setData(nextData);
        setSelectedCategories(
          nextData.categorias.map((item) => item.categoria)
        );
      } else {
        setData({ total: 0, categorias: [], dias: 30 });
        setError(result?.message ?? "Falha ao carregar serviços por categoria.");
        setSelectedCategories([]);
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [range?.endDate, range?.startDate]);

  useEffect(() => {
    setPieTooltip(null);
  }, [selectedCategories]);

  const categoryOptions = useMemo<ServicesCategoryOption[]>(() => {
    const categorias = data?.categorias ?? [];
    return categorias.map((item) => ({
      id: item.categoria,
      label: item.categoria,
      count: item.quantidade,
    }));
  }, [data]);

  const filteredCategorias = useMemo(() => {
    const categorias = data?.categorias ?? [];
    if (!selectedCategories.length) return [];
    return categorias.filter((item) =>
      selectedCategories.includes(item.categoria)
    );
  }, [data, selectedCategories]);

  const filteredTotal = useMemo(
    () =>
      filteredCategorias.reduce((acc, item) => acc + item.quantidade, 0),
    [filteredCategorias]
  );

  const chartData = useMemo(() => {
    return filteredCategorias.map((item, index) => {
      const percent =
        filteredTotal > 0 ? (item.quantidade / filteredTotal) * 100 : 0;
      return {
        name: item.categoria,
        label: item.categoria,
        percent,
        population: Number.isFinite(percent)
          ? Number(percent.toFixed(1))
          : 0,
        count: item.quantidade,
        color: palette[index % palette.length],
        legendFontColor: textMuted,
        legendFontSize: 12,
      };
    });
  }, [filteredCategorias, filteredTotal, palette, textMuted]);

  const totalGeral = data?.total ?? 0;
  const totalFiltrado = filteredTotal;
  const formatRangeLabel = (date: Date) =>
    date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  const diasLabel = data?.dias ?? 30;
  const periodLabel = dateRange
    ? `${formatRangeLabel(dateRange.startDate)} - ${formatRangeLabel(
        dateRange.endDate
      )}`
    : `Últimos ${diasLabel} dias`;
  const pieSize = Math.min(Math.max(chartWidth - 40, 140), 240);
  const pieCenter = Math.max((chartWidth - pieSize) / 2, 0);
  const pieOffset = pieCenter + 6;
  const labelRadius = pieSize * 0.26;
  const pieChartConfig = useMemo(
    () => ({
      ...chartConfig,
      labelColor: (opacity = 1) =>
        theme === "dark"
          ? `rgba(241, 245, 249, ${opacity})`
          : `rgba(15, 23, 42, ${opacity})`,
    }),
    [chartConfig, theme]
  );
  const pieLabelColor = theme === "dark" ? "#0F172A" : "#FFFFFF";

  const labelPositions = useMemo(() => {
    const total = filteredTotal;
    if (!total || !chartData.length) return [];
    const startAngle = -Math.PI / 2;
    let current = startAngle;
    const centerX = chartWidth / 2 + pieCenter - pieOffset - 12;
    const centerY = pieSize / 2;
    return chartData.map((slice) => {
      const value = slice.count ?? 0;
      const angle = total > 0 ? (value / total) * Math.PI * 2 : 0;
      const mid = current + angle / 2;
      current += angle;
      return {
        label: `${slice.population.toFixed(1)}%`,
        x: centerX + Math.cos(mid) * labelRadius,
        y: centerY + Math.sin(mid) * labelRadius,
      };
    });
  }, [chartData, chartWidth, filteredTotal, pieCenter, pieOffset, pieSize, labelRadius]);

  return (
    <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-2 pr-2">
          <Text
            className="flex-1 text-base font-semibold text-text-primary"
            numberOfLines={2}
          >
            Serviços por categoria
          </Text>
          {onInfoPress ? (
            <Pressable
              onPress={onInfoPress}
              className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background-secondary"
              accessibilityRole="button"
              accessibilityLabel="Informacoes sobre servicos por categoria"
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
          <Text className="text-xs text-text-secondary">
            {totalGeral} serviços
          </Text>
        </View>
      </View>
      <ServicesCategories
        options={categoryOptions}
        selected={selectedCategories}
        onChange={setSelectedCategories}
      />
      {loading ? (
        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-sm text-text-secondary">
            Carregando serviços por categoria...
          </Text>
        </View>
      ) : error ? (
        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-sm text-state-error">{error}</Text>
        </View>
      ) : totalFiltrado === 0 ? (
        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-sm text-text-secondary">
            {selectedCategories.length
              ? "Nenhum serviço registrado no período."
              : "Selecione ao menos uma categoria para visualizar o gráfico."}
          </Text>
        </View>
      ) : (
        <View className="mt-4 w-full items-center">
          <View style={{ width: chartWidth + pieOffset, height: pieSize }}>
            <PieChart
              data={chartData}
              width={chartWidth}
              height={pieSize}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              chartConfig={pieChartConfig}
              center={[pieCenter, 0]}
              hasLegend={false}
              absolute={false}
              style={{ alignSelf: "center", marginLeft: pieOffset }}
            />
            <Svg
              width={chartWidth}
              height={pieSize}
              style={{ position: "absolute", left: pieOffset, top: 0 }}
              pointerEvents="none"
            >
              {labelPositions.map((item, index) => (
                <SvgText
                  key={`${item.label}-${index}`}
                  x={item.x}
                  y={item.y}
                  fill={pieLabelColor}
                  fontSize="13"
                  fontWeight="700"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {item.label}
                </SvgText>
              ))}
            </Svg>
          </View>
          <View className="mt-6 w-full gap-3">
            {chartData.map((item) => (
              <Pressable
                key={item.label}
                className="rounded-2xl bg-background-secondary px-4 py-3"
                onPress={() =>
                  setPieTooltip({
                    title: item.label,
                    value: `${item.population}% dos serviços`,
                    count: item.count,
                    total: totalFiltrado,
                  })
                }
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text className="text-sm text-text-secondary">
                      {item.label}
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-text-primary">
                    {item.population}%
                  </Text>
                </View>
                <View className="mt-2 h-2 w-full overflow-hidden rounded-full bg-divider">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(item.population, 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </View>
              </Pressable>
            ))}
          </View>
          {pieTooltip ? (
            <View className="mt-6 w-full rounded-2xl border border-divider bg-background-secondary px-4 py-3">
              <Text className="text-xs uppercase tracking-widest text-text-tertiary">
                {pieTooltip.title}
              </Text>
              <Text className="mt-1 text-lg font-semibold text-text-primary">
                {pieTooltip.value}
              </Text>
              {typeof pieTooltip.count === "number" ? (
                <Text className="text-xs text-text-tertiary">
                  {pieTooltip.count} de{" "}
                  {pieTooltip.total ?? totalFiltrado} serviços
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}
