import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatCurrency, parseDecimal } from '../../utils/currency';
import { createSale } from '../../api/sales.api';
import { useCartStore } from '../../stores/useCartStore';
import { TicketTemplate } from './TicketTemplate';
import type { Sale } from '../../types/models.types';
import clsx from 'clsx';

interface Props {
    total: number;
    onClose: () => void;
}

export const PayModal: React.FC<Props> = ({ total, onClose }) => {
    const [method, setMethod] = useState<'cash' | 'card' | 'mixed'>('cash');
    const [cashReceived, setCashReceived] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastSale, setLastSale] = useState<Sale | null>(null);

    const { items, clearCart } = useCartStore();

    const change = Math.max(0, parseDecimal(cashReceived) - total);
    const needsCashInput = method === 'cash' || method === 'mixed';

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            const payload = {
                items: items.map(i => ({
                    product_id: i.product.id,
                    quantity: i.quantity,
                    discount_percent: i.discount_percent
                })),
                payment_method: method,
                cash_received: method === 'card' ? total.toString() : cashReceived,
            };

            const sale = await createSale(payload);
            setLastSale(sale);

            // Trigger Print
            setTimeout(() => {
                window.print();
                clearCart();
                onClose();
            }, 500);

        } catch (error) {
            console.error(error);
            alert("Payment Failed"); // Replace with toast
            setIsProcessing(false);
        }
    };

    if (lastSale) {
        return (
            <div className="fixed inset-0 bg-white z-[60] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-brand-green mb-4">Payment Successful!</h2>
                    <p>Printing Ticket...</p>
                    <TicketTemplate sale={lastSale} />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Checkout</h2>

                <div className="mb-6 flex space-x-2">
                    {(['cash', 'card', 'mixed'] as const).map(m => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMethod(m)}
                            className={clsx(
                                "flex-1 py-3 rounded-lg font-bold capitalize transition-colors border",
                                method === m
                                    ? "bg-brand-blue text-white border-brand-blue"
                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            )}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                <form onSubmit={handlePay} className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded text-right">
                        <p className="text-sm text-gray-500">Total to Pay</p>
                        <p className="text-3xl font-bold text-gray-900">{formatCurrency(total)}</p>
                    </div>

                    {needsCashInput && (
                        <div>
                            <Input
                                label="Cash Received"
                                type="number"
                                step="0.01"
                                value={cashReceived}
                                onChange={(e) => setCashReceived(e.target.value)}
                                autoFocus
                                className="text-right text-xl"
                                required
                            />
                            <div className="mt-2 text-right">
                                <span className="text-sm text-gray-500">Change: </span>
                                <span className="text-xl font-bold text-brand-green">{formatCurrency(change)}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isProcessing}>Cancel</Button>
                        <Button
                            type="submit"
                            variant="success"
                            size="lg"
                            className="w-full"
                            isLoading={isProcessing}
                            disabled={needsCashInput && parseDecimal(cashReceived) < total}
                        >
                            Confirm Payment
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


