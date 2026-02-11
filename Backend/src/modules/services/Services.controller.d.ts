import type { Response, Request } from "express";
export declare class ServicesController {
    private service;
    newService(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getServices(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateService(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteService(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createServiceRealized(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getServicesRealized(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateServiceRealized(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteServiceRealized(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    settleServiceRealized(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=Services.controller.d.ts.map