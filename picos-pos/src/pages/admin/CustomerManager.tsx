import React, { useState, useEffect } from 'react';
import { searchCustomers, createCustomer, type CustomerResponse, type CustomerCreate } from '../../api/customers.api';
import { parseDecimal } from '../../utils/currency';
import { Heart, Plus, Search } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const CustomerManager: React.FC = () => {
    const [customers, setCustomers] = useState<CustomerResponse[]>([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newCustomer, setNewCustomer] = useState<CustomerCreate>({ name: '', phone: '' });

    const loadCustomers = async (q: string = '') => {
        setIsLoading(true);
        try {
            const data = await searchCustomers(q);
            setCustomers(data);
        } catch (e) { }
        finally { setIsLoading(false); }
    };

    useEffect(() => { loadCustomers(); }, []);

    const handleSearch = () => loadCustomers(query);

    const handleCreate = async () => {
        if (!newCustomer.name || !newCustomer.phone) {
            alert('Nombre y teléfono son obligatorios');
            return;
        }
        try {
            await createCustomer(newCustomer);
            setShowCreate(false);
            setNewCustomer({ name: '', phone: '' });
            loadCustomers(query);
        } catch (e: any) {
            alert(e.response?.data?.detail || 'Error');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Heart className="text-pink-500" />
                Clientes y Programa de Lealtad
            </h1>

            {/* Search + Create */}
            <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-end gap-4">
                <div className="flex-1">
                    <Input
                        label="Buscar por nombre, teléfono o email"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <Button onClick={handleSearch} isLoading={isLoading}>
                    <Search size={16} className="mr-1" /> Buscar
                </Button>
                <Button variant="success" onClick={() => setShowCreate(!showCreate)}>
                    <Plus size={16} className="mr-1" /> Nuevo
                </Button>
            </div>

            {/* Create form */}
            {showCreate && (
                <div className="bg-white rounded-xl shadow p-4 mb-6 border-l-4 border-green-500">
                    <h3 className="font-bold mb-3">Nuevo Cliente</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Nombre *" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                        <Input label="Teléfono *" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
                        <Input label="Email" value={newCustomer.email || ''} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                        <Input label="Descripción" value={newCustomer.description || ''} onChange={(e) => setNewCustomer({ ...newCustomer, description: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                        <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
                        <Button variant="success" onClick={handleCreate}>Guardar</Button>
                    </div>
                </div>
            )}

            {/* Customers table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b text-left text-gray-600">
                            <th className="p-3">Nombre</th>
                            <th className="p-3">Teléfono</th>
                            <th className="p-3">Email</th>
                            <th className="p-3 text-right">Puntos</th>
                            <th className="p-3">Registro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.length === 0 ? (
                            <tr><td colSpan={5} className="p-4 text-center text-gray-500">No se encontraron clientes</td></tr>
                        ) : (
                            customers.map(c => (
                                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-3 font-medium">{c.name}</td>
                                    <td className="p-3">{c.phone}</td>
                                    <td className="p-3 text-gray-500">{c.email || '-'}</td>
                                    <td className="p-3 text-right">
                                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">
                                            {parseDecimal(c.loyalty_points).toFixed(2)} pts
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-500 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
