import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useSessionStore } from '../stores/useSessionStore';
import { Button } from '../components/common/Button';
import { LogOut, Power } from 'lucide-react';
import { ProductGrid } from '../components/pos/ProductGrid';
import { CartWidget } from '../components/pos/CartWidget';
import { SessionModal } from '../components/pos/SessionModal';
import { Link } from 'react-router-dom';

export const PosPage: React.FC = () => {
    const logout = useAuthStore((state) => state.logout);
    const { isSessionOpen } = useSessionStore();
    const [showSessionModal, setShowSessionModal] = useState<'open' | 'close' | null>(null);

    // Auto-prompt open if closed
    useEffect(() => {
        if (!isSessionOpen) {
            setShowSessionModal('open');
        }
    }, [isSessionOpen]);

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            <header className="bg-brand-navy text-white px-4 py-3 flex justify-between items-center shadow-md shrink-0">
                <div className="flex items-center space-x-4">
                    <img src="/logo.webp" alt="Logo" className="h-8 w-auto rounded-full bg-white p-0.5" />
                    <h1 className="text-xl font-bold">POS System</h1>
                    <Link to="/admin" className="text-gray-300 hover:text-white ml-4 text-sm font-medium">Admin Panel</Link>
                </div>
                <div className="flex items-center space-x-3">
                    {isSessionOpen ? (
                        <Button variant="danger" size="sm" onClick={() => setShowSessionModal('close')}>
                            <Power size={16} className="mr-2" /> End Shift
                        </Button>
                    ) : (
                        <span className="text-yellow-400 font-bold text-sm">Session Closed</span>
                    )}
                    <Button variant="ghost" size="sm" onClick={logout} className="text-white hover:bg-white/10">
                        <LogOut size={16} className="mr-2" />
                        Logout
                    </Button>
                </div>
            </header>

            <main className="flex-1 overflow-hidden flex">
                {/* Left Column: Product Grid */}
                <div className="w-2/3 p-4 overflow-hidden h-full">
                    <ProductGrid />
                </div>

                {/* Right Column: Cart */}
                <div className="w-1/3 bg-white border-l border-gray-200 flex flex-col shadow-xl h-full">
                    <CartWidget />
                </div>
            </main>

            {showSessionModal && (
                <SessionModal
                    mode={showSessionModal}
                    onSuccess={() => setShowSessionModal(null)}
                    // Prevent cancel if opening is forced, but allow if user manually clicked open (if we had a button)
                    // For 'open' on load, maybe don't allow cancel? Or allow logout.
                    onCancel={showSessionModal === 'close' ? () => setShowSessionModal(null) : undefined}
                />
            )}
        </div>
    );
};
