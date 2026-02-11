export type FinanceMovementStatus = "Pago" | "Pendente" | "Agendado";
export type FinanceMovementType = "in" | "out";
export type FinanceMovement = {
    id: string;
    title: string;
    category: string;
    date: string;
    value: number;
    status: FinanceMovementStatus;
    type: FinanceMovementType;
    channel?: "PIX" | "Cartao" | "Dinheiro" | "Boleto" | "Transferencia";
    notes?: string;
};
export type FinanceSummary = {
    id: string;
    label: string;
    value: number;
    meta?: string;
    tone?: "success" | "warning" | "error" | "info" | "default";
};
export type FinanceFilter = {
    range: "7d" | "15d" | "30d" | "90d" | "custom";
    status?: FinanceMovementStatus;
    category?: string;
    channel?: FinanceMovement["channel"];
    type?: FinanceMovementType;
    dateFrom?: string;
    dateTo?: string;
};
//# sourceMappingURL=FinanceTypes.types.d.ts.map