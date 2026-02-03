import { View } from "react-native";
import FormComponent from "../FormComponent/FormComponent";
import { fieldsFinanceMoviment } from "../../Fields/FinanceMovimentForm";

type FinanceMovimentFormProps = {
  onBack?: () => void;
};

export default function FinanceMovimentForm({
  onBack,
}: FinanceMovimentFormProps) {
  return (
    <View className="flex-1">
      <FormComponent
        fields={fieldsFinanceMoviment}
        title="Cadastrar movimentação"
        subtitle="Informe os detalhes para registrar entradas ou saídas."
        onBack={onBack}
      />
    </View>
  );
}
