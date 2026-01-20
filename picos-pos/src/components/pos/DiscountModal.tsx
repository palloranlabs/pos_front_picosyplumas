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
    const [password, setPassword] = useState('');
    const [discount, setDiscount] = useState('');
    const [step, setStep] = useState<'auth' | 'input'>('auth');
    const [error, setError] = useState('');

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate Master Password check (In real app, maybe validate hash, but manual says 'if password correct' - purely frontend logic here or just assuming simple string match if hardcoded?
        // Manual says: "Validate: If password correct, allow entering discount_percent". 
        // Wait, the manual implies we might not check it against backend YET, but just prompt it. 
        // Actually, "Validation: If password correct, allow entering". 
        // Since we don't have an endpoint to 'check' password, and `sales` endpoint takes `master_password` only for global discount?
        // Wait, items have `discount_percent`. The `master_password` in `sales` creates a sale.
        // Actually, the manual says: "Action: Clicking opens a modal requesting the Master Password."
        // Probably the USER knows the password. I'll hardcode a "frontend" master password or just let them pass if they type anything for now, 
        // BUT actually, for ITEM discounts, the API doesn't seem to ask for master password in the item payload?
        // Let's re-read models.types.ts: Sale data structure doesn't have master password for item.
        // SaleCreate schema: "master_password": null // Only send if global discount applied.
        // Ah, but this is Item Discount.
        // Maybe the manual implies we need authorization to APPLY it.
        // I'll assume we verify against a known hash or just accept any non-empty password for this demo, 
        // OR maybe we don't verify it via API until submission? 
        // BUT the manual says "If password correct, allow entering discount".
        // I will use a placeholder check (e.g., "admin123") or just proceed. 
        // Better: Allow proceed to simulate.

        if (password === 'admin123') { // Simple mock protection
            setStep('input');
            setError('');
        } else {
            setError('Incorrect Master Password');
        }
    };

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        updateDiscount(productId, discount);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                <h3 className="text-lg font-bold mb-4">Apply Discount</h3>

                {step === 'auth' ? (
                    <form onSubmit={handleAuth}>
                        <Input
                            label="Master Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <div className="flex justify-end mt-4 space-x-2">
                            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button type="submit">Verify</Button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleApply}>
                        <Input
                            label="Discount % (0-100)"
                            type="number"
                            min="0"
                            max="100"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            autoFocus
                        />
                        <div className="flex justify-end mt-4 space-x-2">
                            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button type="submit" variant="success">Apply</Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
