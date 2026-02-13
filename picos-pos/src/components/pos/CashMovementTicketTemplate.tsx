import React from 'react';
import { formatCurrency } from '../../utils/currency';
import type { CashMovementResponse } from '../../types/models.types';

interface Props {
    data: CashMovementResponse;
}

export const CashMovementTicketTemplate: React.FC<Props> = ({ data }) => {
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
                    <h3 className="font-bold text-xs">
                        {data.movement_type === 'income' ? 'ENTRADA DE EFECTIVO' : 'SALIDA DE EFECTIVO'}
                    </h3>
                    <p>{data.ticket_number}</p>
                    <p>Cajero: {data.username}</p>
                    <p>{new Date(data.created_at).toLocaleString()}</p>
                </div>

                <hr className="border-dashed border-black my-1" />

                <div className="flex justify-between font-bold text-sm">
                    <span>Monto:</span>
                    <span>{formatCurrency(parseFloat(data.amount))}</span>
                </div>

                <hr className="border-dashed border-black my-1" />

                <div className="text-[10px]">
                    <p className="font-bold">Descripción:</p>
                    <p>{data.description}</p>
                </div>

                <div className="text-center mt-4 text-[10px] pb-8">
                    <p>--- Fin del Recibo ---</p>
                    <p>.</p>
                </div>
            </div>
        </>
    );
};
