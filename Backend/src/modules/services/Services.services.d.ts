import { type ServicesTypes, type ServiceRealizedPayload } from "../../types/Services/Services.types.js";
export declare class ServicesService {
    newService(novo_servico: Partial<ServicesTypes>): Promise<{
        sucess: boolean;
        message: string;
        novo_servico: any;
        success?: never;
    } | {
        success: boolean;
        message: string;
        novo_servico: never[];
        sucess?: never;
    }>;
    updateService(id: string, servico: Partial<ServicesTypes>): Promise<{
        success: boolean;
        message: string;
        service?: never;
    } | {
        success: boolean;
        message: string;
        service: any;
    }>;
    deleteService(id: string): Promise<{
        success: boolean;
        message: string;
        service?: never;
    } | {
        success: boolean;
        message: string;
        service: any;
    }>;
    getServices(): Promise<{
        success: boolean;
        message: string;
        servicos: any[];
    }>;
    createServiceRealized(payload: ServiceRealizedPayload): Promise<{
        success: boolean;
        message: string;
        service_realized?: never;
        items?: never;
    } | {
        success: boolean;
        message: string;
        service_realized: any;
        items: {
            product_id: number | null;
            product_name: string | null;
            quantity: number;
            price: number;
            total: number;
            cost: number;
            total_cost: number;
        }[];
    }>;
    updateServiceRealized(id: string, payload: ServiceRealizedPayload): Promise<{
        success: boolean;
        message: string;
        service_realized?: never;
        items?: never;
    } | {
        success: boolean;
        message: string;
        service_realized: any;
        items: {
            product_id: number | null;
            product_name: string | null;
            quantity: number;
            price: number;
            total: number;
            cost: number;
            total_cost: number;
        }[];
    }>;
    deleteServiceRealized(id: string): Promise<{
        success: boolean;
        message: string;
        service_realized?: never;
    } | {
        success: boolean;
        message: string;
        service_realized: any;
    }>;
    getServicesRealized(): Promise<{
        success: boolean;
        message: string;
        services_realized: any[];
    }>;
    settleServiceRealized(id: string, payload?: {
        channel?: string | null;
        date?: string | null;
        notes?: string | null;
    }): Promise<{
        success: boolean;
        message: string;
        service_realized?: never;
        movement?: never;
        already_billed?: never;
    } | {
        success: boolean;
        message: string;
        service_realized: any;
        movement: any;
        already_billed: boolean;
    }>;
}
//# sourceMappingURL=Services.services.d.ts.map