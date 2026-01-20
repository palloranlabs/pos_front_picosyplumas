import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { openSession, closeSession } from '../../api/cash.api';
import { useSessionStore } from '../../stores/useSessionStore';

interface Props {
    mode: 'open' | 'close';
    onSuccess: () => void;
    onCancel?: () => void;
}

export const SessionModal: React.FC<Props> = ({ mode, onSuccess, onCancel }) => {
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { setSessionOpen } = useSessionStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const val = parseFloat(amount);
            if (mode === 'open') {
                await openSession(val);
                setSessionOpen(true);
            } else {
                await closeSession(val);
                setSessionOpen(false);
            }
            onSuccess();
        } catch (e) {
            alert("Failed to " + mode + " session");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
            <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                <h2 className="text-xl font-bold mb-4 capitalize">{mode} Session</h2>
                <form onSubmit={handleSubmit}>
                    <Input
                        label={mode === 'open' ? "Opening Balance" : "Closing Balance"}
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        autoFocus
                    />
                    <div className="flex justify-end mt-4 space-x-2">
                        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
                        <Button type="submit" isLoading={isLoading} variant={mode === 'open' ? 'primary' : 'danger'}>
                            Confirm
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
