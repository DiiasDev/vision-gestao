export class ProductsModel{
    static tableName = "produtos"; 

    static columns = {
        id: "id",
        codigo: "codigo",
        nome: "nome",
        categoria: "categoria",
        sku: "sku",
        preco_venda: "preco_venda",
        custo: "custo",
        estoque: "estoque",
        unidade: "unidade",
        descricao: "descricao",
        imagem: "imagem",
        ativo: "ativo",
        created_at: "created_at",
        update_at: "update_at"
    } as const
}