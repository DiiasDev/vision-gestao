import { useMemo } from "react";
import { Alert } from "react-native";
import FormComponent, { type Field } from "../FormComponent/FormComponent";
import { ProductsService, type Product } from "../../services/Products.services";

type FormEstoqueProps = {
  products: Product[];
  movementType: "entrada" | "saida";
  onBack: () => void;
  onSuccess?: (movement?: {
    product_id?: string;
    product_name?: string;
    quantity?: number;
    current_stock?: number;
    previous_stock?: number;
    movement_type?: "entrada" | "saida";
    description?: string | null;
  }) => void | Promise<void>;
};

const parseNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

export default function FormEstoque({
  products,
  movementType,
  onBack,
  onSuccess,
}: FormEstoqueProps) {
  const options = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    return safeProducts
      .slice()
      .sort((a, b) => String(a.nome ?? "").localeCompare(String(b.nome ?? "")))
      .map((product) => {
        const id = product.id !== undefined && product.id !== null
          ? String(product.id)
          : "";
        const nome = product.nome ?? "Produto";
        const sku = product.sku ?? "SKU n/d";
        const estoque = product.estoque ?? 0;
        return `${id}|${nome}|${sku} • Estoque: ${estoque}`;
      })
      .filter(Boolean);
  }, [products]);

  const fields = useMemo<Field[]>(
    () => [
      {
        fieldname: "product_id",
        label: "Produto",
        fieldtype: "select",
        required: true,
        section: "Dados da movimentação",
        placeholder: "Selecione o produto",
        options,
      },
      {
        fieldname: "quantity",
        label: "Quantidade",
        fieldtype: "number",
        required: true,
        section: "Dados da movimentação",
        placeholder: "Ex.: 5",
      },
      {
        fieldname: "notes",
        label: "Observação",
        fieldtype: "textarea",
        section: "Dados da movimentação",
        placeholder: "Motivo da movimentação (opcional)",
      },
    ],
    [options],
  );

  const title = movementType === "entrada"
    ? "Entrada de estoque"
    : "Saída de estoque";

  const subtitle = movementType === "entrada"
    ? "Adicione unidades ao estoque de um produto."
    : "Retire unidades do estoque de um produto.";

  return (
    <FormComponent
      fields={fields}
      title={title}
      subtitle={subtitle}
      submitButtonText="Registrar movimentação"
      initialData={{ product_id: "", quantity: "", notes: "" }}
      onBack={onBack}
      backButtonText="Cancelar"
      onSubmit={async (data) => {
        const productId = data.product_id ? String(data.product_id) : null;
        const quantity = parseNumber(data.quantity);
        const description =
          typeof data.notes === "string" && data.notes.trim()
            ? data.notes.trim()
            : null;

        if (!productId) {
          Alert.alert("Movimentação", "Selecione um produto.");
          return;
        }

        if (!quantity || quantity <= 0) {
          Alert.alert("Movimentação", "Informe uma quantidade maior que zero.");
          return;
        }

        const result = await ProductsService.moveStock({
          product_id: productId,
          quantity,
          movement_type: movementType,
          description,
        });

        if (!result?.success) {
          Alert.alert(
            "Movimentação",
            result?.message ?? "Não foi possível registrar a movimentação.",
          );
          return;
        }

        Alert.alert("Movimentação", "Movimentação registrada com sucesso.");
        onBack();
        await onSuccess?.({
          ...(result?.movement ?? {}),
          movement_type: movementType,
          description,
        });
      }}
    />
  );
}
