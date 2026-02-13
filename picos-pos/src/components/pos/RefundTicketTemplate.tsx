import React from 'react';
import { formatCurrency, parseDecimal } from '../../utils/currency';
import type { Sale } from '../../types/models.types';

interface Props {
    sale: Sale;
}

export const RefundTicketTemplate: React.FC<Props> = ({ sale }) => {
    return (
        <>
            <style>
                {`
                    @media print {
                        @page { margin: 0; size: auto; }
                        body * { visibility: hidden; }
                        #printable-area, #printable-area * { visibility: visible; }
                        #printable-area { position: absolute; left: 0; top: 0; width: 100%; }
                    }
                `}
            </style>
            <div id="printable-area" className="hidden print:block bg-white text-black font-mono text-[11px] leading-tight p-2" style={{ width: '58mm', maxWidth: '100%' }}>
                {/* Header */}
                <div className="text-center mb-2">
                    <img src="/logo_ticket.png" alt="Logo" className="mx-auto h-10 mb-1" />
                    <h3 className="font-bold text-xs">TICKET DE DEVOLUCIÓN</h3>
                    <p>{sale.ticket_number}</p>
                </div>

                <hr className="border-dashed border-black my-1" />

                {/* Original sale data */}
                <div className="text-[10px]">
                    <p className="font-bold mb-1">VENTA ORIGINAL</p>
                    <div className="flex justify-between">
                        <span>Vendedor:</span>
                        <span>{sale.username}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Fecha Venta:</span>
                        <span>{new Date(sale.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Método Pago:</span>
                        <span>{sale.payment_method}</span>
                    </div>
                    {sale.customer_phone && (
                        <div className="flex justify-between">
                            <span>Tel. Cliente:</span>
                            <span>{sale.customer_phone}</span>
                        </div>
                    )}
                </div>

                <hr className="border-dashed border-black my-1" />

                {/* Original items */}
                <div className="text-[10px]">
                    <p className="font-bold mb-1">ARTÍCULOS</p>
                    {sale.items.map((item, i) => (
                        <div key={i} className="flex justify-between">
                            <span className="truncate max-w-[60%]">
                                {parseDecimal(item.quantity)}x {item.product_name_snapshot}
                            </span>
                            <span>{formatCurrency(parseDecimal(item.item_subtotal))}</span>
                        </div>
                    ))}
                </div>

                <hr className="border-dashed border-black my-1" />

                {/* Totals */}
                <div className="flex justify-between text-[10px]">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(parseDecimal(sale.subtotal))}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span>IVA:</span>
                    <span>{formatCurrency(parseDecimal(sale.tax_amount))}</span>
                </div>
                <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(parseDecimal(sale.total_amount))}</span>
                </div>

                <hr className="border-dashed border-black my-2" />

                {/* Refund section */}
                <div className="border border-dashed border-black p-1">
                    <p className="font-bold text-center text-xs mb-1">** DEVOLUCIÓN **</p>
                    <div className="text-[10px]">
                        <div className="flex justify-between">
                            <span>Artículos Devueltos:</span>
                            <span>{sale.items.length}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Monto Devuelto:</span>
                            <span>{formatCurrency(parseDecimal(sale.total_amount))}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Forma Devolución:</span>
                            <span>{sale.refund_method === 'cash' ? 'Efectivo' : sale.refund_method === 'card' ? 'Tarjeta' : 'Transferencia'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Devuelto por:</span>
                            <span>{sale.refunded_by_username || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Fecha Dev.:</span>
                            <span>{sale.refunded_at ? new Date(sale.refunded_at).toLocaleString() : '-'}</span>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-4 text-[10px] pb-8">
                    <p>--- Fin del Ticket ---</p>
                    <p>.</p>
                </div>
            </div>
        </>
    );
};
