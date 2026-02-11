import React, { useState, useEffect } from 'react';
import { Trash2, Plus, ShieldCheck, MapPin } from 'lucide-react';
import api from '../../api/client';
import type { AllowedIP, AllowedIPCreate } from '../../types/models.types';
import { Button } from '../../components/common/Button';

export const IpManager: React.FC = () => {
    const [ips, setIps] = useState<AllowedIP[]>([]);
    const [loading, setLoading] = useState(false);
    const [newItem, setNewItem] = useState<AllowedIPCreate>({ ip_address: '', nickname: '' });
    const [error, setError] = useState('');

    const fetchIps = async () => {
        setLoading(true);
        try {
            const { data } = await api.get<AllowedIP[]>('/api/v1/admin/allowed-ips');
            setIps(data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar IPs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIps();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/v1/admin/allowed-ips', newItem);
            setNewItem({ ip_address: '', nickname: '' });
            fetchIps();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al agregar IP');
        }
    };

    const handleAddCurrent = async () => {
        try {
            await api.post('/api/v1/admin/allowed-ips/me', { nickname: 'Admin Browser' });
            fetchIps();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al agregar IP actual');
        }
    };

    const handleDelete = async (ip_address: string) => {
        if (!confirm(`¿Estás seguro de eliminar la IP ${ip_address}?`)) return;
        try {
            await api.delete(`/api/v1/admin/allowed-ips/${ip_address}`);
            fetchIps();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al eliminar IP');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ShieldCheck className="text-blue-600" />
                Gestión de IPs Permitidas
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Add Form */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Agregar Nueva IP</h2>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Dirección IP</label>
                            <input
                                type="text"
                                value={newItem.ip_address}
                                onChange={(e) => setNewItem({ ...newItem, ip_address: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                placeholder="Ej: 192.168.1.100"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre / Alias</label>
                            <input
                                type="text"
                                value={newItem.nickname}
                                onChange={(e) => setNewItem({ ...newItem, nickname: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                placeholder="Ej: Oficina Principal"
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            <Plus size={18} className="mr-2" />
                            Agregar IP
                        </Button>
                    </form>

                    <div className="mt-6 border-t pt-4">
                        <Button variant="secondary" className="w-full" onClick={handleAddCurrent}>
                            <MapPin size={18} className="mr-2" />
                            Agregar Mi IP Actual
                        </Button>
                    </div>
                </div>

                {/* List */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4">IPs Autorizadas ({ips.length})</h2>
                    {loading ? (
                        <p>Cargando...</p>
                    ) : (
                        <div className="overflow-y-auto max-h-[400px]">
                            {ips.length === 0 ? (
                                <p className="text-gray-500">No hay IPs registradas.</p>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {ips.map((ip) => (
                                        <li key={ip.id} className="py-3 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-900">{ip.ip_address}</p>
                                                <p className="text-sm text-gray-500">{ip.nickname || 'Sin nombre'}</p>
                                                <p className="text-xs text-gray-400">{new Date(ip.created_at).toLocaleString()}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(ip.ip_address)}
                                                className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IpManager;
