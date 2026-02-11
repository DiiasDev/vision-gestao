import { type OrderPayload } from "../../types/Order/Order.types.js";
export declare class OrderService {
    createOrder(payload: OrderPayload): Promise<{
        success: boolean;
        message: string;
        order: any;
        items: {
            product_id: number | null;
            product_name: string | null;
            quantity: number;
            price: number;
            total: number;
        }[];
    } | {
        success: boolean;
        message: string;
        order?: never;
        items?: never;
    }>;
    getOrders(): Promise<{
        success: boolean;
        message: string;
        orders: any[];
    }>;
    updateOrder(id: string, payload: OrderPayload): Promise<{
        success: boolean;
        message: string;
        order?: never;
        items?: never;
    } | {
        success: boolean;
        message: string;
        order: any;
        items: {
            product_id: number | null;
            product_name: string | null;
            quantity: number;
            price: number;
            total: number;
        }[];
    }>;
    deleteOrder(id: string): Promise<{
        success: boolean;
        message: string;
        order?: never;
    } | {
        success: boolean;
        message: string;
        order: any;
    }>;
    convertToServiceRealized(id: string): Promise<{
        success: boolean;
        message: string;
        service_realized?: never;
    } | {
        success: boolean;
        message: string;
        service_realized: any;
    }>;
    exportOrderToWhatsapp(id: string): Promise<{
        success: boolean;
        message: any;
        message_id?: never;
    } | {
        success: boolean;
        message: string;
        message_id: any;
    }>;
}
//# sourceMappingURL=Order.services.d.ts.map