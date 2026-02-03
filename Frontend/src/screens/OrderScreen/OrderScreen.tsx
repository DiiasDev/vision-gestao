import { View } from "react-native";
import OrderForm from "../../components/OrderComponents/OrderForm";

export default function OrderScreen() {
  return (
    <View className="flex-1 bg-background-primary">
      <OrderForm />
    </View>
  );
}
