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
    const [localMasterPassword, setLocalMasterPassword] = useState('');

    const { items, clearCart } = useCartStore();

    const change = Math.max(0, parseDecimal(cashReceived) - total);
    const needsCashInput = method === 'cash' || method === 'mixed';

    const hasDiscount = items.some(item => parseDecimal(item.discount_percent) > 0);

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            const payload = {
                items: items.map(i => ({
                    product_id: i.product.id,
                    quantity: parseDecimal(i.quantity),
                    discount_percent: parseDecimal(i.discount_percent)
                })),
                payment_method: method,
                cash_received: method === 'card' ? 0 : parseDecimal(cashReceived),
                master_password: hasDiscount ? localMasterPassword : null
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
                    <h2 className="text-2xl font-bold text-brand-green mb-4 print:hidden">¡Pago Exitoso!</h2>
                    <p className="print:hidden">Imprimiendo Ticket...</p>
                    <TicketTemplate sale={lastSale} />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-black">Cobrar</h2>

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
                        <p className="text-sm text-black">Total a Pagar</p>
                        <p className="text-3xl font-bold text-black">{formatCurrency(total)}</p>
                    </div>

                    {needsCashInput && (
                        <div>
                            <Input
                                label="Efectivo Recibido"
                                type="number"
                                step="0.01"
                                value={cashReceived}
                                onChange={(e) => setCashReceived(e.target.value)}
                                autoFocus
                                className="text-right text-xl"
                                required
                            />
                            <div className="mt-2 text-right">
                                {method === 'mixed' ? (
                                    <>
                                        <span className="text-sm text-black">Por cobrar en Tarjeta: </span>
                                        <span className="text-xl font-bold text-black">
                                            {formatCurrency(Math.max(0, total - parseDecimal(cashReceived)))}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-sm text-black">Cambio: </span>
                                        <span className="text-xl font-bold text-brand-green">{formatCurrency(change)}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {hasDiscount && (
                        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                            <Input
                                label="Contraseña Maestra (Autorización de Descuento)"
                                type="password"
                                value={localMasterPassword}
                                onChange={(e) => setLocalMasterPassword(e.target.value)}
                                className="bg-white"
                                required
                            />
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isProcessing}>Cancelar</Button>
                        <Button
                            type="submit"
                            variant="success"
                            size="lg"
                            className="w-full"
                            isLoading={isProcessing}
                            disabled={
                                (method === 'cash' && (parseDecimal(cashReceived) < total || !cashReceived)) ||
                                (method === 'mixed' && (!cashReceived || parseDecimal(cashReceived) <= 0))
                            }
                        >
                            Confirmar Pago
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


