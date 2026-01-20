import React, { useEffect, useState } from 'react';
import { getProducts, updateProduct, createProduct } from '../../api/products.api';
import type { Product } from '../../types/models.types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { formatCurrency } from '../../utils/currency';
import { Edit2, Plus, X } from 'lucide-react';
import { DECIMAL_REGEX } from '../../utils/validators';

export const ProductManager: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [password, setPassword] = useState(''); // Master Password
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const data = await getProducts(0, 500);
        setProducts(data);
    };

    const handleEdit = (p: Product) => {
        setEditingProduct(p);
        setName(p.name);
        setPrice(p.base_price);
        setPassword('');
        setError('');
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setName('');
        setPrice('');
        setPassword('');
        setError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!DECIMAL_REGEX.test(price)) {
            setError("Invalid price format");
            return;
        }

        setIsLoading(true);
        try {
            if (editingProduct) {
                // For update, we need master password check in frontend logic OR API might verify it.
                // API definition: updateProduct payload has master_password.
                // "Updating a product requires Master Password".
                if (!password) {
                    setError("Master Password is required for updates");
                    setIsLoading(false);
                    return;
                }
                await updateProduct(editingProduct.id, {
                    name,
                    base_price: price,
                    master_password: password
                });
            } else {
                // Create usually doesn't need master password based on manual logic ("Update: PUT ... Crucial: Updating requires Master Password"). 
                // Create: POST /products/. Manual doesn't explicitly say create needs it, but let's assume not given the text.
                await createProduct({
                    name,
                    base_price: price,
                    is_active: true
                });
            }
            setIsModalOpen(false);
            loadProducts();
        } catch (err) {
            console.error(err);
            setError("Operation failed. Check password or connection.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
                <Button onClick={handleCreate} variant="primary">
                    <Plus size={20} className="mr-2" /> Add Product
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map(p => (
                            <tr key={p.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(p.base_price)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(p)} className="text-brand-blue hover:text-brand-navy">
                                        <Edit2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Product Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <Input
                                label="Price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                placeholder="0.00"
                            />

                            {editingProduct && (
                                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                    <p className="text-xs text-yellow-800 mb-2 font-bold">Security Check Required</p>
                                    <Input
                                        label="Master Password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <div className="flex justify-end space-x-2 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" isLoading={isLoading}>Save</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
