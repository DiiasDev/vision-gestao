import { useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import HomeComponent from "../../components/Home/HomeComponent";
import NewScreenComponent, {
  NewActionKey,
} from "../../components/NewScreenComponent/NewScreenComponent";
import ProductsScreen from "../ProductsScreen/ProductsScreen";
import ProductForm from "../../components/ProductsComponents/ProductForm";
import ServicesForm from "../../components/ServicesComponent/ServicesForm";
import ListServices from "../../components/ServicesComponent/ListServices";
import ServicesRealizedForm from "../../components/ServicesComponent/ServicesRealizedForm";
import OrderForm from "../../components/OrderComponents/OrderForm";
import FinanceMovimentForm from "../../components/FinanceComponents/FinanceMovimentForm";
import ClientForm from "../../components/ClientsComponent/ClientForm";
import ClientScreen from "../ClientScreen/ClientScreen";

type TabKey =
  | "dashboard"
  | "products"
  | "action"
  | "services"
  | "finance"
  | "clients";

type DashboardFinanceProps = {
  userName?: string;
  onLogout?: () => void;
};

export default function DashboardFinance({
  userName,
  onLogout,
}: DashboardFinanceProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [activeNewForm, setActiveNewForm] = useState<NewActionKey | null>(
    null
  );

  const content = useMemo(() => {
    switch (activeTab) {
      case "dashboard":
        return <HomeComponent userName={userName} />;
      case "products":
        return <ProductsScreen />;
      case "clients":
        return (
          <ClientScreen onNewClient={() => setIsNewModalOpen(true)} />
        );
      case "services":
        return <ListServices />;
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
          setIsNewModalOpen(false);
          setActiveNewForm(key);
        }}
      />
      <Modal
        transparent
        visible={!!activeNewForm}
        animationType="slide"
        onRequestClose={() => setActiveNewForm(null)}
      >
        <View className="flex-1 bg-background-primary">
          <View className="flex-row items-center justify-between px-6 pt-6">
            <Text className="text-lg font-semibold text-text-primary">
              {activeNewForm === "products"
                ? "Novo produto"
                : activeNewForm === "services"
                  ? "Novo serviço"
                : activeNewForm === "services_realized"
                    ? "Serviço realizado"
                : activeNewForm === "budgets"
                      ? "Novo orçamento"
                      : activeNewForm === "clients"
                        ? "Novo cliente"
                        : "Nova movimentação"}
            </Text>
            <Pressable
              onPress={() => setActiveNewForm(null)}
              className="rounded-full border border-divider px-3 py-1"
            >
              <Text className="text-sm text-text-secondary">Fechar</Text>
            </Pressable>
          </View>
          {activeNewForm === "products" ? (
            <ProductForm onBack={() => setActiveNewForm(null)} />
          ) : null}
          {activeNewForm === "services" ? (
            <ServicesForm onBack={() => setActiveNewForm(null)} />
          ) : null}
          {activeNewForm === "services_realized" ? (
            <ServicesRealizedForm onBack={() => setActiveNewForm(null)} />
          ) : null}
          {activeNewForm === "budgets" ? (
            <OrderForm onBack={() => setActiveNewForm(null)} />
          ) : null}
          {activeNewForm === "transactions" ? (
            <FinanceMovimentForm onBack={() => setActiveNewForm(null)} />
          ) : null}
          {activeNewForm === "clients" ? (
            <ClientForm onBack={() => setActiveNewForm(null)} />
          ) : null}
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
        onLogout={onLogout}
      />
    </View>
  );
}
