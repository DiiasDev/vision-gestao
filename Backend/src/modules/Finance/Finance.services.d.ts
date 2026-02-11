type FinanceMovementPayload = {
    title?: string | null;
    category?: string | null;
    date?: string | null;
    value?: number | string | null;
    status?: string | null;
    type?: string | null;
    channel?: string | null;
    notes?: string | null;
    service_realized_id?: string | null;
};
export declare class FinanceService {
    createMovement(payload: FinanceMovementPayload): Promise<{
        success: boolean;
        message: string;
        movement?: never;
    } | {
        success: boolean;
        message: string;
        movement: any;
    }>;
    listMovements(filters?: {
        type?: string;
        status?: string;
        category?: string;
        channel?: string;
        dateFrom?: string;
        dateTo?: string;
        serviceRealizedId?: string;
    }): Promise<{
        success: boolean;
        message: string;
        movements: any[];
    }>;
    updateMovement(id: string, payload: Partial<FinanceMovementPayload>): Promise<{
        success: boolean;
        message: string;
        movement?: never;
    } | {
        success: boolean;
        message: string;
        movement: any;
    }>;
    deleteMovement(id: string): Promise<{
        success: boolean;
        message: string;
        movement?: never;
    } | {
        success: boolean;
        message: string;
        movement: any;
    }>;
}
export {};
//# sourceMappingURL=Finance.services.d.ts.map