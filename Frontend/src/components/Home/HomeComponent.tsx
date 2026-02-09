import { useEffect, useMemo, useState } from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import {
  BarChart,
  LineChart,
  PieChart,
} from "react-native-chart-kit";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FinanceMovementView,
  FinanceService,
} from "../../services/Finance.services";
import { formatCurrencyBR } from "../../utils/formatter";
import { VendasMensais } from "./Graphics/VendasMensais";
import { CustoXLucro } from "./Graphics/custoXvendas";
import { ValuesCards } from "./Cards/ValuesCards";

type HomeComponentProps = {
  userName?: string;
};

export default function HomeComponent({ userName }: HomeComponentProps) {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 48;
  const lineLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const lineValues = [4.2, 4.8, 5.1, 5.0, 5.6, 6.3, 6.1];
  const lineChartHeight = 220;
  const [lineTooltip, setLineTooltip] = useState<{
    title: string;
    value: string;
    x: number;
    y: number;
  } | null>(null);
  const [pieTooltip, setPieTooltip] = useState<{
    title: string;
    value: string;
  } | null>(null);
  const [movements, setMovements] = useState<FinanceMovementView[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(true);
  const [movementError, setMovementError] = useState<string | null>(null);

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
      propsForDots: {
        r: "4",
        strokeWidth: "2",
        stroke: themeTokens.accent,
      },
      propsForBackgroundLines: {
        stroke: themeTokens.grid,
      },
    }),
    [theme, themeTokens]
  );

  useEffect(() => {
    let active = true;
    const loadMovements = async () => {
      setLoadingMovements(true);
      setMovementError(null);
      const result = await FinanceService.getMovements();
      if (!active) return;
      if (result?.success) {
        setMovements(FinanceService.toView(result.movements ?? []));
      } else {
        setMovements([]);
        setMovementError(
          result?.message ?? "Falha ao carregar movimentações."
        );
      }
      setLoadingMovements(false);
    };
    loadMovements();
    return () => {
      active = false;
    };
  }, []);

  const recentMovements = useMemo(() => {
    const ordered = [...movements].sort(
      (a, b) =>
        new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
    );
    return ordered.slice(0, 3);
  }, [movements]);

  return (
    <ScrollView
      className="flex-1 bg-background-primary"
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-6 pt-10">
        <View className="mb-6">
          <Text className="text-sm uppercase tracking-widest text-text-secondary">
            Dashboard Financeiro
          </Text>
          <Text className="mt-2 text-3xl font-semibold text-text-primary">
            Olá{userName ? `, ${userName}` : ""}!
          </Text>
          <Text className="mt-2 text-base text-text-secondary">
            Controle total de vendas, serviços e caixa da sua assistência.
          </Text>
        </View>

        <ValuesCards />

        <VendasMensais />

        <CustoXLucro />

        <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-text-primary">
              Serviços por categoria
            </Text>
            <Text className="text-xs text-text-tertiary">Últimos 30 dias</Text>
          </View>
          <View className="mt-4 items-center">
            <PieChart
              data={[
                {
                  name: "Tela",
                  population: 38,
                  color: "#2563EB",
                  legendFontColor: themeTokens.textMuted,
                  legendFontSize: 12,
                },
                {
                  name: "Bateria",
                  population: 22,
                  color: "#16A34A",
                  legendFontColor: themeTokens.textMuted,
                  legendFontSize: 12,
                },
                {
                  name: "Conector",
                  population: 18,
                  color: "#F59E0B",
                  legendFontColor: themeTokens.textMuted,
                  legendFontSize: 12,
                },
                {
                  name: "Acessórios",
                  population: 22,
                  color: "#0EA5E9",
                  legendFontColor: themeTokens.textMuted,
                  legendFontSize: 12,
                },
              ]}
              width={chartWidth}
              height={200}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              chartConfig={chartConfig}
              center={[0, 0]}
              absolute
            />
            <View className="mt-4 w-full gap-2">
              {[
                { name: "Tela", value: 38, color: "#2563EB" },
                { name: "Bateria", value: 22, color: "#16A34A" },
                { name: "Conector", value: 18, color: "#F59E0B" },
                { name: "Acessórios", value: 22, color: "#0EA5E9" },
              ].map((item) => (
                <Pressable
                  key={item.name}
                  className="flex-row items-center justify-between rounded-2xl bg-background-secondary px-4 py-3"
                  onPress={() =>
                    setPieTooltip({
                      title: item.name,
                      value: `${item.value}% dos serviços`,
                    })
                  }
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text className="text-sm text-text-secondary">
                      {item.name}
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-text-primary">
                    {item.value}%
                  </Text>
                </Pressable>
              ))}
            </View>
            {pieTooltip ? (
              <View className="mt-4 rounded-xl bg-background-secondary px-4 py-3">
                <Text className="text-xs text-text-tertiary">
                  {pieTooltip.title}
                </Text>
                <Text className="text-base font-semibold text-text-primary">
                  {pieTooltip.value}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-text-primary">
              Status das ordens de serviço
            </Text>
            <Text className="text-xs text-text-tertiary">Hoje</Text>
          </View>
          <View className="mt-4 gap-3">
            <View className="rounded-2xl bg-background-secondary px-4 py-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-text-secondary">
                  Aguardando peças
                </Text>
                <Text className="text-sm font-semibold text-text-primary">6</Text>
              </View>
              <View className="mt-2 h-2 rounded-full bg-divider">
                <View className="h-2 w-[38%] rounded-full bg-state-warning" />
              </View>
            </View>
            <View className="rounded-2xl bg-background-secondary px-4 py-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-text-secondary">
                  Em andamento
                </Text>
                <Text className="text-sm font-semibold text-text-primary">11</Text>
              </View>
              <View className="mt-2 h-2 rounded-full bg-divider">
                <View className="h-2 w-[64%] rounded-full bg-state-info" />
              </View>
            </View>
            <View className="rounded-2xl bg-background-secondary px-4 py-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-text-secondary">Concluídas</Text>
                <Text className="text-sm font-semibold text-text-primary">18</Text>
              </View>
              <View className="mt-2 h-2 rounded-full bg-divider">
                <View className="h-2 w-[82%] rounded-full bg-state-success" />
              </View>
            </View>
          </View>
        </View>

        <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-text-primary">
              Estoque crítico
            </Text>
            <Text className="text-xs text-text-tertiary">Reposição</Text>
          </View>
          <View className="mt-4 gap-3">
            {[
              { name: "Película 3D", level: 18, max: 100 },
              { name: "Bateria iPhone 11", level: 9, max: 60 },
              { name: "Conector Tipo-C", level: 12, max: 80 },
              { name: "Capas Premium", level: 22, max: 120 },
            ].map((item) => {
              const percent = Math.round((item.level / item.max) * 100);
              return (
                <View
                  key={item.name}
                  className="rounded-2xl bg-background-secondary px-4 py-3"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-text-secondary">
                      {item.name}
                    </Text>
                    <Text className="text-sm font-semibold text-text-primary">
                      {item.level} un.
                    </Text>
                  </View>
                  <View className="mt-2 h-2 rounded-full bg-divider">
                    <View
                      className="h-2 rounded-full bg-state-error"
                      style={{ width: `${percent}%` }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-text-primary">
              Giro de estoque
            </Text>
            <Text className="text-xs text-text-tertiary">Últimos 30 dias</Text>
          </View>
          <View className="mt-4 items-center">
            <BarChart
              data={{
                labels: ["Capas", "Películas", "Cabos", "Carreg.", "Peças"],
                datasets: [{ data: [92, 78, 64, 48, 36] }],
              }}
              width={chartWidth}
              height={220}
              fromZero
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
        </View>

        <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-text-primary">
              Evolução do caixa
            </Text>
            <Text className="text-xs text-text-tertiary">Últimos 7 dias</Text>
          </View>
          <View className="mt-4 items-center relative">
            {lineTooltip ? (
              <View
                className="absolute z-10 rounded-xl px-3 py-2"
                style={{
                  left: Math.max(
                    12,
                    Math.min(lineTooltip.x - 40, chartWidth - 110),
                  ),
                  top: Math.max(8, lineTooltip.y - 48),
                  backgroundColor: theme === "dark" ? "#111827" : "#111827",
                }}
              >
                <Text
                  className="text-[11px]"
                  style={{ color: theme === "dark" ? "#CBD5F1" : "#E5E7EB" }}
                >
                  {lineTooltip.title}
                </Text>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: "#FFFFFF" }}
                >
                  {lineTooltip.value}
                </Text>
              </View>
            ) : null}
            <LineChart
              data={{
                labels: lineLabels,
                datasets: [{ data: lineValues }],
              }}
              width={chartWidth}
              height={lineChartHeight}
              chartConfig={{
                ...chartConfig,
                decimalPlaces: 1,
              }}
              bezier
              withInnerLines={false}
              onDataPointClick={({ value, index, x, y }) => {
                setLineTooltip({
                  title: `Dia ${lineLabels[index]}`,
                  value: `R$ ${(value * 1000).toFixed(0)}`,
                  x,
                  y,
                });
              }}
              style={{ borderRadius: 16 }}
            />
          </View>
        </View>

        <View className="rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-text-primary">
              Movimentações recentes
            </Text>
            <Text className="text-xs text-text-tertiary">Hoje</Text>
          </View>
          <View className="mt-4 gap-3">
            {loadingMovements ? (
              <View className="rounded-2xl bg-background-secondary px-4 py-3">
                <Text className="text-sm text-text-secondary">
                  Carregando movimentações...
                </Text>
              </View>
            ) : movementError ? (
              <View className="rounded-2xl bg-background-secondary px-4 py-3">
                <Text className="text-sm text-state-error">
                  {movementError}
                </Text>
              </View>
            ) : recentMovements.length === 0 ? (
              <View className="rounded-2xl bg-background-secondary px-4 py-3">
                <Text className="text-sm text-text-secondary">
                  Nenhuma movimentação recente.
                </Text>
              </View>
            ) : (
              recentMovements.map((movement) => {
                const signal = movement.type === "in" ? "+" : "-";
                const valueLabel = `${signal} ${formatCurrencyBR(movement.value)}`;
                return (
                  <View
                    key={movement.id}
                    className="flex-row items-center justify-between gap-3 rounded-2xl bg-background-secondary px-4 py-3"
                  >
                    <View className="flex-1">
                      <Text
                        className="text-sm text-text-secondary"
                        numberOfLines={2}
                      >
                        {movement.title}
                      </Text>
                      <Text className="text-xs text-text-tertiary">
                        {movement.dateLabel}
                      </Text>
                    </View>
                    <Text
                      className={`text-sm font-semibold ${
                        movement.type === "in"
                          ? "text-state-success"
                          : "text-state-error"
                      }`}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                    >
                      {valueLabel}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
