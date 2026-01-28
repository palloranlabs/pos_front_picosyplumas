import React, { useEffect, useState } from 'react';
import { getProducts } from '../../api/products.api';
import type { Product } from '../../types/models.types';
import { useCartStore } from '../../stores/useCartStore';
import { formatCurrency } from '../../utils/currency';
import { CreateProductModal } from './CreateProductModal';
import { Search, Plus } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import clsx from 'clsx';

export const ProductGrid: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        loadProducts();
    }, []);

    // ... (filtering and keydown logic same as before)
    useEffect(() => {
        if (!searchTerm) {
            setFilteredProducts(products);
        } else {
            const lower = searchTerm.toLowerCase();
            setFilteredProducts(products.filter(p =>
                p.name.toLowerCase().includes(lower) ||
                (p.barcode && p.barcode.toLowerCase().includes(lower))
            ));
        }
    }, [searchTerm, products]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (filteredProducts.length === 1) {
                addItem(filteredProducts[0]);
                setSearchTerm('');
            } else if (filteredProducts.length > 1) {
                const exactBarcodeMatch = filteredProducts.find(p => p.barcode?.toLowerCase() === searchTerm.toLowerCase());
                if (exactBarcodeMatch) {
                    addItem(exactBarcodeMatch);
                    setSearchTerm('');
                }
            }
        }
    };

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const data = await getProducts(0, 500);
            setProducts(data);
            setFilteredProducts(data);
        } catch (e) {
            console.error("Failed to load products");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-4 flex gap-2">
                <div className="flex-1">
                    <Input
                        placeholder="Buscar (Nombre o Código)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        icon={<Search size={18} />}
                        className="border-brand-blue"
                        autoFocus
                    />
                </div>
                <Button onClick={() => setShowCreateModal(true)} variant="secondary" size="md">
                    <Plus size={20} />
                </Button>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">Loading...</div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4 content-start">
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            onClick={() => addItem(product)}
                            className={clsx(
                                "bg-white p-4 rounded-lg shadow cursor-pointer transition-transform hover:scale-105 active:scale-95 border border-transparent hover:border-brand-blue",
                                !product.is_active && "opacity-50 pointer-events-none"
                            )}
                        >
                            <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">{product.name}</h3>
                            <div className="flex justify-between items-center">
                                <p className="text-brand-blue font-bold">{formatCurrency(product.base_price)}</p>
                                {product.barcode && <span className="text-xs text-gray-400 font-mono">{product.barcode}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <CreateProductModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        loadProducts();
                    }}
                />
            )}
        </div>
    );
};
