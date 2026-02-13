import api from './client';
import type { Sale } from '../types/models.types';

export interface CreateSaleRequest {
    items?: Array<{
        product_id: number;
        quantity: number;
        discount_percent: number;
    }>;
    service_items?: Array<{
        name: string;
        price: number;
        description?: string;
        aplica_iva: boolean;
    }>;
    payment_method: 'cash' | 'card' | 'transfer' | 'mixed';
    cash_received: number;
    card_amount: number;
    transfer_amount: number;
    master_password?: string | null;
    customer_id?: number | null;
}

export const createSale = async (payload: CreateSaleRequest): Promise<Sale> => {
    const { data } = await api.post<Sale>('/api/v1/sales/', payload);
    return data;
};

export const searchSales = async (query: string): Promise<Sale[]> => {
    const { data } = await api.get<Sale[]>('/api/v1/sales/search', { params: { q: query } });
    return data;
};

export const getSaleByTicket = async (ticketNumber: string): Promise<Sale> => {
    const { data } = await api.get<Sale>(`/api/v1/sales/ticket/${ticketNumber}`);
    return data;
};

export const refundSale = async (ticketNumber: string, masterPassword: string, refundMethod: string): Promise<Sale> => {
    const { data } = await api.post<Sale>(`/api/v1/sales/refund/${ticketNumber}`, {
        master_password: masterPassword,
        refund_method: refundMethod
    });
    return data;
};
