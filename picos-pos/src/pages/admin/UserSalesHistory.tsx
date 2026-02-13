import React, { useState } from 'react';
import { getUsersSummary, getUserSalesHistory, type UserSalesSummary } from '../../api/reports.api';
import { formatCurrency, parseDecimal } from '../../utils/currency';
import type { Sale } from '../../types/models.types';
import { Users, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const UserSalesHistory: React.FC = () => {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(thirtyDaysAgo);
    const [endDate, setEndDate] = useState(today);
    const [usersSummary, setUsersSummary] = useState<UserSalesSummary[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [userSales, setUserSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSales, setIsLoadingSales] = useState(false);

    const handleQuery = async () => {
        setIsLoading(true);
        try {
            const data = await getUsersSummary(startDate, endDate);
            setUsersSummary(data);
            setSelectedUser(null);
            setUserSales([]);
        } catch (e: any) {
            alert(e.response?.data?.detail || 'Error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectUser = async (username: string) => {
        if (selectedUser === username) {
            setSelectedUser(null);
            setUserSales([]);
            return;
        }
        setSelectedUser(username);
        setIsLoadingSales(true);
        try {
            const sales = await getUserSalesHistory(username, startDate, endDate);
            setUserSales(sales);
        } catch (e: any) {
            alert(e.response?.data?.detail || 'Error');
        } finally {
            setIsLoadingSales(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Users className="text-brand-blue" />
                Historial de Ventas por Usuario
            </h1>

            {/* Date Range */}
            <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-end gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <Button onClick={handleQuery} isLoading={isLoading}>
                    <Search size={16} className="mr-1" /> Consultar
                </Button>
            </div>

            {/* Users table */}
            {usersSummary.length > 0 && (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b text-left text-gray-600">
                                <th className="p-3">Usuario</th>
                                <th className="p-3 text-right">Ventas</th>
                                <th className="p-3 text-right"># Trans.</th>
                                <th className="p-3 text-right"># Dev.</th>
                                <th className="p-3 text-center">Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersSummary.map(u => (
                                <React.Fragment key={u.username}>
                                    <tr
                                        className={`border-b cursor-pointer hover:bg-blue-50 transition-colors ${selectedUser === u.username ? 'bg-blue-50' : ''}`}
                                        onClick={() => handleSelectUser(u.username)}
                                    >
                                        <td className="p-3 font-bold">{u.username}</td>
                                        <td className="p-3 text-right font-bold">{formatCurrency(u.total_sales)}</td>
                                        <td className="p-3 text-right">{u.total_transactions}</td>
                                        <td className="p-3 text-right text-red-500">{u.total_refunds}</td>
                                        <td className="p-3 text-center">
                                            {selectedUser === u.username ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </td>
                                    </tr>

                                    {/* Expanded sales detail */}
                                    {selectedUser === u.username && (
                                        <tr>
                                            <td colSpan={5} className="bg-gray-50 p-4">
                                                {isLoadingSales ? (
                                                    <p className="text-center text-gray-500">Cargando...</p>
                                                ) : userSales.length === 0 ? (
                                                    <p className="text-center text-gray-500">Sin ventas en este periodo</p>
                                                ) : (
                                                    <div className="max-h-96 overflow-y-auto">
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="text-left text-gray-500 border-b">
                                                                    <th className="pb-1">Ticket</th>
                                                                    <th className="pb-1">Fecha</th>
                                                                    <th className="pb-1">Artículos</th>
                                                                    <th className="pb-1 text-right">Total</th>
                                                                    <th className="pb-1 text-center">Método</th>
                                                                    <th className="pb-1 text-center">Estado</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {userSales.map(s => (
                                                                    <tr key={s.id} className={`border-b border-gray-100 ${s.is_refunded ? 'opacity-50' : ''}`}>
                                                                        <td className="py-1 font-mono">{s.ticket_number}</td>
                                                                        <td className="py-1">{new Date(s.created_at).toLocaleString()}</td>
                                                                        <td className="py-1 text-gray-600 truncate max-w-[200px]">
                                                                            {s.items.map(i => i.product_name_snapshot).join(', ')}
                                                                        </td>
                                                                        <td className="py-1 text-right font-bold">{formatCurrency(parseDecimal(s.total_amount))}</td>
                                                                        <td className="py-1 text-center">
                                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100">{s.payment_method}</span>
                                                                        </td>
                                                                        <td className="py-1 text-center">
                                                                            {s.is_refunded ? (
                                                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600">Devuelto</span>
                                                                            ) : s.is_service ? (
                                                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">Servicio</span>
                                                                            ) : (
                                                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-600">Completado</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
