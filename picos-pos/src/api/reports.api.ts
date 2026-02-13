import api from './client';

export interface TopProduct {
    name: string;
    total_sold: number;
    total_revenue: number;
}

export interface SalesSummary {
    total_sales: number;
    total_transactions: number;
    total_refunded: number;
    total_refund_count: number;
    total_cash: number;
    total_card: number;
    total_transfer: number;
    total_tax: number;
    total_service_revenue: number;
    top_products: TopProduct[];
    best_day: string | null;
    best_day_amount: number;
}

export interface UserSalesSummary {
    username: string;
    total_sales: number;
    total_transactions: number;
    total_refunds: number;
}

export const getSalesSummary = async (startDate: string, endDate: string): Promise<SalesSummary> => {
    const { data } = await api.get<SalesSummary>('/api/v1/reports/sales-summary', {
        params: { start_date: startDate, end_date: endDate }
    });
    return data;
};

export const getUserSalesHistory = async (username: string, startDate?: string, endDate?: string) => {
    const params: any = { username };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const { data } = await api.get('/api/v1/reports/user-history', { params });
    return data;
};

export const getUsersSummary = async (startDate: string, endDate: string): Promise<UserSalesSummary[]> => {
    const { data } = await api.get<UserSalesSummary[]>('/api/v1/reports/users-summary', {
        params: { start_date: startDate, end_date: endDate }
    });
    return data;
};
