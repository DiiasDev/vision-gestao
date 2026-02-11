import type { Request, Response } from "express";
export declare class OrderController {
    private service;
    createOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getOrders(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    convertToService(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    exportOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=Order.controller.d.ts.map