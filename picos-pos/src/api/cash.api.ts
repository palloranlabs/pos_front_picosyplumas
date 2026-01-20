import api from './client';

export const openSession = async (openingBalance: number): Promise<boolean> => {
    const { data } = await api.post<boolean>('/api/v1/cash/open', { opening_balance: openingBalance });
    return data;
};

export const closeSession = async (closingBalance: number): Promise<boolean> => {
    const { data } = await api.post<boolean>('/api/v1/cash/close', { closing_balance: closingBalance });
    return data;
};
