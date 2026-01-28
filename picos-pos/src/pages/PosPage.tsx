import React, { useState } from 'react';
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

    // Auto-prompt removed as per user request
    // useEffect(() => {
    //     if (!isSessionOpen) {
    //         setShowSessionModal('open');
    //     }
    // }, [isSessionOpen]);

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            <header className="bg-white text-black px-4 py-3 flex justify-between items-center shadow-md shrink-0 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                    <img src="/logo.webp" alt="Logo" className="h-8 w-auto rounded-full bg-white p-0.5 shadow-sm" />
                    <Link to="/admin" className="ml-4 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-black hover:text-white transition-all duration-300 hover:shadow-md text-gray-700 font-medium text-sm flex items-center group">
                        <span>Panel Admin</span>
                    </Link>
                </div>

                <div className="flex-1 flex justify-center items-center">
                    <span className="text-2xl font-black tracking-wide uppercase text-black drop-shadow-sm">
                        {useAuthStore((state) => state.user)}
                    </span>
                </div>

                <div className="flex items-center space-x-3">
                    {isSessionOpen ? (
                        <Button variant="success" size="sm" onClick={() => setShowSessionModal('close')}>
                            <Power size={16} className="mr-2" /> Cerrar Turno
                        </Button>
                    ) : (
                        <Button variant="danger" size="sm" onClick={() => setShowSessionModal('open')}>
                            <Power size={16} className="mr-2" /> Abrir Turno
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={logout}
                        className="text-black"
                    >
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
