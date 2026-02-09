import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useTheme } from "../../../contexts/ThemeContext";

export type DateRangePreset = "1m" | "3m" | "6m" | "1y" | "custom";

export type DateRangeValue = {
  preset: DateRangePreset;
  startDate: Date;
  endDate: Date;
};

type DateFilterProps = {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const buildPresetRange = (preset: DateRangePreset) => {
  const end = new Date();
  const start = new Date(end);
  if (preset === "1m") start.setMonth(start.getMonth() - 1);
  if (preset === "3m") start.setMonth(start.getMonth() - 3);
  if (preset === "6m") start.setMonth(start.getMonth() - 6);
  if (preset === "1y") start.setFullYear(start.getFullYear() - 1);
  return {
    preset,
    startDate: startOfDay(start),
    endDate: startOfDay(end),
  };
};

const formatRangeLabel = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export function DateFilter({ value, onChange }: DateFilterProps) {
  const { theme } = useTheme();
  const presets = [
    { label: "1 mês", value: "1m" as const },
    { label: "3 meses", value: "3m" as const },
    { label: "6 meses", value: "6m" as const },
    { label: "1 ano", value: "1y" as const },
    { label: "Personalizado", value: "custom" as const },
  ];

  const markedDates = useMemo(() => {
    const start = startOfDay(value.startDate);
    const end = startOfDay(value.endDate);
    const startKey = toDateKey(start);
    const endKey = toDateKey(end);
    if (startKey === endKey) {
      return {
        [startKey]: {
          startingDay: true,
          endingDay: true,
          color: "#2563EB",
          textColor: "#FFFFFF",
        },
      };
    }

    const marks: Record<string, any> = {
      [startKey]: {
        startingDay: true,
        color: "#2563EB",
        textColor: "#FFFFFF",
      },
      [endKey]: {
        endingDay: true,
        color: "#2563EB",
        textColor: "#FFFFFF",
      },
    };

    const cursor = new Date(start);
    cursor.setDate(cursor.getDate() + 1);
    while (cursor < end) {
      const key = toDateKey(cursor);
      marks[key] = {
        color: "rgba(37, 99, 235, 0.2)",
        textColor: theme === "dark" ? "#E2E8F0" : "#0F172A",
      };
      cursor.setDate(cursor.getDate() + 1);
    }
    return marks;
  }, [theme, value.endDate, value.startDate]);

  const handlePresetPress = (preset: DateRangePreset) => {
    if (preset === "custom") {
      onChange({
        preset,
        startDate: startOfDay(value.startDate),
        endDate: startOfDay(value.endDate),
      });
      return;
    }
    onChange(buildPresetRange(preset));
  };

  const handleDayPress = (day: DateData) => {
    const selected = new Date(day.year, day.month - 1, day.day);
    const currentStart = startOfDay(value.startDate);
    const currentEnd = startOfDay(value.endDate);

    let start = currentStart;
    let end = currentEnd;

    const hasRange =
      value.preset === "custom" && currentStart.getTime() !== currentEnd.getTime();

    if (value.preset !== "custom" || hasRange) {
      start = selected;
      end = selected;
    } else if (selected < currentStart) {
      start = selected;
      end = currentStart;
    } else {
      start = currentStart;
      end = selected;
    }

    onChange({
      preset: "custom",
      startDate: startOfDay(start),
      endDate: startOfDay(end),
    });
  };

  return (
    <View className="mb-6 rounded-[24px] bg-card-background p-5 border border-divider shadow-lg">
      <Text className="text-xs uppercase tracking-widest text-text-secondary">
        Período
      </Text>
      <Text className="mt-2 text-base font-semibold text-text-primary">
        {formatRangeLabel(value.startDate)} - {formatRangeLabel(value.endDate)}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4"
        contentContainerStyle={{ gap: 8 }}
      >
        {presets.map((item) => {
          const isActive = value.preset === item.value;
          return (
            <Pressable
              key={item.value}
              onPress={() => handlePresetPress(item.value)}
              className={`rounded-full border px-4 py-2 ${
                isActive
                  ? "bg-state-info/20 border-state-info/30"
                  : "bg-card-background border-divider"
              }`}
            >
              <Text
                className={`text-xs ${
                  isActive ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {value.preset === "custom" ? (
        <View className="mt-4 overflow-hidden rounded-2xl border border-divider bg-background-secondary">
          <Calendar
            markingType="period"
            markedDates={markedDates}
            onDayPress={handleDayPress}
            theme={{
              backgroundColor: "transparent",
              calendarBackground: "transparent",
              textSectionTitleColor: theme === "dark" ? "#94A3B8" : "#64748B",
              selectedDayBackgroundColor: "#2563EB",
              selectedDayTextColor: "#FFFFFF",
              todayTextColor: "#2563EB",
              dayTextColor: theme === "dark" ? "#E2E8F0" : "#0F172A",
              textDisabledColor: theme === "dark" ? "#475569" : "#CBD5F1",
              arrowColor: "#2563EB",
              monthTextColor: theme === "dark" ? "#E2E8F0" : "#0F172A",
              textMonthFontWeight: "600",
              textDayFontSize: 12,
              textMonthFontSize: 14,
              textDayHeaderFontSize: 12,
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
