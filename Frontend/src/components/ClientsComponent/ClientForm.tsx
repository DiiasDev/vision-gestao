import { View } from "react-native";
import FormComponent from "../FormComponent/FormComponent";
import { fieldsClient } from "../../Fields/ClientForm";

type ClientFormProps = {
  onBack?: () => void;
};

export default function ClientForm({ onBack }: ClientFormProps) {
  return (
    <View className="flex-1">
      <FormComponent
        fields={fieldsClient}
        title="Cadastrar cliente"
        subtitle="Cadastre os dados do cliente para histórico e cobranças."
        onBack={onBack}
      />
    </View>
  );
}
