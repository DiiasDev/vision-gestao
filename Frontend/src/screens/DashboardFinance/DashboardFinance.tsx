import { useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import HomeComponent from "../../components/Home/HomeComponent";
import NewScreenComponent from "../../components/NewScreenComponent/NewScreenComponent";
import ProductsScreen from "../ProductsScreen/ProductsScreen";
import ProductForm from "../../components/ProductsComponents/ProductForm";

type TabKey = "dashboard" | "products" | "action" | "services" | "finance";

type DashboardFinanceProps = {
  userName?: string;
};

export default function DashboardFinance({ userName }: DashboardFinanceProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);

  const content = useMemo(() => {
    switch (activeTab) {
      case "dashboard":
        return <HomeComponent userName={userName} />;
      case "products":
        return <ProductsScreen />;
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
        onSelect={(key) => {
          if (key === "products") {
            setIsNewModalOpen(false);
            setIsProductFormOpen(true);
          }
        }}
      />
      <Modal
        transparent
        visible={isProductFormOpen}
        animationType="slide"
        onRequestClose={() => setIsProductFormOpen(false)}
      >
        <View className="flex-1 bg-background-primary">
          <View className="flex-row items-center justify-between px-6 pt-6">
            <Text className="text-lg font-semibold text-text-primary">
              Novo produto
            </Text>
            <Pressable
              onPress={() => setIsProductFormOpen(false)}
              className="rounded-full border border-divider px-3 py-1"
            >
              <Text className="text-sm text-text-secondary">Fechar</Text>
            </Pressable>
          </View>
          <ProductForm onBack={() => setIsProductFormOpen(false)} />
        </View>
      </Modal>
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
