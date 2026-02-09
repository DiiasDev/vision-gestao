import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { PieChart } from "react-native-chart-kit";

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
};

export function ServicosPorCategorias({
  chartWidth,
  chartConfig,
  textMuted,
}: ServicosPorCategoriasProps) {
  const [pieTooltip, setPieTooltip] = useState<{
    title: string;
    value: string;
  } | null>(null);

  const chartData = [
    {
      name: "Tela",
      population: 38,
      color: "#2563EB",
      legendFontColor: textMuted,
      legendFontSize: 12,
    },
    {
      name: "Bateria",
      population: 22,
      color: "#16A34A",
      legendFontColor: textMuted,
      legendFontSize: 12,
    },
    {
      name: "Conector",
      population: 18,
      color: "#F59E0B",
      legendFontColor: textMuted,
      legendFontSize: 12,
    },
    {
      name: "Acessórios",
      population: 22,
      color: "#0EA5E9",
      legendFontColor: textMuted,
      legendFontSize: 12,
    },
  ];

  return (
    <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-text-primary">
          Serviços por categoria
        </Text>
        <Text className="text-xs text-text-tertiary">Últimos 30 dias</Text>
      </View>
      <View className="mt-4 items-center">
        <PieChart
          data={chartData}
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
          {chartData.map((item) => (
            <Pressable
              key={item.name}
              className="flex-row items-center justify-between rounded-2xl bg-background-secondary px-4 py-3"
              onPress={() =>
                setPieTooltip({
                  title: item.name,
                  value: `${item.population}% dos serviços`,
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
                {item.population}%
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
  );
}
