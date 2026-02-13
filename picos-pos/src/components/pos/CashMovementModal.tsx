import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { createCashMovement } from '../../api/cash.api';
import { CashMovementTicketTemplate } from './CashMovementTicketTemplate';
import type { CashMovementResponse } from '../../types/models.types';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface Props {
    onClose: () => void;
}

export const CashMovementModal: React.FC<Props> = ({ onClose }) => {
    const [movementType, setMovementType] = useState<'income' | 'expense'>('income');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<CashMovementResponse | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            alert('Ingrese un monto válido mayor a 0');
            return;
        }
        if (!description.trim()) {
            alert('Ingrese una descripción');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await createCashMovement(movementType, val, description.trim());
            setResult(response);
            setTimeout(() => {
                window.print();
            }, 500);
        } catch (error: any) {
            alert('Error: ' + (error.response?.data?.detail || error.message));
        } finally {
            setIsProcessing(false);
        }
    };

    if (result) {
        return (
            <div className="fixed inset-0 bg-white z-[60] flex items-center justify-center">
                <div className="text-center print:hidden">
                    <h2 className="text-2xl font-bold text-brand-green mb-4">
                        {result.movement_type === 'income' ? '✅ Entrada Registrada' : '✅ Salida Registrada'}
                    </h2>
                    <p className="text-gray-600 mb-4">Imprimiendo recibo...</p>
                    <Button onClick={onClose}>Cerrar</Button>
                </div>
                <CashMovementTicketTemplate data={result} />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[450px] shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-black">Movimiento de Caja</h2>

                {/* Type selector */}
                <div className="flex space-x-3 mb-6">
                    <button
                        type="button"
                        onClick={() => setMovementType('income')}
                        className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors border ${movementType === 'income'
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                    >
                        <ArrowDownCircle size={20} />
                        Entrada
                    </button>
                    <button
                        type="button"
                        onClick={() => setMovementType('expense')}
                        className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors border ${movementType === 'expense'
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                    >
                        <ArrowUpCircle size={20} />
                        Salida
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Monto"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        autoFocus
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ej: Pago a proveedor, Cambio del banco..."
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button
                            type="submit"
                            isLoading={isProcessing}
                            variant={movementType === 'income' ? 'primary' : 'danger'}
                        >
                            Confirmar {movementType === 'income' ? 'Entrada' : 'Salida'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
