import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { login } from '../api/auth.api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Lock, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const setTokens = useAuthStore((state) => state.setTokens);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const data = await login(username, password);
            setTokens(data, username);
            navigate('/pos');
        } catch (err: any) {
            console.error("Login failed", err);
            const errorDetail = err.response?.data?.detail;
            const errorMessage = typeof errorDetail === 'string'
                ? errorDetail
                : 'Credenciales inválidas. Intente de nuevo.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-blue to-brand-purple flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-blue opacity-20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-brand-purple opacity-20 rounded-full blur-3xl"></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white/95 backdrop-blur-sm py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-white/20 transform transition-all hover:scale-[1.01] duration-500">
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 rounded-full bg-blue-50 mb-4 shadow-inner">
                            <img src="/logo.webp" alt="Picos y Plumas" className="h-20 w-auto" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-black font-sans tracking-tight">
                            Iniciar Sesión
                        </h2>
                        <p className="mt-2 text-sm text-black">
                            Picos y Plumas POS
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <Input
                            label="Usuario"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            icon={<User size={18} className="text-brand-blue" />}
                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                        />

                        <Input
                            label="Contraseña"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={<Lock size={18} className="text-brand-blue" />}
                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                        />

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-brand-red text-sm text-center font-medium animate-pulse">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full py-3 text-lg font-bold shadow-lg hover:shadow-xl transition-all transform active:scale-95 bg-gradient-to-r from-brand-blue to-brand-navy border-none"
                            isLoading={isLoading}
                        >
                            Entrar
                        </Button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-white/80 text-sm font-medium drop-shadow-md">
                        &copy; 2026 Picos y Plumas. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
};
