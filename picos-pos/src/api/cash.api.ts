import api from './client';
import type { CashSessionCloseResponse, CashMovementResponse } from '../types/models.types';

export const openSession = async (openingBalance: number): Promise<boolean> => {
    const { data } = await api.post<boolean>('/api/v1/cash/open', { opening_balance: openingBalance });
    return data;
};

export const closeSession = async (closingBalance: number, masterPassword?: string): Promise<CashSessionCloseResponse> => {
    const body: any = { closing_balance: closingBalance };
    if (masterPassword) {
        body.master_password = masterPassword;
    }
    const { data } = await api.post<CashSessionCloseResponse>('/api/v1/cash/close', body);
    return data;
};

export const createCashMovement = async (
    movementType: 'income' | 'expense',
    amount: number,
    description: string
): Promise<CashMovementResponse> => {
    const { data } = await api.post<CashMovementResponse>('/api/v1/cash/movement', {
        movement_type: movementType,
        amount,
        description
    });
    return data;
};
