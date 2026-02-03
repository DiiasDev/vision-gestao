import { Field } from "../components/FormComponent/FormComponent";

export const fieldsServices: Field[] = [
  {
    fieldname: "nome",
    label: "Nome do serviço",
    fieldtype: "text",
    required: true,
    placeholder: "Ex.: Troca de bateria",
  },
  {
    fieldname: "categoria",
    label: "Categoria",
    fieldtype: "select",
    placeholder: "Selecione a categoria",
    options: [
      "reparo|Reparo",
      "manutencao|Manutenção",
      "instalacao|Instalação",
      "diagnostico|Diagnóstico",
      "outros|Outros",
    ],
  },
  {
    fieldname: "preco",
    label: "Preço",
    fieldtype: "number",
    required: true,
    placeholder: "Ex.: 150.00",
  },
  {
    fieldname: "prazo",
    label: "Prazo estimado",
    fieldtype: "text",
    placeholder: "Ex.: 3 dias úteis",
  },
  {
    fieldname: "descricao",
    label: "Descrição",
    fieldtype: "textarea",
    placeholder: "Detalhes do serviço e observações.",
  },
  {
    fieldname: "imagem",
    label: "Imagem do serviço",
    fieldtype: "image",
  },
  {
    fieldname: "ativo",
    label: "Status",
    fieldtype: "checkbox",
    defaultValue: 1,
  },
];
