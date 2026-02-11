export type OrderItemPayload = {
    product_id?: number | null;
    product_name?: string | null;
    quantity?: number | string | null;
    price?: number | string | null;
};
export type OrderPayload = {
    client_id?: string | null;
    client_name?: string | null;
    client_contact?: string | null;
    equipment?: string | null;
    problem?: string | null;
    service_id?: string | null;
    service_description?: string | null;
    service_value?: number | string | null;
    items?: OrderItemPayload[];
    estimated_value?: number | string | null;
    validity?: string | null;
    status?: string | null;
    notes?: string | null;
};
//# sourceMappingURL=Order.types.d.ts.map