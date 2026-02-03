import { Field } from "../components/FormComponent/FormComponent";

export const fieldsClient: Field[] = [
  {
    fieldname: "nome",
    label: "Nome completo",
    fieldtype: "text",
    required: true,
    placeholder: "Ex.: Maria Silva",
  },
  {
    fieldname: "tipo",
    label: "Tipo de cliente",
    fieldtype: "select",
    placeholder: "Selecione o tipo",
    options: ["pf|Pessoa Física", "pj|Pessoa Jurídica"],
  },
  {
    fieldname: "documento",
    label: "CPF/CNPJ",
    fieldtype: "text",
    placeholder: "Ex.: 123.456.789-00",
  },
  {
    fieldname: "email",
    label: "E-mail",
    fieldtype: "text",
    placeholder: "Ex.: cliente@empresa.com",
  },
  {
    fieldname: "telefone",
    label: "Telefone",
    fieldtype: "text",
    placeholder: "Ex.: (11) 99999-0000",
  },
  {
    fieldname: "cidade",
    label: "Cidade",
    fieldtype: "text",
    placeholder: "Ex.: São Paulo",
  },
  {
    fieldname: "endereco",
    label: "Endereço",
    fieldtype: "textarea",
    placeholder: "Rua, número, bairro",
  },
  {
    fieldname: "observacoes",
    label: "Observações",
    fieldtype: "textarea",
    placeholder: "Preferências ou notas internas",
  },
  {
    fieldname: "ativo",
    label: "Status",
    fieldtype: "checkbox",
    defaultValue: 1,
  },
];
