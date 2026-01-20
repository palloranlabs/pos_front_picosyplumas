import React from 'react';
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
                        @page {
                            margin: 0;
                            size: auto; 
                        }
                        body * {
                            visibility: hidden;
                        }
                        #printable-area, #printable-area * {
                            visibility: visible;
                        }
                        #printable-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%; 
                        }
                    }
                `}
            </style>
            <div id="printable-area" className="hidden print:block bg-white text-black font-mono text-[11px] leading-tight p-2" style={{ width: '58mm', maxWidth: '100%' }}>
                <div className="text-center mb-2">
                    <h2 className="font-bold text-sm">Picos y Plumas</h2>
                    <h3 className="font-bold text-xs">CORTE DE CAJA</h3>
                    <p>Sesión #{data.session_id}</p>
                    <p>Usuario: {data.user_id}</p>
                    <p>{new Date(data.closed_at).toLocaleString()}</p>
                </div>

                <hr className="border-dashed border-black my-1" />

                <div className="flex justify-between">
                    <span>Saldo Inicial:</span>
                    <span>${data.opening_balance}</span>
                </div>

                <hr className="border-dashed border-black my-1" />

                <div className="flex justify-between font-bold">
                    <span>VENTAS</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span>Efectivo:</span>
                    <span>${data.total_sales_cash}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span>Tarjeta:</span>
                    <span>${data.total_sales_card}</span>
                </div>

                <hr className="border-dashed border-black my-1" />

                <div className="flex justify-between font-bold">
                    <span>TOTALES</span>
                </div>

                <div className="flex justify-between text-[10px]">
                    <span>Esperado en Caja:</span>
                    <span>${data.expected_cash_in_drawer}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span>Real en Caja:</span>
                    <span>${data.actual_cash_in_drawer}</span>
                </div>

                <div className="flex justify-between text-[10px] mt-1 font-bold">
                    <span>Diferencia:</span>
                    <span className={data.has_discrepancy ? (parseFloat(data.discrepancy) < 0 ? "text-red-600" : "text-blue-600") : ""}>
                        ${data.discrepancy}
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
