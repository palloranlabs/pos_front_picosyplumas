import React, { useState } from 'react';
import { getSalesSummary, type SalesSummary } from '../../api/reports.api';
import { formatCurrency } from '../../utils/currency';
import { BarChart3, TrendingUp, DollarSign, CreditCard, ArrowLeftRight, Receipt, Star, Calendar } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const SalesDashboard: React.FC = () => {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(thirtyDaysAgo);
    const [endDate, setEndDate] = useState(today);
    const [data, setData] = useState<SalesSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleQuery = async () => {
        if (!startDate || !endDate) return;
        setIsLoading(true);
        setError('');
        try {
            const result = await getSalesSummary(startDate, endDate);
            setData(result);
        } catch (e: any) {
            setError(e.response?.data?.detail || 'Error al obtener datos');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <BarChart3 className="text-brand-blue" />
                Dashboard de Ventas
            </h1>

            {/* Date Range Selector */}
            <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-end gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>
                <Button onClick={handleQuery} isLoading={isLoading}>
                    Consultar
                </Button>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {data && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow p-4">
                            <div className="flex items-center gap-2 text-green-600 mb-2">
                                <DollarSign size={20} />
                                <span className="text-sm font-medium">Ventas Totales</span>
                            </div>
                            <p className="text-2xl font-bold">{formatCurrency(data.total_sales)}</p>
                            <p className="text-xs text-gray-500">{data.total_transactions} transacciones</p>
                        </div>

                        <div className="bg-white rounded-xl shadow p-4">
                            <div className="flex items-center gap-2 text-blue-600 mb-2">
                                <Receipt size={20} />
                                <span className="text-sm font-medium">IVA Generado</span>
                            </div>
                            <p className="text-2xl font-bold">{formatCurrency(data.total_tax)}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow p-4">
                            <div className="flex items-center gap-2 text-purple-600 mb-2">
                                <TrendingUp size={20} />
                                <span className="text-sm font-medium">Servicios</span>
                            </div>
                            <p className="text-2xl font-bold">{formatCurrency(data.total_service_revenue)}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow p-4">
                            <div className="flex items-center gap-2 text-red-500 mb-2">
                                <ArrowLeftRight size={20} />
                                <span className="text-sm font-medium">Devoluciones</span>
                            </div>
                            <p className="text-2xl font-bold">{formatCurrency(data.total_refunded)}</p>
                            <p className="text-xs text-gray-500">{data.total_refund_count} devoluciones</p>
                        </div>
                    </div>

                    {/* Payment Methods + Best Day */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Payment breakdown */}
                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <CreditCard size={20} className="text-brand-blue" />
                                Desglose por Método de Pago
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Efectivo', amount: data.total_cash, color: 'bg-green-500' },
                                    { label: 'Tarjeta', amount: data.total_card, color: 'bg-blue-500' },
                                    { label: 'Transferencia', amount: data.total_transfer, color: 'bg-purple-500' },
                                ].map(m => {
                                    const pct = data.total_sales > 0 ? (m.amount / data.total_sales) * 100 : 0;
                                    return (
                                        <div key={m.label}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>{m.label}</span>
                                                <span className="font-bold">{formatCurrency(m.amount)}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div className={`${m.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Best Day */}
                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Calendar size={20} className="text-amber-500" />
                                Día con Más Ventas
                            </h3>
                            {data.best_day ? (
                                <div className="text-center py-4">
                                    <p className="text-3xl font-bold text-amber-600">{new Date(data.best_day + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p className="text-2xl font-bold mt-2">{formatCurrency(data.best_day_amount)}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center">Sin datos en este periodo</p>
                            )}
                        </div>
                    </div>

                    {/* Top 5 Products */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Star size={20} className="text-amber-500" />
                            Top 5 Productos Más Vendidos
                        </h3>
                        {data.top_products.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-gray-500">
                                        <th className="pb-2">#</th>
                                        <th className="pb-2">Producto</th>
                                        <th className="pb-2 text-right">Cant. Vendida</th>
                                        <th className="pb-2 text-right">Ingresos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.top_products.map((p, i) => (
                                        <tr key={i} className="border-b border-gray-100">
                                            <td className="py-2 font-bold text-brand-blue">{i + 1}</td>
                                            <td className="py-2 font-medium">{p.name}</td>
                                            <td className="py-2 text-right">{p.total_sold.toFixed(1)}</td>
                                            <td className="py-2 text-right font-bold">{formatCurrency(p.total_revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500 text-center py-4">Sin datos en este periodo</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
