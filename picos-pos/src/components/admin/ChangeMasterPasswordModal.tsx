import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { X } from 'lucide-react';
import { updateMasterPassword } from '../../api/config.api';

interface ChangeMasterPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangeMasterPasswordModal: React.FC<ChangeMasterPasswordModalProps> = ({ isOpen, onClose }) => {
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await updateMasterPassword(newPassword);
            setSuccess("Contraseña Maestra actualizada exitosamente.");
            setNewPassword('');
            setTimeout(() => {
                onClose();
                setSuccess('');
            }, 1500);
        } catch (err) {
            console.error(err);
            setError("Error al actualizar la contraseña maestra.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Cambiar Contraseña Maestra</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-yellow-50 p-3 rounded mb-2 border border-yellow-200">
                        <p className="text-xs text-yellow-800">
                            <b>Atención:</b> Esta contraseña se usa para autorizar descuentos y devoluciones.
                        </p>
                    </div>

                    <Input
                        label="Nueva Contraseña Maestra"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">{success}</p>}

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" isLoading={isLoading}>Actualizar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
