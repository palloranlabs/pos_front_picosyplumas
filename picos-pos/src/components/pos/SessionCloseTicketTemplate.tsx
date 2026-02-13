import React from 'react';
import { formatCurrency } from '../../utils/currency';
import type { CashSessionCloseResponse } from '../../types/models.types';

interface Props {
    data: CashSessionCloseResponse | null;
}

export const SessionCloseTicketTemplate: React.FC<Props> = ({ data }) => {
    if (!data) return null;

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
                <div className="text-center mb-2">
                    <img src="/logo_ticket.png" alt="Logo" className="mx-auto h-10 mb-1" />
                    <h3 className="font-bold text-xs">CORTE DE CAJA</h3>
                    <p>Sesión #{data.session_id}</p>
                    <p>Cajero: {data.username}</p>
                    <p>{new Date(data.closed_at).toLocaleString()}</p>
                </div>

                <hr className="border-dashed border-black my-1" />

                <div className="flex justify-between">
                    <span>Saldo Inicial:</span>
                    <span>{formatCurrency(parseFloat(data.opening_balance))}</span>
                </div>

                <hr className="border-dashed border-black my-1" />

                {/* VENTAS */}
                <div className="flex justify-between font-bold">
                    <span>VENTAS</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span>Efectivo:</span>
                    <span>{formatCurrency(parseFloat(data.total_sales_cash))}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span>Tarjeta:</span>
                    <span>{formatCurrency(parseFloat(data.total_sales_card))}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span>Transferencia:</span>
                    <span>{formatCurrency(parseFloat(data.total_sales_transfer))}</span>
                </div>

                {/* DEVOLUCIONES */}
                {(parseFloat(data.total_refunded_cash) > 0 || parseFloat(data.total_refunded_card) > 0 || parseFloat(data.total_refunded_transfer) > 0) && (
                    <>
                        <hr className="border-dashed border-black my-1" />
                        <div className="flex justify-between font-bold text-red-600">
                            <span>DEVOLUCIONES</span>
                        </div>
                        {parseFloat(data.total_refunded_cash) > 0 && (
                            <div className="flex justify-between text-[10px] text-red-600">
                                <span>Efectivo:</span>
                                <span>-{formatCurrency(parseFloat(data.total_refunded_cash))}</span>
                            </div>
                        )}
                        {parseFloat(data.total_refunded_card) > 0 && (
                            <div className="flex justify-between text-[10px] text-red-600">
                                <span>Tarjeta:</span>
                                <span>-{formatCurrency(parseFloat(data.total_refunded_card))}</span>
                            </div>
                        )}
                        {parseFloat(data.total_refunded_transfer) > 0 && (
                            <div className="flex justify-between text-[10px] text-red-600">
                                <span>Transferencia:</span>
                                <span>-{formatCurrency(parseFloat(data.total_refunded_transfer))}</span>
                            </div>
                        )}
                    </>
                )}

                {/* MOVIMIENTOS DE CAJA */}
                {data.movements && data.movements.length > 0 && (
                    <>
                        <hr className="border-dashed border-black my-1" />
                        <div className="font-bold">MOV. DE CAJA</div>
                        {data.movements.map((m, i) => (
                            <div key={i} className="flex justify-between text-[10px]">
                                <span className="truncate max-w-[60%]">
                                    {m.movement_type === 'income' ? '↓' : '↑'} {m.description}
                                </span>
                                <span className={m.movement_type === 'income' ? 'text-green-700' : 'text-red-600'}>
                                    {m.movement_type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(m.amount))}
                                </span>
                            </div>
                        ))}
                        <div className="flex justify-between text-[10px] mt-1 font-bold">
                            <span>Total Entradas:</span>
                            <span className="text-green-700">+{formatCurrency(parseFloat(data.total_income))}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold">
                            <span>Total Salidas:</span>
                            <span className="text-red-600">-{formatCurrency(parseFloat(data.total_expense))}</span>
                        </div>
                    </>
                )}

                {/* TICKETS */}
                {data.tickets && data.tickets.length > 0 && (
                    <>
                        <hr className="border-dashed border-black my-1" />
                        <div className="font-bold text-[10px] mb-1">TICKETS ({data.tickets.length})</div>
                        {data.tickets.map((t, i) => (
                            <div key={i} className="flex justify-between text-[9px]">
                                <span className={t.is_refunded ? 'line-through' : ''}>
                                    {t.ticket_number}
                                </span>
                                <span className={t.is_refunded ? 'line-through text-red-600' : ''}>
                                    {formatCurrency(parseFloat(t.total_amount))}
                                </span>
                            </div>
                        ))}
                    </>
                )}

                <hr className="border-dashed border-black my-1" />

                {/* TOTALES */}
                <div className="flex justify-between font-bold">
                    <span>TOTALES</span>
                </div>

                <div className="flex justify-between text-[10px]">
                    <span>Esperado en Caja:</span>
                    <span>{formatCurrency(parseFloat(data.expected_cash_in_drawer))}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span>Real en Caja:</span>
                    <span>{formatCurrency(parseFloat(data.actual_cash_in_drawer))}</span>
                </div>

                <div className="flex justify-between text-[10px] mt-1 font-bold">
                    <span>Diferencia:</span>
                    <span className={data.has_discrepancy ? (parseFloat(data.discrepancy) < 0 ? "text-red-600" : "text-blue-600") : ""}>
                        {formatCurrency(parseFloat(data.discrepancy))}
                    </span>
                </div>

                <div className="text-center mt-4 text-[10px] pb-8">
                    <p>--- Fin del Reporte ---</p>
                    <p>.</p>
                </div>
            </div>
        </>
    );
};
