import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { openSession, closeSession } from '../../api/cash.api';
import { useSessionStore } from '../../stores/useSessionStore';
import { SessionCloseTicketTemplate } from './SessionCloseTicketTemplate';
import type { CashSessionCloseResponse } from '../../types/models.types';

interface Props {
    mode: 'open' | 'close';
    onSuccess: () => void;
    onCancel?: () => void;
}

export const SessionModal: React.FC<Props> = ({ mode, onSuccess, onCancel }) => {
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [closeData, setCloseData] = useState<CashSessionCloseResponse | null>(null);
    const { setSessionOpen } = useSessionStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const val = parseFloat(amount);
            if (isNaN(val)) {
                alert("Ingrese un monto válido");
                setIsLoading(false);
                return;
            }
            if (mode === 'open') {
                await openSession(val);
                setSessionOpen(true);
            } else {
                const response = await closeSession(val);
                setSessionOpen(false);
                setCloseData(response); // Store response to show ticket
                // Don't call onSuccess immediately, wait for print
                setTimeout(() => {
                    window.print();
                    onSuccess(); // Close modal after print dialog opens (or user cancels)
                }, 500);
            }
            if (mode === 'open') onSuccess();
        } catch (e: any) {
            // If 400, it likely means the session is already in the target state
            if (e.response && e.response.status === 400) {
                if (mode === 'open') {
                    alert("Parece que ya hay una sesión abierta. Sincronizando...");
                    setSessionOpen(true);
                } else {
                    alert("Parece que la sesión ya estaba cerrada.");
                    setSessionOpen(false);
                }
                onSuccess();
            } else {
                alert("Falló al " + (mode === 'open' ? 'abrir' : 'cerrar') + " sesión: " + (e.response?.data?.detail || e.message));
            }
        } finally {
            setIsLoading(false);
        }
    };



    if (closeData) {
        return (
            <div className="fixed inset-0 bg-white z-[80] flex items-center justify-center">
                <div className="text-center print:hidden">
                    <h2 className="text-2xl font-bold text-black mb-4">Sesión Cerrada</h2>
                    <p className="text-black mb-4">Imprimiendo reporte...</p>
                    <Button onClick={onSuccess}>Cerrar</Button>
                </div>
                <SessionCloseTicketTemplate data={closeData} />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
            <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                <h2 className="text-xl font-bold mb-4 capitalize">{mode === 'open' ? 'Abrir Sesión' : 'Cerrar Sesión'}</h2>
                <form onSubmit={handleSubmit}>
                    <Input
                        label={mode === 'open' ? "Saldo Inicial" : "Saldo Final"}
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        autoFocus
                    />
                    <div className="flex justify-end mt-4 space-x-2">
                        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>}
                        <Button type="submit" isLoading={isLoading} variant={mode === 'open' ? 'primary' : 'danger'}>
                            Confirmar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
