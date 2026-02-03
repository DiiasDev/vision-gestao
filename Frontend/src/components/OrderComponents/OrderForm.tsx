import { View } from "react-native";
import FormComponent from "../FormComponent/FormComponent";
import { fieldsOrder } from "../../Fields/OrderForm";

type OrderFormProps = {
  onBack?: () => void;
};

export default function OrderForm({ onBack }: OrderFormProps) {
  return (
    <View className="flex-1">
      <FormComponent
        fields={fieldsOrder}
        title="Cadastrar orçamento"
        subtitle="Registre os dados para gerar uma nova proposta."
        onBack={onBack}
      />
    </View>
  );
}
