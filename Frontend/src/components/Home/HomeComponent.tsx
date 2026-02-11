import { useEffect, useMemo, useState } from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FinanceMovementView,
  FinanceService,
} from "../../services/Finance.services";
import { formatCurrencyBR } from "../../utils/formatter";
import { VendasMensais } from "./Graphics/VendasMensais";
import { CustoXLucro } from "./Graphics/custoXvendas";
import { ValuesCards } from "./Cards/ValuesCards";
import { StatusOS } from "./Cards/StatusOS";
import { ServicosPorCategorias } from "./Graphics/servicosPorCategorias";
import { EstoqueCritico } from "./Cards/EstoqueCritico";
import {
  DateFilter,
  DateRangeValue,
} from "./Filters/DateFilter";
import { HomeInfoTopic, InfoModal } from "./Modals/infoModal";

type HomeComponentProps = {
  userName?: string;
};

export default function HomeComponent({ userName }: HomeComponentProps) {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 48;
  const [movements, setMovements] = useState<FinanceMovementView[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(true);
  const [movementError, setMovementError] = useState<string | null>(null);
  const [infoTopic, setInfoTopic] = useState<HomeInfoTopic | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => {
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear(), 0, 1);
    return {
      preset: "custom",
      startDate,
      endDate,
    };
  });

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

  const filteredMovements = useMemo(() => {
    const start = new Date(dateRange.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);
    return movements.filter((movement) => {
      const movementDate = new Date(movement.dateISO);
      return movementDate >= start && movementDate <= end;
    });
  }, [dateRange.endDate, dateRange.startDate, movements]);

  const recentMovements = useMemo(() => {
    const ordered = [...filteredMovements].sort(
      (a, b) =>
        new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
    );
    return ordered.slice(0, 3);
  }, [filteredMovements]);

  const openInfo = (topic: HomeInfoTopic) => {
    setInfoTopic(topic);
  };

  const closeInfo = () => {
    setInfoTopic(null);
  };

  return (
    <>
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

        <DateFilter value={dateRange} onChange={setDateRange} />

        <View className="mt-2 mb-4">
          <Text className="text-xs uppercase tracking-widest text-text-secondary">
            Financeiro
          </Text>
        </View>

          <ValuesCards
            dateRange={dateRange}
            onInfoPress={() => openInfo("values_cards")}
          />

          <VendasMensais
            dateRange={dateRange}
            onInfoPress={() => openInfo("vendas_mensais")}
          />

          <CustoXLucro
            dateRange={dateRange}
            onInfoPress={() => openInfo("custo_lucro")}
          />

          <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="text-base font-semibold text-text-primary">
                  Movimentações recentes
                </Text>
                <Pressable
                  onPress={() => openInfo("movimentacoes_recentes")}
                  className="h-7 w-7 items-center justify-center rounded-full bg-background-secondary"
                  accessibilityRole="button"
                  accessibilityLabel="Informacoes sobre movimentacoes recentes"
                >
                  <Ionicons name="information-circle-outline" size={16} color="#2563EB" />
                </Pressable>
              </View>
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

        <View className="mt-2 mb-4">
          <Text className="text-xs uppercase tracking-widest text-text-secondary">
            Serviços
          </Text>
        </View>

          <ServicosPorCategorias
            chartWidth={chartWidth}
            chartConfig={chartConfig}
            textMuted={themeTokens.textMuted}
            dateRange={dateRange}
            onInfoPress={() => openInfo("servicos_categoria")}
          />

          <StatusOS
            dateRange={dateRange}
            onInfoPress={() => openInfo("status_os")}
          />

        <View className="mt-2 mb-4">
          <Text className="text-xs uppercase tracking-widest text-text-secondary">
            Estoque
          </Text>
        </View>

          <EstoqueCritico onInfoPress={() => openInfo("estoque_critico")} />

          <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="text-base font-semibold text-text-primary">
                  Giro de estoque
                </Text>
                <Pressable
                  onPress={() => openInfo("giro_estoque")}
                  className="h-7 w-7 items-center justify-center rounded-full bg-background-secondary"
                  accessibilityRole="button"
                  accessibilityLabel="Informacoes sobre giro de estoque"
                >
                  <Ionicons name="information-circle-outline" size={16} color="#2563EB" />
                </Pressable>
              </View>
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
        </View>
      </ScrollView>
      <InfoModal visible={Boolean(infoTopic)} topic={infoTopic} onClose={closeInfo} />
    </>
  );
}
