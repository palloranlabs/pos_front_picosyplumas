import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { X } from 'lucide-react';
import { changePassword } from '../../api/auth.api';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const [userId, setUserId] = useState('');
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
            const uid = userId ? parseInt(userId) : undefined;
            if (userId && isNaN(uid!)) {
                setError("El ID de usuario debe ser un número.");
                setIsLoading(false);
                return;
            }

            await changePassword(newPassword, uid);
            setSuccess("Contraseña actualizada exitosamente.");
            setNewPassword('');
            // Optional: close modal on success or keep it open with success message
            setTimeout(() => {
                onClose();
                setSuccess('');
                setUserId(''); // Reset for next use
            }, 1500);
        } catch (err) {
            console.error(err);
            setError("Error al actualizar la contraseña. Verifique los datos.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Cambiar Contraseña</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded mb-2">
                        <p className="text-xs text-blue-800">
                            Deje el "ID de Usuario" vacío para cambiar <b>su propia</b> contraseña.
                        </p>
                    </div>

                    <Input
                        label="ID de Usuario (Opcional)"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="Ej: 5"
                        type="number"
                    />

                    <Input
                        label="Nueva Contraseña"
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
