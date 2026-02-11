import { ServicesService } from "./../services/Services.services.js";
import { FinanceService } from "../Finance/Finance.services.js";
import { ProductsService } from "../products/products.service.js";
export declare class GraphicsServices {
    finance: FinanceService;
    services: ServicesService;
    products: ProductsService;
    private resolveRange;
    private parseDate;
    vendasMensais(monthsCount?: number, range?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{
        success: boolean;
        message: string;
        meses: {
            id: string;
            key: string;
            label: string;
            valor: number;
            year: number;
            month: number;
        }[];
        porMes: Record<string, {
            valor: number;
            label: string;
            year: number;
            month: number;
        }>;
    }>;
    valuesCards(range?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{
        success: boolean;
        data: {
            faturamento: number;
            custo: number;
            saldo: number;
            faturamentoPercent: number | null;
            custoPercent: number;
        };
        message?: never;
    } | {
        success: boolean;
        data: {
            faturamento: number;
            custo: number;
            saldo: number;
            faturamentoPercent: null;
            custoPercent: number;
        };
        message: string;
    }>;
    custoXlucro(range?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            totalValor: any;
            totalVenda: any;
            totalCusto: any;
            lucroTotal: number;
            media: number;
            qtdServicos: any;
            servicos: any[];
        };
    } | {
        success: boolean;
        message: string;
        data: {
            custo: number;
            lucro: number;
        };
    }>;
    statusOS(range?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            concluidas: number;
            emExecucao: number;
            agendadas: number;
        };
    } | {
        success: boolean;
        message: string;
        data: {};
    }>;
    servicosPorCategoria(range?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            total: number;
            categorias: {
                categoria: string;
                quantidade: number;
                percentual: number;
            }[];
            dias: number;
        };
    }>;
    estoqueCritico(): Promise<{
        success: boolean;
        message: string;
        products: {
            id: any;
            nome: any;
            estoque: any;
            unidade: any;
        }[];
        data?: never;
    } | {
        success: boolean;
        message: string;
        data: {};
        products?: never;
    } | undefined>;
    rankingProdutos(range?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            totalSaidas: number;
            produtos: {
                id: string;
                nome: string;
                quantidade: number;
            }[];
        };
    }>;
}
//# sourceMappingURL=Graphics.services.d.ts.map