import api from './client';

export interface CustomerResponse {
    id: number;
    name: string;
    phone: string;
    email?: string;
    description?: string;
    loyalty_points: string;
    created_at: string;
}

export interface CustomerCreate {
    name: string;
    phone: string;
    email?: string;
    description?: string;
}

export const searchCustomers = async (query: string): Promise<CustomerResponse[]> => {
    const { data } = await api.get<CustomerResponse[]>('/api/v1/customers/search', { params: { q: query } });
    return data;
};

export const createCustomer = async (customer: CustomerCreate): Promise<CustomerResponse> => {
    const { data } = await api.post<CustomerResponse>('/api/v1/customers/', customer);
    return data;
};

export const getCustomer = async (id: number): Promise<CustomerResponse> => {
    const { data } = await api.get<CustomerResponse>(`/api/v1/customers/${id}`);
    return data;
};
