import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { createSale } from '../../api/sales.api';
import { formatCurrency, parseDecimal } from '../../utils/currency';
import { TicketTemplate } from './TicketTemplate';
import type { Sale } from '../../types/models.types';
import { Plus, Trash2, X } from 'lucide-react';
import clsx from 'clsx';

interface ServiceItem {
    id: number;
    name: string;
    price: string;
    description: string;
    aplica_iva: boolean;
}

interface Props {
    onClose: () => void;
}

let nextId = 1;

export const ServiceSaleModal: React.FC<Props> = ({ onClose }) => {
    const [items, setItems] = useState<ServiceItem[]>([]);
    const [method, setMethod] = useState<'cash' | 'card' | 'transfer' | 'mixed'>('cash');
    const [cashReceived, setCashReceived] = useState('0');
    const [cardAmount, setCardAmount] = useState('0');
    const [transferAmount, setTransferAmount] = useState('0');
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastSale, setLastSale] = useState<Sale | null>(null);

    // Add item form
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newIva, setNewIva] = useState(false);

    const addItem = () => {
        if (!newName.trim() || !newPrice.trim() || parseDecimal(newPrice) <= 0) {
            alert('Ingrese nombre y precio válido');
            return;
        }
        setItems(prev => [...prev, {
            id: nextId++,
            name: newName.trim(),
            price: newPrice,
            description: newDesc.trim(),
            aplica_iva: newIva
        }]);
        setNewName('');
        setNewPrice('');
        setNewDesc('');
        setNewIva(false);
    };

    const removeItem = (id: number) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const total = items.reduce((sum, i) => sum + parseDecimal(i.price), 0);

    const cashVal = parseDecimal(cashReceived);
    const cardVal = parseDecimal(cardAmount);
    const transferVal = parseDecimal(transferAmount);

    let totalPaid = 0;
    if (method === 'cash') totalPaid = cashVal;
    else if (method === 'card') totalPaid = total;
    else if (method === 'transfer') totalPaid = total;
    else if (method === 'mixed') totalPaid = cashVal + cardVal + transferVal;

    const change = Math.max(0, totalPaid - total);
    const isSufficient = totalPaid >= total - 0.01;

    const handlePay = async () => {
        if (items.length === 0) {
            alert('Agregue al menos un servicio');
            return;
        }
        if (!isSufficient) {
            alert('Monto insuficiente');
            return;
        }

        setIsProcessing(true);
        try {
            let finalCash = 0, finalCard = 0, finalTransfer = 0;
            if (method === 'cash') finalCash = cashVal;
            else if (method === 'card') finalCard = total;
            else if (method === 'transfer') finalTransfer = total;
            else if (method === 'mixed') {
                finalCash = cashVal;
                finalCard = cardVal;
                finalTransfer = transferVal;
            }

            const sale = await createSale({
                items: [],
                service_items: items.map(i => ({
                    name: i.name,
                    price: parseDecimal(i.price),
                    description: i.description,
                    aplica_iva: i.aplica_iva,
                })),
                payment_method: method,
                cash_received: finalCash,
                card_amount: finalCard,
                transfer_amount: finalTransfer,
            });
            setLastSale(sale);
            setTimeout(() => window.print(), 500);
        } catch (error: any) {
            alert('Error: ' + (error.response?.data?.detail || error.message));
        } finally {
            setIsProcessing(false);
        }
    };

    if (lastSale) {
        return (
            <div className="fixed inset-0 bg-white z-[60] flex items-center justify-center">
                <div className="text-center print:hidden">
                    <h2 className="text-2xl font-bold text-brand-green mb-4">¡Ticket de Servicio Exitoso!</h2>
                    <p className="text-gray-600 mb-4">Imprimiendo ticket...</p>
                    <Button onClick={onClose}>Cerrar</Button>
                </div>
                <TicketTemplate sale={lastSale} />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[650px] shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-black">🔧 Ticket de Servicio</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Add service item form */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <h3 className="font-bold text-sm text-purple-800 mb-3">Agregar Servicio</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Nombre del Servicio"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Ej: Corte de pelo"
                        />
                        <Input
                            label="Precio"
                            type="number"
                            step="0.01"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="mt-2">
                        <Input
                            label="Descripción (opcional)"
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            placeholder="Detalles del servicio..."
                        />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={newIva}
                                onChange={(e) => setNewIva(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                            />
                            <span className="text-sm font-medium text-gray-700">Aplica IVA (16%)</span>
                        </label>
                        <Button size="sm" onClick={addItem}>
                            <Plus size={16} className="mr-1" /> Agregar
                        </Button>
                    </div>
                </div>

                {/* Service items list */}
                {items.length > 0 && (
                    <div className="border rounded-lg mb-4">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50 text-left text-gray-500">
                                    <th className="p-2">Servicio</th>
                                    <th className="p-2 text-center">IVA</th>
                                    <th className="p-2 text-right">Precio</th>
                                    <th className="p-2 w-8"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id} className="border-b border-gray-100">
                                        <td className="p-2">
                                            <p className="font-medium">{item.name}</p>
                                            {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                                        </td>
                                        <td className="p-2 text-center">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${item.aplica_iva ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {item.aplica_iva ? 'Sí' : 'No'}
                                            </span>
                                        </td>
                                        <td className="p-2 text-right font-bold">{formatCurrency(parseDecimal(item.price))}</td>
                                        <td className="p-2">
                                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-3 bg-gray-50 flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                )}

                {/* Payment method */}
                {items.length > 0 && (
                    <>
                        <div className="flex space-x-2 mb-4">
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
                                        "flex-1 py-2 rounded-lg font-bold capitalize transition-colors border text-sm",
                                        method === m
                                            ? "bg-brand-blue text-white border-brand-blue"
                                            : "bg-gray-50 text-gray-600 border-gray-200"
                                    )}
                                >
                                    {m === 'transfer' ? 'Transf.' : m === 'cash' ? 'Efectivo' : m === 'card' ? 'Tarjeta' : 'Mixto'}
                                </button>
                            ))}
                        </div>

                        {(method === 'cash' || method === 'mixed') && (
                            <Input
                                label="Efectivo Recibido"
                                type="number"
                                step="0.01"
                                value={cashReceived}
                                onChange={(e) => setCashReceived(e.target.value)}
                            />
                        )}

                        {method === 'mixed' && (
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <Input
                                    label="Monto Tarjeta"
                                    type="number"
                                    step="0.01"
                                    value={cardAmount}
                                    onChange={(e) => setCardAmount(e.target.value)}
                                />
                                <Input
                                    label="Monto Transferencia"
                                    type="number"
                                    step="0.01"
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(e.target.value)}
                                />
                            </div>
                        )}

                        {method === 'cash' && change > 0 && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-right">
                                <span className="text-sm text-green-700">Cambio: <strong>{formatCurrency(change)}</strong></span>
                            </div>
                        )}

                        <Button
                            className="w-full mt-4 bg-gradient-to-r from-purple-500 to-purple-700 py-3 text-lg font-bold shadow-lg"
                            onClick={handlePay}
                            isLoading={isProcessing}
                            disabled={!isSufficient || items.length === 0}
                        >
                            COBRAR SERVICIO {formatCurrency(total)}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};
