import { Field } from "../components/FormComponent/FormComponent";

export const fieldsFinanceMoviment: Field[] = [
  {
    fieldname: "tipo",
    label: "Tipo de movimentação",
    fieldtype: "select",
    required: true,
    placeholder: "Selecione o tipo",
    options: ["entrada|Entrada", "saida|Saída"],
  },
  {
    fieldname: "categoria",
    label: "Categoria",
    fieldtype: "select",
    placeholder: "Selecione a categoria",
    options: [
      "venda|Venda",
      "servico|Serviço",
      "compra|Compra",
      "despesa_fixa|Despesa fixa",
      "imposto|Imposto",
      "outros|Outros",
    ],
  },
  {
    fieldname: "valor",
    label: "Valor",
    fieldtype: "number",
    required: true,
    placeholder: "Ex.: 280.00",
  },
  {
    fieldname: "data",
    label: "Data",
    fieldtype: "text",
    placeholder: "Ex.: 03/02/2026",
  },
  {
    fieldname: "descricao",
    label: "Descrição",
    fieldtype: "textarea",
    placeholder: "Detalhe a movimentação.",
  },
  {
    fieldname: "comprovante",
    label: "Comprovante",
    fieldtype: "image",
  },
  {
    fieldname: "confirmado",
    label: "Confirmado",
    fieldtype: "checkbox",
    defaultValue: 1,
  },
];
