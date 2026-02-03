import type { Request, Response } from "express";
import { ProductsService } from "./products.service.js";

export class ProductsController {
  private product = new ProductsService();

  public async newProduct(req: Request, res: Response) {
    try {
      const produto = req.body ?? {};

      const result = await this.product.newProduct(produto);
      const statusCode = result.success
        ? 201
        : result.code === "23505"
          ? 409
          : 400;

      return res.status(statusCode).json(result);
    } catch (error: any) {
      console.log("Erro ao cadastrar produto: ", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao cadastrar produto",
      });
    }
  }

  public async getProducts(req: Request, res: Response) {
    try {
      const data = await this.product.getProducts();
      const statusCode = data.success ? 200 : 400;
      return res.status(statusCode).json(data);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Erro interno ao listar produto",
      });
    }
  }

  public async updateProduct(req: Request, res: Response) {
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
    } catch (error: any) {
      console.log("Erro ao atualizar produto: ", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao atualizar produto",
      });
    }
  }

  public async deleteProduct(req: Request, res: Response) {
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
        : result.message === "Produto não encontrado"
          ? 404
          : 400;

      return res.status(statusCode).json(result);
    } catch (error: any) {
      console.log("Erro ao excluir produto: ", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao excluir produto",
      });
    }
  }
}
