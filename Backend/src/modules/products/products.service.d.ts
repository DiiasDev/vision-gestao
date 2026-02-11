import { type ProductsTypes } from "../../types/Products/Products.types.js";
type StockMovementItem = {
    product_id?: string | number | null;
    product_name?: string | null;
    quantity?: number | string | null;
    description?: string | null;
};
type QueryRunner = {
    query: (text: string, params?: any[]) => Promise<any>;
};
export declare class ProductsService {
    newProduct(produto: Partial<ProductsTypes>): Promise<{
        success: boolean;
        message: string;
        product?: never;
        error?: never;
        code?: never;
        constraint?: never;
    } | {
        success: boolean;
        message: string;
        product: any;
        error?: never;
        code?: never;
        constraint?: never;
    } | {
        success: boolean;
        message: string;
        error: any;
        code: any;
        constraint: any;
        product?: never;
    }>;
    getProducts(): Promise<{
        success: boolean;
        message: string;
        products: any[];
    } | {
        success: boolean;
        message: string;
        products?: never;
    }>;
    updateProduct(id: string, produto: Partial<ProductsTypes>): Promise<{
        success: boolean;
        message: string;
        product?: never;
        error?: never;
        code?: never;
        constraint?: never;
    } | {
        success: boolean;
        message: string;
        product: any;
        error?: never;
        code?: never;
        constraint?: never;
    } | {
        success: boolean;
        message: string;
        error: any;
        code: any;
        constraint: any;
        product?: never;
    }>;
    deleteProduct(id: string): Promise<{
        success: boolean;
        message: string;
        product?: never;
        deletedMovements?: never;
        code?: never;
        constraint?: never;
        error?: never;
    } | {
        success: boolean;
        message: string;
        product: any;
        deletedMovements: number;
        code?: never;
        constraint?: never;
        error?: never;
    } | {
        success: boolean;
        message: string;
        code: any;
        constraint: any;
        product?: never;
        deletedMovements?: never;
        error?: never;
    } | {
        success: boolean;
        message: string;
        error: any;
        code: any;
        constraint: any;
        product?: never;
        deletedMovements?: never;
    }>;
    movimentEstoque(params: {
        items?: StockMovementItem[];
        movementType?: "saida" | "entrada";
        transactionClient?: QueryRunner;
        origin?: "manual" | "servico" | "orcamento" | "ajuste_sistema";
        referenceId?: string | number | null;
        createdBy?: string | null;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            product_id: string;
            product_name: string;
            previous_stock: number;
            quantity: number;
            current_stock: number;
        }[];
    }>;
    moveStockByProduct(payload: {
        product_id?: string | number | null;
        quantity?: number | string | null;
        movement_type?: "entrada" | "saida" | string | null;
        description?: string | null;
        created_by?: string | null;
    }): Promise<{
        success: boolean;
        message: string;
        movement?: never;
    } | {
        success: boolean;
        message: string;
        movement: {
            description: string | null;
            product_id?: string;
            product_name?: string;
            previous_stock?: number;
            quantity?: number;
            current_stock?: number;
        };
    }>;
    getStockMovements(params?: {
        product_id?: string | number | null;
        limit?: string | number | null;
    }): Promise<{
        success: boolean;
        message: string;
        movements: any[];
    }>;
}
export {};
//# sourceMappingURL=products.service.d.ts.map