import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Package, LogOut, ArrowLeft, KeyRound, ShieldAlert, UserPlus, BarChart3, Users, Heart } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/common/Button';
import { ChangePasswordModal } from './ChangePasswordModal';
import { ChangeMasterPasswordModal } from './ChangeMasterPasswordModal';
import { RegisterUserModal } from './RegisterUserModal';

export const AdminLayout: React.FC = () => {
    const logout = useAuthStore((state) => state.logout);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isChangeMasterPasswordModalOpen, setIsChangeMasterPasswordModalOpen] = useState(false);
    const [isRegisterUserModalOpen, setIsRegisterUserModalOpen] = useState(false);

    const navLinkClass = "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 hover:translate-x-1 hover:shadow-md bg-gray-50 text-gray-800 font-medium";

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white text-black flex flex-col shadow-lg border-r border-gray-200">
                <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
                    <img src="/logo.webp" alt="Logo" className="h-8 w-8 rounded-full bg-white p-0.5 shadow-sm" />
                    <span className="font-bold text-lg drop-shadow-md">Panel de Administración</span>
                </div>

                <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
                    <Link to="/pos" className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 hover:translate-x-1 hover:shadow-md text-gray-700">
                        <ArrowLeft size={20} />
                        <span className="font-medium">Volver al POS</span>
                    </Link>

                    <div className="border-t border-gray-100 my-2"></div>

                    <Link to="/admin/products" className={navLinkClass}>
                        <Package size={20} />
                        <span>Productos</span>
                    </Link>

                    <Link to="/admin/dashboard" className={navLinkClass}>
                        <BarChart3 size={20} />
                        <span>Dashboard Ventas</span>
                    </Link>

                    <Link to="/admin/user-history" className={navLinkClass}>
                        <Users size={20} />
                        <span>Historial por Usuario</span>
                    </Link>

                    <Link to="/admin/customers" className={navLinkClass}>
                        <Heart size={20} />
                        <span>Clientes / Lealtad</span>
                    </Link>

                    <Link to="/admin/ips" className={navLinkClass}>
                        <ShieldAlert size={20} />
                        <span>IPs Permitidas</span>
                    </Link>

                    <div className="border-t border-gray-100 my-2"></div>

                    <button
                        onClick={() => setIsChangePasswordModalOpen(true)}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 hover:translate-x-1 hover:shadow-md text-gray-700 font-medium"
                    >
                        <KeyRound size={20} />
                        <span>Cambiar Contraseña</span>
                    </button>

                    <button
                        onClick={() => setIsChangeMasterPasswordModalOpen(true)}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 hover:translate-x-1 hover:shadow-md text-gray-700 font-medium"
                    >
                        <ShieldAlert size={20} />
                        <span>Contraseña Maestra</span>
                    </button>

                    <button
                        onClick={() => setIsRegisterUserModalOpen(true)}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 hover:translate-x-1 hover:shadow-md text-gray-700 font-medium"
                    >
                        <UserPlus size={20} />
                        <span>Registrar Usuario</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <Button variant="ghost" className="w-full justify-start text-black hover:bg-gray-100" onClick={logout}>
                        <LogOut size={20} className="mr-2" />
                        Cerrar Sesión
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>

            <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
            />
            <ChangeMasterPasswordModal
                isOpen={isChangeMasterPasswordModalOpen}
                onClose={() => setIsChangeMasterPasswordModalOpen(false)}
            />
            <RegisterUserModal
                isOpen={isRegisterUserModalOpen}
                onClose={() => setIsRegisterUserModalOpen(false)}
            />
        </div>
    );
};
