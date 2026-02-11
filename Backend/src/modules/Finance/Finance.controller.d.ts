import type { Request, Response } from "express";
export declare class FinanceController {
    private finance;
    createMovement(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listMovements(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateMovement(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteMovement(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=Finance.controller.d.ts.map