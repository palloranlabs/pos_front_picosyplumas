import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { createProduct } from '../../api/products.api';
import { X } from 'lucide-react';

interface CreateProductModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({ onClose, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        barcode: '',
        image_url: '',
        base_price: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await createProduct({
                name: formData.name,
                description: formData.description || undefined,
                barcode: formData.barcode || undefined,
                image_url: formData.image_url || undefined,
                base_price: parseFloat(formData.base_price),
                is_active: true
            });
            onSuccess();
        } catch (err) {
            console.error(err);
            setError('Error al crear producto. Verifique los datos o si el código ya existe.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-900">Nuevo Producto</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <Input
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ej. Coca Cola 600ml"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
                        <Input
                            name="barcode"
                            value={formData.barcode}
                            onChange={handleChange}
                            placeholder="Escanee o escriba..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
                        <Input
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleChange}
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base *</label>
                        <Input
                            name="base_price"
                            type="number"
                            step="0.01"
                            required
                            value={formData.base_price}
                            onChange={handleChange}
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <Input
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Opcional"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="button" variant="secondary" onClick={onClose} className="mr-2">
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Guardar Producto
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
