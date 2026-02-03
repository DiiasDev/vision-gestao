import { Field } from "../components/FormComponent/FormComponent";

export const fieldsOrder: Field[] = [
  {
    fieldname: "cliente_nome",
    label: "Nome do cliente",
    fieldtype: "text",
    required: true,
    placeholder: "Ex.: Maria Oliveira",
  },
  {
    fieldname: "cliente_contato",
    label: "Contato",
    fieldtype: "tel",
    placeholder: "Ex.: (11) 99999-0000",
  },
  {
    fieldname: "equipamento",
    label: "Equipamento",
    fieldtype: "text",
    placeholder: "Ex.: Notebook Dell Inspiron",
  },
  {
    fieldname: "problema",
    label: "Descrição do problema",
    fieldtype: "textarea",
    placeholder: "Explique o que precisa ser feito.",
  },
  {
    fieldname: "valor_estimado",
    label: "Valor estimado",
    fieldtype: "number",
    required: true,
    placeholder: "Ex.: 320.00",
  },
  {
    fieldname: "validade",
    label: "Validade",
    fieldtype: "text",
    placeholder: "Ex.: 10/03/2026",
  },
  {
    fieldname: "status",
    label: "Status",
    fieldtype: "select",
    placeholder: "Selecione o status",
    options: [
      "em_analise|Em análise",
      "aprovado|Aprovado",
      "recusado|Recusado",
    ],
  },
  {
    fieldname: "observacoes",
    label: "Observações",
    fieldtype: "textarea",
    placeholder: "Informações extras para o orçamento.",
  },
];
