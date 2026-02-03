import FormComponent, { Field } from "../components/FormComponent/FormComponent";

export const fieldsProduct: Field[] = [
  {
    fieldname: "nome",
    label: "Nome do produto",
    fieldtype: "text",
    required: true,
    placeholder: "Ex.: Cabo HDMI 2.1",
  },
  {
    fieldname: "categoria",
    label: "Categoria",
    fieldtype: "select",
    placeholder: "Selecione a categoria",
    options: [
      "acessorios|Acessórios",
      "pecas|Peças",
      "informatica|Informática",
      "servicos|Serviços",
    ],
  },
  {
    fieldname: "sku",
    label: "SKU / Código",
    fieldtype: "text",
    placeholder: "Ex.: PRD-001",
  },
  {
    fieldname: "preco_venda",
    label: "Preço de venda",
    fieldtype: "number",
    required: true,
    placeholder: "Ex.: 199.90",
  },
  {
    fieldname: "custo",
    label: "Custo",
    fieldtype: "number",
    placeholder: "Ex.: 120.00",
  },
  {
    fieldname: "estoque",
    label: "Quantidade em estoque",
    fieldtype: "number",
    placeholder: "Ex.: 10",
  },
  {
    fieldname: "unidade",
    label: "Unidade",
    fieldtype: "select",
    placeholder: "Selecione a unidade",
    options: ["un|Unidade", "cx|Caixa", "kg|Kg", "lt|Litro"],
  },
  {
    fieldname: "descricao",
    label: "Descrição",
    fieldtype: "textarea",
    placeholder: "Detalhes do produto",
  },
  {
    fieldname: "imagem",
    label: "Imagem do produto",
    fieldtype: "image",
  },
  {
    fieldname: "ativo",
    label: "Status",
    fieldtype: "checkbox",
    defaultValue: 1,
  },
];