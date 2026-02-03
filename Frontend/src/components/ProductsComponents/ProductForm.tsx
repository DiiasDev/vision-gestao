import FormComponent from "../FormComponent/FormComponent";
import { fieldsProduct } from "../../Fields/ProductsForm";

type ProductFormProps = {
  onBack?: () => void;
};

export default function ProductForm({ onBack }: ProductFormProps) {
  return (
    <FormComponent
      fields={fieldsProduct}
      title="Cadastrar produto"
      subtitle="Preencha os dados para adicionar um novo item ao catálogo."
      onBack={onBack}
      onSubmit={(data) => {
        console.log("Produto enviado:", data);
      }}
    />
  );
}
