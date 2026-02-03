import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FormComponent from "../FormComponent/FormComponent";
import { fieldsProduct } from "../../Fields/ProductsForm";
import { ProductPayload, ProductsService } from "../../services/Products.services";

type ProductFormProps = {
  onBack?: () => void;
};

export default function ProductForm({ onBack }: ProductFormProps) {
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 5000);
    return () => clearTimeout(timer);
  }, [alert]);

  return (
    <View className="flex-1">
      <FormComponent
        fields={fieldsProduct}
        title="Cadastrar produto"
        subtitle="Preencha os dados para adicionar um novo item ao catálogo."
        onBack={onBack}
        onSubmit={async (data) => {
          const productPayload: ProductPayload = {
            codigo: data.codigo ?? data.sku,
            nome: data.nome,
            categoria: data.categoria,
            sku: data.sku,
            preco_venda: data.preco_venda,
            custo: data.custo,
            estoque: data.estoque,
            unidade: data.unidade,
            descricao: data.descricao,
            imagem: data.imagem,
            ativo: data.ativo,
          };
          const result = await ProductsService.createProduct(productPayload);
          if (result?.success) {
            setAlert({
              type: "success",
              title: "Produto cadastrado",
              message: "O produto foi salvo com sucesso.",
            });
          } else {
            setAlert({
              type: "error",
              title: "Erro ao cadastrar",
              message:
                result?.message ??
                "Não foi possível salvar o produto. Tente novamente.",
            });
          }
        }}
      />

      {alert ? (
        <View
          pointerEvents="box-none"
          className="absolute left-0 right-0 top-3 px-6"
        >
          <View
            className={`rounded-2xl border px-4 py-3 ${
              alert.type === "success"
                ? "border-emerald-200 bg-emerald-50"
                : "border-rose-200 bg-rose-50"
            }`}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-start gap-3 pr-6">
                <View
                  className={`mt-1 h-7 w-7 items-center justify-center rounded-full ${
                    alert.type === "success" ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                >
                  <Ionicons
                    name={alert.type === "success" ? "checkmark" : "alert"}
                    size={16}
                    color="#fff"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-text-primary">
                    {alert.title}
                  </Text>
                  <Text className="mt-1 text-sm text-text-secondary">
                    {alert.message}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setAlert(null)}
                hitSlop={8}
                className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full"
              >
                <Ionicons name="close" size={16} color="#6B7280" />
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
