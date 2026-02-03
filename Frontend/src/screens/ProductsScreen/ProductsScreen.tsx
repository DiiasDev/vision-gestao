import ProductForm from "../../components/ProductsComponents/ProductForm";

type ProductsScreenProps = {
  onBack?: () => void;
};

export default function ProductsScreen({ onBack }: ProductsScreenProps) {
  return <ProductForm onBack={onBack} />;
}
