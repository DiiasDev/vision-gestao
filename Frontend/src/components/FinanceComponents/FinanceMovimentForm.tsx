import { View } from "react-native";
import FormComponent from "../FormComponent/FormComponent";
import { fieldsFinanceMoviment } from "../../Fields/FinanceMovimentForm";

type FinanceMovimentFormProps = {
  onBack?: () => void;
  initialData?: Record<string, any> | null;
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;
  submitButtonText?: string;
};

export default function FinanceMovimentForm({
  onBack,
  initialData = null,
  onSubmit,
  submitButtonText,
}: FinanceMovimentFormProps) {
  return (
    <View className="flex-1">
      <FormComponent
        fields={fieldsFinanceMoviment}
        title="Cadastrar movimentação"
        subtitle="Informe os detalhes para registrar entradas ou saídas."
        onBack={onBack}
        initialData={initialData}
        onSubmit={onSubmit}
        submitButtonText={submitButtonText}
      />
    </View>
  );
}
