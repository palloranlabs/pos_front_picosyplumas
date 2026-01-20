import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input'; // Assuming Input exists
import { useCartStore } from '../../stores/useCartStore';

interface Props {
    productId: number;
    onClose: () => void;
}

export const DiscountModal: React.FC<Props> = ({ productId, onClose }) => {
    const updateDiscount = useCartStore(state => state.updateDiscount);
    const [discount, setDiscount] = useState('');

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        updateDiscount(productId, discount);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                <h3 className="text-lg font-bold mb-4">Aplicar Descuento</h3>

                <form onSubmit={handleApply}>
                    <Input
                        label="% Descuento (0-100)"
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        autoFocus
                    />
                    <div className="flex justify-end mt-4 space-x-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" variant="success">Aplicar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
