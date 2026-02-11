import { type clientsTypes } from "../../types/Clients/ClientsTypes.js";
export declare class ClientsService {
    newClient(clientes: Partial<clientsTypes>): Promise<{
        success: boolean;
        message: string;
        novo_cliente: any;
    }>;
    getClients(): Promise<{
        success: boolean;
        message: string;
        clientes: any[];
    } | {
        success: boolean;
        message: string;
        clientes?: never;
    }>;
    updateClient(id: string, clientes: Partial<clientsTypes>): Promise<{
        success: boolean;
        message: string;
        cliente?: never;
    } | {
        success: boolean;
        message: string;
        cliente: any;
    }>;
    deleteClient(id: string): Promise<{
        success: boolean;
        message: string;
        cliente?: never;
    } | {
        success: boolean;
        message: string;
        cliente: any;
    }>;
}
//# sourceMappingURL=Clients.service.d.ts.map