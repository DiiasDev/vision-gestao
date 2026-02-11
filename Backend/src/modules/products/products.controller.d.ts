import type { Request, Response } from "express";
export declare class ProductsController {
    private product;
    newProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getProducts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    moveStock(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getStockMovements(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=products.controller.d.ts.map