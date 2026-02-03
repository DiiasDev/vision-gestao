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
}
