import api from './client';
import type { Product } from '../types/models.types';

export const getProducts = async (skip = 0, limit = 100): Promise<Product[]> => {
    const { data } = await api.get<Product[]>('/api/v1/products/', { params: { skip, limit } });
    return data;
};

export const createProduct = async (product: { name: string; description?: string; barcode?: string; base_price: number | string; is_active?: boolean }): Promise<Product> => {
    const { data } = await api.post<Product>('/api/v1/products/', product);
    return data;
};

export const updateProduct = async (id: number, product: Partial<Product> & { master_password?: string }): Promise<Product> => {
    const { data } = await api.put<Product>(`/api/v1/products/${id}`, product);
    return data;
};
