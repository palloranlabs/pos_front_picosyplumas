import api from './client';
import type { CashSessionCloseResponse } from '../types/models.types';

export const openSession = async (openingBalance: number): Promise<boolean> => {
    const { data } = await api.post<boolean>('/api/v1/cash/open', { opening_balance: openingBalance });
    return data;
};

export const closeSession = async (closingBalance: number): Promise<CashSessionCloseResponse> => {
    const { data } = await api.post<CashSessionCloseResponse>('/api/v1/cash/close', { closing_balance: closingBalance });
    return data;
};
