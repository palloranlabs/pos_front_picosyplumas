import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatCurrency, parseDecimal } from '../../utils/currency';
import { createSale } from '../../api/sales.api';
import { searchCustomers, type CustomerResponse } from '../../api/customers.api';
import { useCartStore } from '../../stores/useCartStore';
import { TicketTemplate } from './TicketTemplate';
import type { Sale } from '../../types/models.types';
import clsx from 'clsx';
import { User, X, Gift, Star } from 'lucide-react';

interface Props {
    total: number;
    onClose: () => void;
}

export const PayModal: React.FC<Props> = ({ total, onClose }) => {
    const [method, setMethod] = useState<'cash' | 'card' | 'transfer' | 'mixed'>('cash');
    const [cashReceived, setCashReceived] = useState('0');
    const [cardAmount, setCardAmount] = useState('0');
    const [transferAmount, setTransferAmount] = useState('0');

    const [isProcessing, setIsProcessing] = useState(false);
    const [lastSale, setLastSale] = useState<Sale | null>(null);
    const [localMasterPassword, setLocalMasterPassword] = useState('');

    // Customer loyalty
    const [acumulaPuntos, setAcumulaPuntos] = useState(false);
    const [usarPuntos, setUsarPuntos] = useState(false);
    const [customerQuery, setCustomerQuery] = useState('');
    const [customerResults, setCustomerResults] = useState<CustomerResponse[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null);
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

    const { items, clearCart } = useCartStore();

    const cashVal = parseDecimal(cashReceived);
    const cardVal = parseDecimal(cardAmount);
    const transferVal = parseDecimal(transferAmount);

    // Calculate loyalty points coverage
    const customerPoints = selectedCustomer ? parseDecimal(selectedCustomer.loyalty_points) : 0;
    const pointsToUse = usarPuntos ? Math.min(customerPoints, total) : 0;
    const effectiveTotal = total - pointsToUse;

    let totalPaid = 0;
    if (effectiveTotal <= 0) totalPaid = effectiveTotal; // fully covered by points
    else if (method === 'cash') totalPaid = cashVal;
    else if (method === 'card') totalPaid = effectiveTotal;
    else if (method === 'transfer') totalPaid = effectiveTotal;
    else if (method === 'mixed') totalPaid = cashVal + cardVal + transferVal;

    const change = effectiveTotal <= 0 ? 0 : Math.max(0, totalPaid - effectiveTotal);
    const remaining = effectiveTotal <= 0 ? 0 : Math.max(0, effectiveTotal - totalPaid);
    const isSufficient = effectiveTotal <= 0 || totalPaid >= effectiveTotal - 0.01;
    const needsCashInput = (method === 'cash' || method === 'mixed') && effectiveTotal > 0;
    const needsMixedInputs = method === 'mixed' && effectiveTotal > 0;
    const hasDiscount = items.some(item => parseDecimal(item.discount_percent) > 0);
    const needsMasterPassword = hasDiscount || usarPuntos;

    // Search customers with debounce
    useEffect(() => {
        if (customerQuery.length < 2) {
            setCustomerResults([]);
            return;
        }
        const timeout = setTimeout(async () => {
            setIsSearchingCustomer(true);
            try {
                const results = await searchCustomers(customerQuery);
                setCustomerResults(results);
            } catch (e) {
                // ignore
            } finally {
                setIsSearchingCustomer(false);
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [customerQuery]);

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isProcessing) return;

        if (!isSufficient) {
            alert("Monto insuficiente");
            return;
        }

        if ((acumulaPuntos || usarPuntos) && !selectedCustomer) {
            alert("Seleccione un cliente");
            return;
        }

        if (usarPuntos && !localMasterPassword) {
            alert("Master Password requerida para usar puntos");
            return;
        }

        setIsProcessing(true);

        try {
            let finalCash = 0;
            let finalCard = 0;
            let finalTransfer = 0;

            if (effectiveTotal <= 0) {
                // Fully covered by points, no payment needed
            } else if (method === 'cash') {
                finalCash = cashVal;
            } else if (method === 'card') {
                finalCard = effectiveTotal;
            } else if (method === 'transfer') {
                finalTransfer = effectiveTotal;
            } else if (method === 'mixed') {
                finalCash = cashVal;
                finalCard = cardVal;
                finalTransfer = transferVal;
            }

            const payload = {
                items: items.map(i => ({
                    product_id: i.product.id,
                    quantity: parseDecimal(i.quantity),
                    discount_percent: parseDecimal(i.discount_percent)
                })),
                payment_method: method,
                cash_received: finalCash,
                card_amount: finalCard,
                transfer_amount: finalTransfer,
                master_password: needsMasterPassword ? localMasterPassword : null,
                customer_id: selectedCustomer?.id || null,
                use_loyalty_points: usarPuntos,
            };

            const sale = await createSale(payload);
            setLastSale(sale);

            setTimeout(() => {
                window.print();
                clearCart();
                onClose();
            }, 500);

        } catch (error) {
            console.error(error);
            alert("Error al procesar el pago. Verifique los montos.");
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

    const clearCustomer = () => {
        setSelectedCustomer(null);
        setCustomerQuery('');
        setCustomerResults([]);
        setUsarPuntos(false);
        setAcumulaPuntos(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[600px] shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-black">Cobrar</h2>

                {/* Customer search & loyalty section */}
                <div className="mb-4 p-3 border rounded-lg bg-gray-50">
                    {selectedCustomer ? (
                        <>
                            <div className="flex items-center justify-between bg-green-50 border border-green-200 p-2 rounded">
                                <div>
                                    <p className="font-bold text-sm text-green-800">{selectedCustomer.name}</p>
                                    <p className="text-xs text-green-600">{selectedCustomer.phone} • {parseDecimal(selectedCustomer.loyalty_points).toFixed(2)} pts disponibles</p>
                                </div>
                                <button onClick={clearCustomer} className="text-red-400 hover:text-red-600">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Toggle buttons for accumulate vs use */}
                            <div className="mt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAcumulaPuntos(!acumulaPuntos);
                                        if (!acumulaPuntos) setUsarPuntos(false);
                                    }}
                                    className={clsx(
                                        "flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1 border transition-colors",
                                        acumulaPuntos
                                            ? "bg-blue-500 text-white border-blue-500"
                                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                                    )}
                                    disabled={usarPuntos}
                                >
                                    <Star size={14} />
                                    Acumular Puntos
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUsarPuntos(!usarPuntos);
                                        if (!usarPuntos) setAcumulaPuntos(false);
                                    }}
                                    className={clsx(
                                        "flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1 border transition-colors",
                                        usarPuntos
                                            ? "bg-amber-500 text-white border-amber-500"
                                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100",
                                        customerPoints <= 0 && "opacity-50 cursor-not-allowed"
                                    )}
                                    disabled={acumulaPuntos || customerPoints <= 0}
                                >
                                    <Gift size={14} />
                                    Usar Puntos
                                </button>
                            </div>

                            {usarPuntos && (
                                <div className="mt-2 bg-amber-50 border border-amber-200 rounded p-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-amber-800">Puntos disponibles:</span>
                                        <span className="font-bold text-amber-800">{formatCurrency(customerPoints)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-amber-800">Se descontarán:</span>
                                        <span className="font-bold text-amber-800">-{formatCurrency(pointsToUse)}</span>
                                    </div>
                                    <hr className="my-1 border-amber-200" />
                                    <div className="flex justify-between">
                                        <span className="text-amber-900 font-bold">Restante a pagar:</span>
                                        <span className="font-bold text-amber-900">{formatCurrency(effectiveTotal)}</span>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                                <User size={16} className="text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">Buscar Cliente (Lealtad)</span>
                            </label>
                            <Input
                                label=""
                                value={customerQuery}
                                onChange={(e) => setCustomerQuery(e.target.value)}
                                placeholder="Teléfono, nombre o email..."
                            />
                            {isSearchingCustomer && <p className="text-xs text-gray-500 mt-1">Buscando...</p>}
                            {customerResults.length > 0 && (
                                <div className="mt-1 border rounded max-h-32 overflow-y-auto">
                                    {customerResults.map(c => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCustomer(c);
                                                setCustomerResults([]);
                                            }}
                                            className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0 text-sm"
                                        >
                                            <span className="font-medium">{c.name}</span>
                                            <span className="text-gray-500 ml-2">{c.phone}</span>
                                            <span className="text-xs text-gray-400 ml-2">{parseDecimal(c.loyalty_points).toFixed(2)} pts</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Payment method */}
                {effectiveTotal > 0 && (
                    <div className="mb-6 flex space-x-2">
                        {(['cash', 'card', 'transfer', 'mixed'] as const).map(m => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => {
                                    setMethod(m);
                                    setCashReceived('0');
                                    setCardAmount('0');
                                    setTransferAmount('0');
                                }}
                                className={clsx(
                                    "flex-1 py-3 rounded-lg font-bold capitalize transition-colors border text-sm",
                                    method === m
                                        ? "bg-brand-blue text-white border-brand-blue"
                                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                )}
                            >
                                {m === 'transfer' ? 'Transf.' : m === 'cash' ? 'Efectivo' : m === 'card' ? 'Tarjeta' : 'Mixto'}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handlePay} className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded text-right">
                        <p className="text-sm text-black">Total Ticket</p>
                        <p className={clsx("text-3xl font-bold", pointsToUse > 0 ? "text-gray-400 line-through" : "text-black")}>{formatCurrency(total)}</p>
                        {pointsToUse > 0 && (
                            <p className="text-2xl font-bold text-brand-green mt-1">A pagar: {formatCurrency(effectiveTotal)}</p>
                        )}
                    </div>

                    {needsMixedInputs && (
                        <div className="space-y-4 border-b pb-4 mb-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Monto Tarjeta"
                                    type="number"
                                    step="0.01"
                                    value={cardAmount}
                                    onChange={(e) => setCardAmount(e.target.value)}
                                    className="text-right"
                                />
                                <Input
                                    label="Monto Transferencia"
                                    type="number"
                                    step="0.01"
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(e.target.value)}
                                    className="text-right"
                                />
                            </div>
                        </div>
                    )}

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
                                required={method === 'cash'}
                            />
                        </div>
                    )}

                    {effectiveTotal > 0 && (
                        <div className="mt-2 text-right space-y-2">
                            {method === 'mixed' && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Cubierto:</span>
                                    <span>{formatCurrency(totalPaid)}</span>
                                </div>
                            )}

                            {!isSufficient ? (
                                <div className="flex justify-between text-red-600 font-bold">
                                    <span>Faltante:</span>
                                    <span>{formatCurrency(remaining)}</span>
                                </div>
                            ) : (
                                change > 0 && (
                                    <div className="flex justify-between text-brand-green font-bold text-xl">
                                        <span>Cambio:</span>
                                        <span>{formatCurrency(change)}</span>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {effectiveTotal <= 0 && (
                        <div className="bg-green-50 border border-green-200 p-4 rounded text-center">
                            <p className="text-green-700 font-bold text-lg">✅ Cubierto con puntos de lealtad</p>
                        </div>
                    )}

                    {needsMasterPassword && (
                        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                            <Input
                                label={usarPuntos ? "Contraseña Maestra (Autorizar Puntos)" : "Contraseña Maestra (Autorización de Descuento)"}
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
                            disabled={!isSufficient}
                        >
                            Confirmar Pago
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
