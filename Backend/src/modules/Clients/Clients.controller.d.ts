import type { Request, Response } from "express";
export declare class ClientsController {
    private client;
    newClient(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getClientes(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateClient(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteClient(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=Clients.controller.d.ts.map