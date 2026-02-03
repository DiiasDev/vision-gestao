import { View } from "react-native";
import FormComponent from "../FormComponent/FormComponent";
import { fieldsServices } from "../../Fields/ServicesForm";

type ServicesFormProps = {
  onBack?: () => void;
};

export default function ServicesForm({ onBack }: ServicesFormProps) {
  return (
    <View className="flex-1">
      <FormComponent
        fields={fieldsServices}
        title="Cadastrar serviço"
        subtitle="Descreva a atividade e os detalhes do atendimento."
        onBack={onBack}
      />
    </View>
  );
}
