import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { searchSales, refundSale } from '../../api/sales.api';
import { formatCurrency, parseDecimal } from '../../utils/currency';
import { RefundTicketTemplate } from './RefundTicketTemplate';
import type { Sale } from '../../types/models.types';
import { Search, RotateCcw, X } from 'lucide-react';

interface Props {
    onClose: () => void;
}

export const TicketSearchModal: React.FC<Props> = ({ onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Sale[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [showRefundConfirm, setShowRefundConfirm] = useState(false);
    const [masterPassword, setMasterPassword] = useState('');
    const [refundMethod, setRefundMethod] = useState<string>('cash');
    const [isRefunding, setIsRefunding] = useState(false);
    const [refundedSale, setRefundedSale] = useState<Sale | null>(null);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsSearching(true);
        setError('');
        try {
            const data = await searchSales(query.trim());
            setResults(data);
            if (data.length === 0) setError('No se encontraron tickets');
        } catch (e: any) {
            setError(e.response?.data?.detail || 'Error al buscar');
        } finally {
            setIsSearching(false);
        }
    };

    const handleRefund = async () => {
        if (!selectedSale || !masterPassword) return;
        setIsRefunding(true);
        setError('');
        try {
            const result = await refundSale(selectedSale.ticket_number, masterPassword, refundMethod);
            setRefundedSale(result);
            setTimeout(() => window.print(), 500);
        } catch (e: any) {
            setError(e.response?.data?.detail || 'Error al procesar devolución');
        } finally {
            setIsRefunding(false);
        }
    };

    // Show refund ticket
    if (refundedSale) {
        return (
            <div className="fixed inset-0 bg-white z-[60] flex items-center justify-center">
                <div className="text-center print:hidden">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Devolución Procesada</h2>
                    <p className="text-gray-600 mb-4">Imprimiendo ticket de devolución...</p>
                    <Button onClick={onClose}>Cerrar</Button>
                </div>
                <RefundTicketTemplate sale={refundedSale} />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[700px] shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-black">Buscar Tickets</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Search bar */}
                <div className="flex gap-2 mb-4">
                    <Input
                        label=""
                        placeholder="Número de ticket o nombre de producto..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        autoFocus
                    />
                    <Button onClick={handleSearch} isLoading={isSearching} className="shrink-0">
                        <Search size={16} className="mr-1" /> Buscar
                    </Button>
                </div>

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                {/* Results */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {results.map((sale) => (
                        <div
                            key={sale.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedSale?.id === sale.id
                                    ? 'border-brand-blue bg-blue-50'
                                    : 'border-gray-200 hover:bg-gray-50'
                                } ${sale.is_refunded ? 'opacity-60' : ''}`}
                            onClick={() => { setSelectedSale(sale); setShowRefundConfirm(false); }}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-bold text-sm">{sale.ticket_number}</span>
                                    {sale.is_service && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Servicio</span>}
                                    {sale.is_refunded && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Devuelto</span>}
                                    <p className="text-xs text-gray-500 mt-1">
                                        {sale.username} • {new Date(sale.created_at).toLocaleString()} • {sale.payment_method}
                                    </p>
                                </div>
                                <span className={`font-bold ${sale.is_refunded ? 'line-through text-red-500' : 'text-black'}`}>
                                    {formatCurrency(parseDecimal(sale.total_amount))}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {sale.items.map(i => i.product_name_snapshot).join(', ')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Selected sale detail + refund */}
                {selectedSale && !selectedSale.is_refunded && (
                    <div className="mt-4 border-t pt-4">
                        <h3 className="font-bold text-lg mb-3">Detalle del Ticket {selectedSale.ticket_number}</h3>
                        <table className="w-full text-sm mb-3">
                            <thead>
                                <tr className="border-b text-left text-gray-500">
                                    <th className="pb-1">Artículo</th>
                                    <th className="pb-1 text-right">Cant.</th>
                                    <th className="pb-1 text-right">Precio</th>
                                    <th className="pb-1 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedSale.items.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-100">
                                        <td className="py-1">{item.product_name_snapshot}</td>
                                        <td className="py-1 text-right">{parseDecimal(item.quantity)}</td>
                                        <td className="py-1 text-right">{formatCurrency(parseDecimal(item.unit_price_snapshot))}</td>
                                        <td className="py-1 text-right">{formatCurrency(parseDecimal(item.item_subtotal))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {!showRefundConfirm ? (
                            <Button variant="danger" onClick={() => setShowRefundConfirm(true)}>
                                <RotateCcw size={16} className="mr-2" /> Hacer Devolución
                            </Button>
                        ) : (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                                <h4 className="font-bold text-red-700">Confirmar Devolución</h4>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Devolución</label>
                                    <div className="flex gap-2">
                                        {(['cash', 'card', 'transfer'] as const).map(m => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => setRefundMethod(m)}
                                                className={`px-3 py-1.5 rounded text-sm font-medium border ${refundMethod === m
                                                        ? 'bg-red-500 text-white border-red-500'
                                                        : 'bg-white text-gray-600 border-gray-200'
                                                    }`}
                                            >
                                                {m === 'cash' ? 'Efectivo' : m === 'card' ? 'Tarjeta' : 'Transferencia'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Input
                                    label="Contraseña Maestra"
                                    type="password"
                                    value={masterPassword}
                                    onChange={(e) => setMasterPassword(e.target.value)}
                                    required
                                />

                                <div className="flex gap-2">
                                    <Button variant="ghost" onClick={() => setShowRefundConfirm(false)}>Cancelar</Button>
                                    <Button variant="danger" onClick={handleRefund} isLoading={isRefunding}>
                                        Confirmar Devolución
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* If already refunded, show info */}
                {selectedSale && selectedSale.is_refunded && (
                    <div className="mt-4 border-t pt-4 bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">
                            <strong>Devuelto:</strong> {selectedSale.refunded_at ? new Date(selectedSale.refunded_at).toLocaleString() : 'N/A'}
                            {selectedSale.refunded_by_username && ` por ${selectedSale.refunded_by_username}`}
                            {selectedSale.refund_method && ` (${selectedSale.refund_method})`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
