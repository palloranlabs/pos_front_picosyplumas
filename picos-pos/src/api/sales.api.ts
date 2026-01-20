import api from './client';
import type { Sale } from '../types/models.types';

interface CreateSaleRequest {
    items: { product_id: number; quantity: string; discount_percent: string | number }[];
    payment_method: 'cash' | 'card' | 'mixed';
    cash_received?: string;
    master_password?: string | null;
}

export const createSale = async (sale: CreateSaleRequest): Promise<Sale> => {
    const { data } = await api.post<Sale>('/api/v1/sales/', sale);
    return data;
};

export const getSaleByTicket = async (ticketNumber: string): Promise<Sale> => {
    const { data } = await api.get<Sale>(`/api/v1/sales/ticket/${ticketNumber}`);
    return data;
};

// Assuming refund request body structure, check openapi if exact
export const refundSale = async (ticketNumber: string, reason: string): Promise<Sale> => {
    const { data } = await api.post<Sale>(`/api/v1/sales/refund/${ticketNumber}`, { reason });
    return data;
};
