import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import HomeComponent from "../../components/Home/HomeComponent";
import NewScreenComponent from "../../components/NewScreenComponent/NewScreenComponent";

type TabKey = "dashboard" | "products" | "action" | "services" | "finance";

type DashboardFinanceProps = {
  userName?: string;
};

export default function DashboardFinance({ userName }: DashboardFinanceProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const content = useMemo(() => {
    switch (activeTab) {
      case "dashboard":
        return <HomeComponent userName={userName} />;
      case "products":
        return (
          <View className="flex-1 bg-background-primary px-6 pt-10">
            <Text className="text-2xl font-semibold text-text-primary">
              Produtos
            </Text>
            <Text className="mt-2 text-base text-text-secondary">
              Catálogo de acessórios, peças e estoque.
            </Text>
          </View>
        );
      case "services":
        return (
          <View className="flex-1 bg-background-primary px-6 pt-10">
            <Text className="text-2xl font-semibold text-text-primary">
              Serviços
            </Text>
            <Text className="mt-2 text-base text-text-secondary">
              Ordens de serviço, reparos e status de manutenção.
            </Text>
          </View>
        );
      case "finance":
        return (
          <View className="flex-1 bg-background-primary px-6 pt-10">
            <Text className="text-2xl font-semibold text-text-primary">
              Financeiro
            </Text>
            <Text className="mt-2 text-base text-text-secondary">
              Entradas, saídas, contas e relatórios.
            </Text>
          </View>
        );
      default:
        return <HomeComponent userName={userName} />;
    }
  }, [activeTab, userName]);

  return (
    <View className="flex-1 bg-background-primary">
      {content}
      <NewScreenComponent
        modalOnly
        isVisible={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />
      <BottomNavigation
        activeTab={activeTab}
        onChange={(tab) => {
          if (tab === "action") {
            setIsNewModalOpen(true);
            return;
          }
          setActiveTab(tab);
        }}
        onActionPress={() => setIsNewModalOpen(true)}
      />
    </View>
  );
}
