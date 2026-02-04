export class ServicesModels {
  static tableName = "servicos";

  static columns = {
    nome_servico: "nome_servico",
    categoria: "categoria",
    preco: "preco",
    prazo: "prazo",
    descricao: "descricao",
    imagem: "imagem",
    status: "status",
  } as const;
}
