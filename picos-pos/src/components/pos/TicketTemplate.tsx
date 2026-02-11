import React from 'react';
import type { Sale } from '../../types/models.types';
import { parseDecimal } from '../../utils/currency';

interface Props {
    sale: Sale | null;
}

export const TicketTemplate: React.FC<Props> = ({ sale }) => {
    if (!sale) return null;

    return (
        <div id="printable-area" className="hidden print:block fixed top-0 left-0 w-[50mm] bg-white text-black font-mono text-[11px] leading-tight">
            <div className="text-center mb-2 flex flex-col items-center">
                <img src="/logo_ticket.png" alt="Logo" className="w-16 grayscale mb-1" />
                <p>Ticket: #{sale.ticket_number}</p>
                <p>{new Date(sale.created_at).toLocaleString()}</p>
                <p className="font-bold">Atendido por: {sale.username}</p>
            </div>

            <hr className="border-dashed border-black my-1" />

            {sale.items.map((item) => (
                <div key={item.id} className="flex justify-between mb-1">
                    <div className="flex flex-col text-left">
                        <span>{item.product_name_snapshot}</span>
                        <span className="text-[9px]">{item.quantity} x ${item.unit_price_snapshot}</span>
                    </div>
                    <span>${item.item_subtotal}</span>
                </div>
            ))}

            <hr className="border-dashed border-black my-1" />

            <div className="flex justify-between font-bold text-xs">
                <span>TOTAL</span>
                <span>${sale.total_amount}</span>
            </div>

            <div className="text-right text-[10px] mt-1">
                {parseDecimal(sale.card_amount) > 0 && <p>Tarjeta: ${sale.card_amount}</p>}
                <p>Efectivo: ${sale.cash_received}</p>
                <p>Cambio: ${sale.change_given}</p>
            </div>
        </div>
    );
};
