import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { openSession, closeSession } from '../../api/cash.api';
import { useSessionStore } from '../../stores/useSessionStore';
import { SessionCloseTicketTemplate } from './SessionCloseTicketTemplate';
import type { CashSessionCloseResponse } from '../../types/models.types';
import { Lock } from 'lucide-react';

interface Props {
    mode: 'open' | 'close';
    onSuccess: () => void;
    onCancel?: () => void;
}

export const SessionModal: React.FC<Props> = ({ mode, onSuccess, onCancel }) => {
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [closeData, setCloseData] = useState<CashSessionCloseResponse | null>(null);
    const [needsMasterPassword, setNeedsMasterPassword] = useState(false);
    const [masterPassword, setMasterPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const { setSessionOpen } = useSessionStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
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
                onSuccess();
            } else {
                // Try closing — if discrepancy, backend returns 403 asking for password
                const pwd = needsMasterPassword ? masterPassword : undefined;
                const response = await closeSession(val, pwd);
                setSessionOpen(false);
                setCloseData(response);
                setTimeout(() => {
                    window.print();
                    onSuccess();
                }, 500);
            }
        } catch (e: any) {
            if (e.response && e.response.status === 403) {
                // Discrepancy detected — need master password
                const detail = e.response?.data?.detail || '';
                if (detail.includes('discrepancia') || detail.includes('maestra')) {
                    setNeedsMasterPassword(true);
                    setErrorMsg('Se detectó una discrepancia. Ingrese la contraseña maestra para autorizar el cierre.');
                } else if (detail.includes('incorrecta')) {
                    setErrorMsg('Contraseña maestra incorrecta. Intente de nuevo.');
                } else {
                    setErrorMsg(detail || 'Error de autorización');
                }
            } else if (e.response && e.response.status === 400) {
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
                        label={mode === 'open' ? "Saldo Inicial" : "Saldo Final en Caja"}
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        autoFocus
                    />

                    {/* Master password field for discrepancy */}
                    {needsMasterPassword && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Lock size={16} className="text-yellow-600" />
                                <span className="text-sm font-bold text-yellow-800">Autorización Requerida</span>
                            </div>
                            <p className="text-xs text-yellow-700 mb-2">
                                {errorMsg}
                            </p>
                            <Input
                                label="Contraseña Maestra"
                                type="password"
                                value={masterPassword}
                                onChange={(e) => setMasterPassword(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    )}

                    {errorMsg && !needsMasterPassword && (
                        <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
                    )}

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
