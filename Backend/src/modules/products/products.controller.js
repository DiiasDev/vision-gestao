import { ProductsService } from "./products.service.js";
export class ProductsController {
    product = new ProductsService();
    async newProduct(req, res) {
        try {
            const produto = req.body ?? {};
            const result = await this.product.newProduct(produto);
            const statusCode = result.success
                ? 201
                : result.code === "23505"
                    ? 409
                    : 400;
            return res.status(statusCode).json(result);
        }
        catch (error) {
            console.log("Erro ao cadastrar produto: ", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao cadastrar produto",
            });
        }
    }
    async getProducts(req, res) {
        try {
            const data = await this.product.getProducts();
            const statusCode = data.success ? 200 : 400;
            return res.status(statusCode).json(data);
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Erro interno ao listar produto",
            });
        }
    }
    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const produto = req.body ?? {};
            const productId = Array.isArray(id) ? id[0] : id;
            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: "Id do produto é obrigatório",
                });
            }
            const result = await this.product.updateProduct(productId, produto);
            const statusCode = result.success
                ? 200
                : result.message === "Produto não encontrado"
                    ? 404
                    : 400;
            return res.status(statusCode).json(result);
        }
        catch (error) {
            console.log("Erro ao atualizar produto: ", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao atualizar produto",
            });
        }
    }
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const productId = Array.isArray(id) ? id[0] : id;
            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: "Id do produto é obrigatório",
                });
            }
            const result = await this.product.deleteProduct(productId);
            const statusCode = result.success
                ? 200
                : result.code === "23503"
                    ? 409
                    : result.message === "Produto não encontrado"
                        ? 404
                        : 400;
            return res.status(statusCode).json(result);
        }
        catch (error) {
            console.log("Erro ao excluir produto: ", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao excluir produto",
            });
        }
    }
    async moveStock(req, res) {
        try {
            const payload = req.body ?? {};
            const result = await this.product.moveStockByProduct(payload);
            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);
        }
        catch (error) {
            console.log("Erro ao movimentar estoque: ", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao movimentar estoque",
            });
        }
    }
    async getStockMovements(req, res) {
        try {
            const { product_id, limit } = req.query;
            const rawProductId = Array.isArray(product_id) ? product_id[0] : product_id;
            const rawLimit = Array.isArray(limit) ? limit[0] : limit;
            const productId = typeof rawProductId === "string" ? rawProductId : null;
            const safeLimit = typeof rawLimit === "string" ? rawLimit : null;
            const result = await this.product.getStockMovements({
                product_id: productId,
                limit: safeLimit,
            });
            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);
        }
        catch (error) {
            console.log("Erro ao listar movimentações de estoque: ", error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao listar movimentações de estoque",
            });
        }
    }
}
//# sourceMappingURL=products.controller.js.map