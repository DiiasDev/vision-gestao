export type ServicesTypes = {
  nome_servico: string;
  categoria: string;
  preco: string;
  prazo: string;
  descricao: string;
  imagem: string;
  status: boolean;
};

export type ServiceRealizedItem = {
  product_id?: number | null;
  product_name?: string | null;
  quantity?: number | string | null;
  price?: number | string | null;
  cost?: number | string | null;
};

export type ServiceRealizedPayload = {
  client_id?: string | null;
  client_name?: string | null;
  client_contact?: string | null;
  service_id?: string | null;
  service_name?: string | null;
  equipment?: string | null;
  description?: string | null;
  service_date?: string | null;
  status?: string | null;
  value?: number | string | null;
  cost?: number | string | null;
  items?: ServiceRealizedItem[];
  notes?: string | null;
};
