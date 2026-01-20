import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Package, LogOut, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/common/Button';

export const AdminLayout: React.FC = () => {
    const logout = useAuthStore((state) => state.logout);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-brand-purple text-white flex flex-col shadow-lg">
                <div className="p-4 border-b border-white/10 flex items-center space-x-3">
                    <img src="/logo.webp" alt="Logo" className="h-8 w-8 rounded-full bg-white p-0.5" />
                    <span className="font-bold text-lg">Admin Panel</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/pos" className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-white/10 transition-colors text-white/80 hover:text-white">
                        <ArrowLeft size={20} />
                        <span>Back to POS</span>
                    </Link>
                    <div className="border-t border-white/10 my-2"></div>
                    <Link to="/admin/products" className="flex items-center space-x-2 px-4 py-2 rounded bg-white/10 text-white font-medium">
                        <Package size={20} />
                        <span>Products</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" onClick={logout}>
                        <LogOut size={20} className="mr-2" />
                        Logout
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};
