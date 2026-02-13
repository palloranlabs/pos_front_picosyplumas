import React from 'react';
import type { Sale } from '../../types/models.types';
import { parseDecimal, formatCurrency } from '../../utils/currency';

interface Props {
    sale: Sale | null;
}

export const TicketTemplate: React.FC<Props> = ({ sale }) => {
    if (!sale) return null;

    const pointsUsed = parseDecimal(sale.loyalty_points_used || '0');
    const pointsEarned = parseDecimal(sale.loyalty_points_earned || '0');
    const hasLoyalty = pointsUsed > 0 || pointsEarned > 0;

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

            {/* Loyalty points section */}
            {pointsUsed > 0 && (
                <>
                    <hr className="border-dashed border-black my-1" />
                    <div className="text-[10px]">
                        <div className="flex justify-between">
                            <span>Puntos usados:</span>
                            <span>-{formatCurrency(pointsUsed)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Pagado con método:</span>
                            <span>{formatCurrency(parseDecimal(sale.total_amount) - pointsUsed)}</span>
                        </div>
                    </div>
                </>
            )}

            <div className="text-right text-[10px] mt-1">
                {parseDecimal(sale.card_amount) > 0 && <p>Tarjeta: {formatCurrency(parseDecimal(sale.card_amount))}</p>}
                {parseDecimal(sale.transfer_amount) > 0 && <p>Transferencia: {formatCurrency(parseDecimal(sale.transfer_amount))}</p>}
                {parseDecimal(sale.cash_received) > 0 && <p>Efectivo Recibido: {formatCurrency(parseDecimal(sale.cash_received))}</p>}
                {parseDecimal(sale.change_given) > 0 && <p>Cambio: {formatCurrency(parseDecimal(sale.change_given))}</p>}
            </div>

            {/* Customer & loyalty info */}
            {(sale.customer_phone || hasLoyalty) && (
                <>
                    <hr className="border-dashed border-black my-1" />
                    <div className="text-center text-[10px]">
                        {sale.customer_name && <p className="font-bold">Cliente: {sale.customer_name}</p>}
                        {sale.customer_phone && <p>Tel: {sale.customer_phone}</p>}
                        {pointsEarned > 0 && <p>Puntos acumulados: +{pointsEarned.toFixed(2)}</p>}
                        {pointsUsed > 0 && <p>Puntos canjeados: -{pointsUsed.toFixed(2)}</p>}
                    </div>
                </>
            )}
        </div>
    );
};
