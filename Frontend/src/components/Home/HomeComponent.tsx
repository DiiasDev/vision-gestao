import { useState } from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import {
  BarChart,
  LineChart,
  PieChart,
} from "react-native-chart-kit";

type HomeComponentProps = {
  userName?: string;
};

export default function HomeComponent({ userName }: HomeComponentProps) {
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 48;
  const barLabels = ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago"];
  const barValues = [6.2, 7.1, 6.6, 8.4, 9.2, 7.9];
  const lineLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const lineValues = [4.2, 4.8, 5.1, 5.0, 5.6, 6.3, 6.1];
  const barChartHeight = 220;
  const lineChartHeight = 220;
  const barMax = Math.max(...barValues);
  const [barTooltip, setBarTooltip] = useState<{
    title: string;
    value: string;
    x: number;
    y: number;
  } | null>(null);
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

  const chartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#2563EB",
    },
  };

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

        <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-text-primary">
              Visão geral do caixa
            </Text>
            <Text className="text-xs text-text-tertiary">Últimos 6 meses</Text>
          </View>
          <View className="mt-4 flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-background-secondary p-4">
              <Text className="text-xs text-text-secondary">Faturamento</Text>
              <Text className="mt-1 text-lg font-semibold text-state-success">
                R$ 34.860
              </Text>
              <Text className="mt-1 text-[11px] text-text-tertiary">
                +18% no semestre
              </Text>
            </View>
            <View className="flex-1 rounded-2xl bg-background-secondary p-4">
              <Text className="text-xs text-text-secondary">Custos</Text>
              <Text className="mt-1 text-lg font-semibold text-state-error">
                R$ 14.920
              </Text>
              <Text className="mt-1 text-[11px] text-text-tertiary">
                42% do total
              </Text>
            </View>
          </View>
          <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
            <Text className="text-xs text-text-secondary">Saldo em caixa</Text>
            <Text className="mt-1 text-xl font-semibold text-text-primary">
              R$ 12.950
            </Text>
          </View>
        </View>

        <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-text-primary">
              Vendas mensais
            </Text>
            <Text className="text-xs text-text-tertiary">Produtos + serviços</Text>
          </View>
          <View className="mt-4 items-center relative">
            {barTooltip ? (
              <View
                className="absolute z-10 rounded-xl bg-text-primary px-3 py-2"
                style={{
                  left: Math.max(
                    12,
                    Math.min(barTooltip.x - 40, chartWidth - 110),
                  ),
                  top: Math.max(8, barTooltip.y - 48),
                }}
              >
                <Text className="text-[11px] text-white/80">
                  {barTooltip.title}
                </Text>
                <Text className="text-sm font-semibold text-white">
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
                decimalPlaces: 1,
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
                  barChartHeight -
                  (value / barMax) * (barChartHeight - 24);
                return (
                  <Pressable
                    key={`${value}-${index}`}
                    className="flex-1"
                    onPress={() => {
                      setLineTooltip(null);
                      setBarTooltip({
                        title: `Mês ${barLabels[index]}`,
                        value: `R$ ${(value * 1000).toFixed(0)}`,
                        x,
                        y,
                      });
                    }}
                  />
                );
              })}
            </View>
          </View>
        </View>

        <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-text-primary">
              Custos x lucros por serviço
            </Text>
            <Text className="text-xs text-text-tertiary">Últimos 30 dias</Text>
          </View>
          <View className="mt-4 items-center">
            <LineChart
              data={{
                labels: ["Tela", "Bateria", "Conector", "Software", "Outros"],
                datasets: [
                  { data: [4200, 2100, 1600, 900, 700], color: () => "#DC2626" },
                  { data: [7200, 4100, 2900, 1800, 1200], color: () => "#16A34A" },
                ],
                legend: ["Custos", "Lucros"],
              }}
              width={chartWidth}
              height={240}
              chartConfig={{
                ...chartConfig,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              }}
              withInnerLines={false}
              bezier
              style={{ borderRadius: 16 }}
            />
          </View>
          <View className="mt-4 flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-background-secondary px-4 py-3">
              <Text className="text-xs text-text-secondary">Margem média</Text>
              <Text className="mt-1 text-lg font-semibold text-text-primary">
                46%
              </Text>
            </View>
            <View className="flex-1 rounded-2xl bg-background-secondary px-4 py-3">
              <Text className="text-xs text-text-secondary">Lucro total</Text>
              <Text className="mt-1 text-lg font-semibold text-state-success">
                R$ 9.800
              </Text>
            </View>
          </View>
        </View>

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
                  legendFontColor: "#6B7280",
                  legendFontSize: 12,
                },
                {
                  name: "Bateria",
                  population: 22,
                  color: "#16A34A",
                  legendFontColor: "#6B7280",
                  legendFontSize: 12,
                },
                {
                  name: "Conector",
                  population: 18,
                  color: "#F59E0B",
                  legendFontColor: "#6B7280",
                  legendFontSize: 12,
                },
                {
                  name: "Acessórios",
                  population: 22,
                  color: "#0EA5E9",
                  legendFontColor: "#6B7280",
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
                className="absolute z-10 rounded-xl bg-text-primary px-3 py-2"
                style={{
                  left: Math.max(
                    12,
                    Math.min(lineTooltip.x - 40, chartWidth - 110),
                  ),
                  top: Math.max(8, lineTooltip.y - 48),
                }}
              >
                <Text className="text-[11px] text-white/80">
                  {lineTooltip.title}
                </Text>
                <Text className="text-sm font-semibold text-white">
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
                setBarTooltip(null);
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
            <View className="flex-row items-center justify-between rounded-2xl bg-background-secondary px-4 py-3">
              <View>
                <Text className="text-sm text-text-secondary">
                  Venda • Película 3D
                </Text>
                <Text className="text-xs text-text-tertiary">09:12</Text>
              </View>
              <Text className="text-sm font-semibold text-state-success">
                + R$ 65
              </Text>
            </View>
            <View className="flex-row items-center justify-between rounded-2xl bg-background-secondary px-4 py-3">
              <View>
                <Text className="text-sm text-text-secondary">
                  Serviço • Troca de bateria
                </Text>
                <Text className="text-xs text-text-tertiary">08:40</Text>
              </View>
              <Text className="text-sm font-semibold text-text-primary">
                OS #1294
              </Text>
            </View>
            <View className="flex-row items-center justify-between rounded-2xl bg-background-secondary px-4 py-3">
              <View>
                <Text className="text-sm text-text-secondary">
                  Fornecedor • Capas premium
                </Text>
                <Text className="text-xs text-text-tertiary">Ontem</Text>
              </View>
              <Text className="text-sm font-semibold text-state-error">
                - R$ 420
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
